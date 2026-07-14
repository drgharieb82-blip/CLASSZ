import logging
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.identity import EntityType, format_public_code
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import Role, User
from app.modules.auth.models import PasswordResetToken, RefreshToken
from app.modules.auth.schemas import RegisterRequest
from app.modules.assistants.models import (
    AssistantInvite,
    AssistantInviteStatus,
    AssistantLinkStatus,
    TeacherAssistantLink,
)
from app.modules.notifications import service as notifications_service
from app.modules.parents.models import (
    LinkInitiator,
    ParentContact,
    ParentInvite,
    ParentInviteStatus,
    ParentLinkStatus,
    ParentStudentLink,
)
from app.modules.students.models import Student

logger = logging.getLogger(__name__)

_RESET_TOKEN_TTL_MINUTES = 30


def issue_access_token(user_id: str, role: Role) -> str:
    return create_access_token(subject=user_id, claims={"role": role.value})


async def issue_refresh_token(session: AsyncSession, user_id: UUID) -> str:
    raw_token = secrets.token_urlsafe(48)
    expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    session.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_password(raw_token),
            expires_at=expires_at,
        )
    )
    await session.commit()
    return raw_token


async def rotate_refresh_token(session: AsyncSession, raw_token: str) -> tuple[User, str, str] | None:
    """Validates a refresh token, revokes it, and issues a fresh
    access+refresh token pair. Returns None if the token is missing,
    expired, or already revoked."""
    now = datetime.now(UTC)
    result = await session.execute(
        select(RefreshToken).where(
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
        )
    )
    matching = next(
        (candidate for candidate in result.scalars().all() if verify_password(raw_token, candidate.token_hash)),
        None,
    )
    if matching is None:
        return None

    user = await session.get(User, matching.user_id)
    if user is None or not user.is_active:
        return None

    matching.revoked_at = now
    await session.commit()

    new_access_token = issue_access_token(str(user.id), user.role)
    new_refresh_token = await issue_refresh_token(session, user.id)
    return user, new_access_token, new_refresh_token


async def revoke_refresh_token(session: AsyncSession, raw_token: str) -> None:
    """Best-effort logout — silently no-ops if the token doesn't match
    anything (already revoked, expired, or malformed)."""
    now = datetime.now(UTC)
    result = await session.execute(select(RefreshToken).where(RefreshToken.revoked_at.is_(None)))
    matching = next(
        (candidate for candidate in result.scalars().all() if verify_password(raw_token, candidate.token_hash)),
        None,
    )
    if matching is not None:
        matching.revoked_at = now
        await session.commit()


async def authenticate_user(
    email: str, password: str, session: AsyncSession
) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user


async def _next_self_registered_public_code(
    session: AsyncSession,
    role: Role,
) -> str:
    if role == Role.STUDENT:
        entity_type = EntityType.STUDENT
        sequence_name = "seq_student_code"
    elif role == Role.PARENT:
        entity_type = EntityType.PARENT
        sequence_name = "seq_parent_code"
    elif role == Role.ASSISTANT:
        entity_type = EntityType.ASSISTANT
        sequence_name = "seq_assistant_code"
    else:
        entity_type = EntityType.STUDENT
        sequence_name = "seq_student_code"

    result = await session.execute(text(f"SELECT nextval('{sequence_name}')"))
    sequence = int(result.scalar_one())
    return format_public_code(entity_type, sequence)


async def register_user(data: RegisterRequest, session: AsyncSession) -> tuple[User, Student | None]:
    public_code = await _next_self_registered_public_code(session, data.role)
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
        public_code=public_code,
    )
    session.add(user)
    await session.flush()  # assigns user.id without ending the transaction

    student: Student | None = None
    if data.role == Role.STUDENT:
        student = Student(
            user_id=user.id,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            national_id=data.national_id,
            whatsapp=data.whatsapp,
            nickname=data.nickname,
            avatar=data.avatar,
        )
        session.add(student)

        if data.parent_name:
            session.add(
                ParentContact(
                    student_id=user.id,
                    name=data.parent_name,
                    relation=data.parent_relation or "Other",
                    whatsapp=data.parent_whatsapp,
                )
            )

    await session.commit()
    await session.refresh(user)
    if student is not None:
        await session.refresh(student)

    if data.role == Role.PARENT:
        await _resolve_pending_invites_for_new_parent(session, user)
    elif data.role == Role.ASSISTANT:
        await _resolve_pending_invites_for_new_assistant(session, user)

    return user, student


