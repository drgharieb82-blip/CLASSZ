from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Role, User
from app.modules.assistants.models import (
    AssistantInvite,
    AssistantInviteStatus,
    AssistantLinkStatus,
    AssistantPermission,
    TeacherAssistantLink,
)
from app.modules.assistants.schemas import (
    AssistantInvitationRead,
    AssistantLinkRead,
    AssistantPermissionGrant,
    AssistantTeacherPermissionsRead,
)
from app.modules.notifications import service as notifications_service


async def invite_assistant(session: AsyncSession, teacher_id: UUID, email: str) -> AssistantInvite:
    normalized_email = email.strip().lower()

    assistant_result = await session.execute(
        select(User).where(User.email == normalized_email, User.role == Role.ASSISTANT)
    )
    assistant = assistant_result.scalar_one_or_none()

    invite = AssistantInvite(teacher_id=teacher_id, invited_email=normalized_email)
    session.add(invite)
    await session.flush()

    if assistant is not None:
        link_result = await session.execute(
            select(TeacherAssistantLink).where(
                TeacherAssistantLink.teacher_id == teacher_id,
                TeacherAssistantLink.assistant_id == assistant.id,
            )
        )
        link = link_result.scalar_one_or_none()
        if link is None:
            link = TeacherAssistantLink(
                teacher_id=teacher_id, assistant_id=assistant.id, status=AssistantLinkStatus.PENDING
            )
            session.add(link)
        elif link.status in (AssistantLinkStatus.REVOKED, AssistantLinkStatus.DENIED):
            link.status = AssistantLinkStatus.PENDING
            link.decided_at = None
        await session.flush()

        invite.status = AssistantInviteStatus.MATCHED
        invite.resolved_link_id = link.id
        invite.resolved_at = datetime.now(timezone.utc)
        await session.commit()

        teacher = await session.get(User, teacher_id)
        teacher_name = teacher.full_name if teacher else "A teacher"
        await notifications_service.create_notification(
            session, notifications_service.notify_assistant_invited(assistant.id, teacher_name)
        )
    else:
        await session.commit()

    await session.refresh(invite)
    return invite


async def list_my_invites(session: AsyncSession, teacher_id: UUID) -> list[AssistantInvite]:
    result = await session.execute(
        select(AssistantInvite).where(AssistantInvite.teacher_id == teacher_id).order_by(AssistantInvite.created_at.desc())
    )
    return list(result.scalars().all())


async def cancel_invite(session: AsyncSession, teacher_id: UUID, invite_id: UUID) -> AssistantInvite | None:
    invite = await session.get(AssistantInvite, invite_id)
    if invite is None or invite.teacher_id != teacher_id or invite.status != AssistantInviteStatus.PENDING:
        return None
    invite.status = AssistantInviteStatus.CANCELLED
    await session.commit()
    await session.refresh(invite)
    return invite


async def list_my_assistants(session: AsyncSession, teacher_id: UUID) -> list[AssistantLinkRead]:
    result = await session.execute(
        select(TeacherAssistantLink, User)
        .join(User, User.id == TeacherAssistantLink.assistant_id)
        .where(
            TeacherAssistantLink.teacher_id == teacher_id,
            TeacherAssistantLink.status.in_([AssistantLinkStatus.PENDING, AssistantLinkStatus.ACTIVE]),
        )
        .order_by(TeacherAssistantLink.invited_at.desc())
    )
    return [
        AssistantLinkRead(
            link_id=link.id,
            assistant_id=user.id,
            full_name=user.full_name,
            public_code=user.public_code,
            status=link.status.value,
        )
        for link, user in result.all()
    ]


async def list_my_invitations(session: AsyncSession, assistant_id: UUID) -> list[AssistantInvitationRead]:
    result = await session.execute(
        select(TeacherAssistantLink, User)
        .join(User, User.id == TeacherAssistantLink.teacher_id)
        .where(
            TeacherAssistantLink.assistant_id == assistant_id,
            TeacherAssistantLink.status == AssistantLinkStatus.PENDING,
        )
        .order_by(TeacherAssistantLink.invited_at.desc())
    )
    return [
        AssistantInvitationRead(
            link_id=link.id,
            teacher_id=teacher.id,
            teacher_full_name=teacher.full_name,
            teacher_public_code=teacher.public_code,
            invited_at=link.invited_at,
        )
        for link, teacher in result.all()
    ]


async def decide_invitation(
    session: AsyncSession, assistant_id: UUID, link_id: UUID, accept: bool
) -> TeacherAssistantLink | None:
    link = await session.get(TeacherAssistantLink, link_id)
    if link is None or link.assistant_id != assistant_id or link.status != AssistantLinkStatus.PENDING:
        return None

    link.status = AssistantLinkStatus.ACTIVE if accept else AssistantLinkStatus.DENIED
    link.decided_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(link)

    assistant = await session.get(User, assistant_id)
    assistant_name = assistant.full_name if assistant else "The assistant"
    await notifications_service.create_notification(
        session, notifications_service.notify_assistant_link_decided(link.teacher_id, assistant_name, accept)
    )
    return link


async def revoke_link(session: AsyncSession, teacher_id: UUID, link_id: UUID) -> TeacherAssistantLink | None:
    link = await session.get(TeacherAssistantLink, link_id)
    if link is None or link.teacher_id != teacher_id:
        return None
    link.status = AssistantLinkStatus.REVOKED
    link.decided_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(link)
    return link


async def update_permissions(
    session: AsyncSession, teacher_id: UUID, link_id: UUID, grants: list[AssistantPermissionGrant]
) -> list[AssistantPermissionGrant] | None:
    """Full-replace semantics — the given grant list becomes the entire
    permission set for this link."""
    link = await session.get(TeacherAssistantLink, link_id)
    if link is None or link.teacher_id != teacher_id:
        return None

    existing_result = await session.execute(
        select(AssistantPermission).where(AssistantPermission.link_id == link_id)
    )
    for existing in existing_result.scalars().all():
        await session.delete(existing)
    await session.flush()

    for grant in grants:
        session.add(AssistantPermission(link_id=link_id, resource=grant.resource, action=grant.action))

    await session.commit()
    return grants


async def get_link_permissions(session: AsyncSession, teacher_id: UUID, link_id: UUID) -> list[AssistantPermissionGrant] | None:
    link = await session.get(TeacherAssistantLink, link_id)
    if link is None or link.teacher_id != teacher_id:
        return None
    result = await session.execute(
        select(AssistantPermission).where(AssistantPermission.link_id == link_id)
    )
    return [
        AssistantPermissionGrant(resource=p.resource, action=p.action) for p in result.scalars().all()
    ]


async def get_my_permissions(session: AsyncSession, assistant_id: UUID) -> list[AssistantTeacherPermissionsRead]:
    result = await session.execute(
        select(TeacherAssistantLink, User)
        .join(User, User.id == TeacherAssistantLink.teacher_id)
        .where(
            TeacherAssistantLink.assistant_id == assistant_id,
            TeacherAssistantLink.status == AssistantLinkStatus.ACTIVE,
        )
    )
    links = result.all()

    output: list[AssistantTeacherPermissionsRead] = []
    for link, teacher in links:
        perm_result = await session.execute(
            select(AssistantPermission).where(AssistantPermission.link_id == link.id)
        )
        permissions = [
            AssistantPermissionGrant(resource=p.resource, action=p.action) for p in perm_result.scalars().all()
        ]
        output.append(
            AssistantTeacherPermissionsRead(
                teacher_id=teacher.id, teacher_full_name=teacher.full_name, permissions=permissions
            )
        )
    return output