async def _resolve_pending_invites_for_new_parent(session: AsyncSession, parent: User) -> None:
    """Auto-links any student-sent invites addressed to this parent's email
    that were pending before this account existed (see
    `students.service.create_parent_invite`)."""
    normalized_email = parent.email.strip().lower()
    result = await session.execute(
        select(ParentInvite).where(
            ParentInvite.invited_email == normalized_email,
            ParentInvite.status == ParentInviteStatus.PENDING,
        )
    )
    invites = list(result.scalars().all())
    if not invites:
        return

    linked_student_ids: dict[UUID, ParentStudentLink] = {}
    for invite in invites:
        link = linked_student_ids.get(invite.student_id)
        if link is None:
            link = ParentStudentLink(
                parent_id=parent.id,
                student_id=invite.student_id,
                status=ParentLinkStatus.PENDING,
                initiated_by=LinkInitiator.STUDENT_INVITE,
            )
            session.add(link)
            await session.flush()
            linked_student_ids[invite.student_id] = link
        invite.status = ParentInviteStatus.MATCHED
        invite.resolved_link_id = link.id
        invite.resolved_at = datetime.now(UTC)

    await session.commit()

    for student_id in linked_student_ids:
        student = await session.get(User, student_id)
        student_name = student.full_name if student else "A student"
        await notifications_service.create_notification(
            session, notifications_service.notify_invite_received(parent.id, student_name)
        )


async def _resolve_pending_invites_for_new_assistant(session: AsyncSession, assistant: User) -> None:
    """Auto-links any teacher-sent invites addressed to this assistant's
    email that were pending before this account existed (see
    `assistants.service.invite_assistant`)."""
    normalized_email = assistant.email.strip().lower()
    result = await session.execute(
        select(AssistantInvite).where(
            AssistantInvite.invited_email == normalized_email,
            AssistantInvite.status == AssistantInviteStatus.PENDING,
        )
    )
    invites = list(result.scalars().all())
    if not invites:
        return

    linked_teacher_ids: dict[UUID, TeacherAssistantLink] = {}
    for invite in invites:
        link = linked_teacher_ids.get(invite.teacher_id)
        if link is None:
            link = TeacherAssistantLink(
                teacher_id=invite.teacher_id,
                assistant_id=assistant.id,
                status=AssistantLinkStatus.PENDING,
            )
            session.add(link)
            await session.flush()
            linked_teacher_ids[invite.teacher_id] = link
        invite.status = AssistantInviteStatus.MATCHED
        invite.resolved_link_id = link.id
        invite.resolved_at = datetime.now(UTC)

    await session.commit()

    for teacher_id in linked_teacher_ids:
        teacher = await session.get(User, teacher_id)
        teacher_name = teacher.full_name if teacher else "A teacher"
        await notifications_service.create_notification(
            session, notifications_service.notify_assistant_invited(assistant.id, teacher_name)
        )


async def request_password_reset(session: AsyncSession, email: str) -> None:
    """Always returns without error, whether or not the email exists —
    responses must not reveal account existence. No email/SMS transport is
    wired up yet, so the raw token is logged server-side rather than
    delivered; the hash stored in the DB can't be used to complete a reset
    on its own."""
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        return

    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(UTC) + timedelta(minutes=_RESET_TOKEN_TTL_MINUTES)
    session.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_password(raw_token),
            expires_at=expires_at,
        )
    )
    await session.commit()

    logger.info(
        "Password reset requested for %s — token=%s (expires in %s min). "
        "No email/SMS transport is configured yet; deliver this manually until one is wired up.",
        email,
        raw_token,
        _RESET_TOKEN_TTL_MINUTES,
    )


async def reset_password(session: AsyncSession, raw_token: str, new_password: str) -> bool:
    now = datetime.now(UTC)
    result = await session.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
    )
    matching = next(
        (candidate for candidate in result.scalars().all() if verify_password(raw_token, candidate.token_hash)),
        None,
    )
    if matching is None:
        return False

    user = await session.get(User, matching.user_id)
    if user is None:
        return False

    user.hashed_password = hash_password(new_password)
    matching.used_at = now
    await session.commit()
    return True
