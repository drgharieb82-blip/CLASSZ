from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Role, User
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.notifications import service as notifications_service
from app.modules.parents.models import (
    LinkInitiator,
    ParentContact,
    ParentLinkStatus,
    ParentRequest,
    ParentRequestStatus,
    ParentRequestTargetType,
    ParentStudentLink,
)
from app.modules.parents.schemas import (
    LinkedChildRead,
    LinkInvitationRead,
    ParentContactCreate,
    ParentContactRead,
    ParentContactUpdate,
    ParentRequestCreate,
)
from app.modules.students.models import Student


def _to_read(contact: ParentContact, student_name: str) -> ParentContactRead:
    return ParentContactRead(
        id=contact.id,
        student_id=contact.student_id,
        student_name=student_name,
        name=contact.name,
        relation=contact.relation,
        phone=contact.phone,
        whatsapp=contact.whatsapp,
        email=contact.email,
        last_contact_at=contact.last_contact_at,
        alert_status=contact.alert_status,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
    )


async def list_contacts_for_course(session: AsyncSession, course_id: UUID) -> list[ParentContactRead]:
    result = await session.execute(
        select(ParentContact, User.full_name)
        .join(User, User.id == ParentContact.student_id)
        .join(Enrollment, Enrollment.student_id == ParentContact.student_id)
        .where(Enrollment.course_id == course_id)
        .order_by(ParentContact.created_at.desc())
    )
    return [_to_read(contact, full_name) for contact, full_name in result.all()]


async def get_contact(session: AsyncSession, contact_id: UUID) -> ParentContact | None:
    return await session.get(ParentContact, contact_id)


async def create_contact(session: AsyncSession, payload: ParentContactCreate) -> ParentContactRead:
    contact = ParentContact(
        student_id=payload.student_id,
        name=payload.name,
        relation=payload.relation,
        phone=payload.phone,
        whatsapp=payload.whatsapp,
        email=payload.email,
    )
    session.add(contact)
    await session.commit()
    await session.refresh(contact)
    student = await session.get(User, payload.student_id)
    return _to_read(contact, student.full_name if student else "")


async def update_contact(session: AsyncSession, contact_id: UUID, payload: ParentContactUpdate) -> ParentContactRead | None:
    contact = await get_contact(session, contact_id)
    if contact is None:
        return None
    for field in ("name", "relation", "phone", "whatsapp", "email", "last_contact_at", "alert_status"):
        value = getattr(payload, field)
        if value is not None:
            setattr(contact, field, value)
    await session.commit()
    await session.refresh(contact)
    student = await session.get(User, contact.student_id)
    return _to_read(contact, student.full_name if student else "")


async def delete_contact(session: AsyncSession, contact_id: UUID) -> bool:
    contact = await session.get(ParentContact, contact_id)
    if contact is None:
        return False
    await session.delete(contact)
    await session.commit()
    return True


# ---------------------------------------------------------------------------
# Parent<->student linking (parent side)
# ---------------------------------------------------------------------------


async def submit_link_request(session: AsyncSession, parent_id: UUID, code: str) -> ParentStudentLink:
    student_result = await session.execute(select(Student).where(Student.parent_link_code == code))
    student = student_result.scalar_one_or_none()
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid link code")

    link_result = await session.execute(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == parent_id, ParentStudentLink.student_id == student.user_id
        )
    )
    link = link_result.scalar_one_or_none()
    if link is None:
        link = ParentStudentLink(
            parent_id=parent_id,
            student_id=student.user_id,
            status=ParentLinkStatus.PENDING,
            initiated_by=LinkInitiator.PARENT_CODE,
        )
        session.add(link)
    elif link.status in (ParentLinkStatus.REVOKED, ParentLinkStatus.DENIED):
        link.status = ParentLinkStatus.PENDING
        link.initiated_by = LinkInitiator.PARENT_CODE
        link.decided_at = None
    await session.commit()
    await session.refresh(link)

    parent = await session.get(User, parent_id)
    parent_name = parent.full_name if parent else "A parent"
    await notifications_service.create_notification(
        session, notifications_service.notify_link_requested(student.user_id, parent_name)
    )
    return link


async def list_linked_children(session: AsyncSession, parent_id: UUID) -> list[LinkedChildRead]:
    # Outer join to Student — a student may not have a profile row yet (it's
    # only created lazily, e.g. the first time they fetch their link code,
    # or during registration), but a link can already exist via the
    # student-invite direction, which never touches the Student table.
    result = await session.execute(
        select(ParentStudentLink, User, Student)
        .join(User, User.id == ParentStudentLink.student_id)
        .outerjoin(Student, Student.user_id == ParentStudentLink.student_id)
        .where(
            ParentStudentLink.parent_id == parent_id,
            (ParentStudentLink.status == ParentLinkStatus.ACTIVE)
            | (
                (ParentStudentLink.status == ParentLinkStatus.PENDING)
                & (ParentStudentLink.initiated_by == LinkInitiator.PARENT_CODE)
            ),
        )
        .order_by(ParentStudentLink.requested_at.desc())
    )
    return [
        LinkedChildRead(
            link_id=link.id,
            student_id=user.id,
            full_name=user.full_name,
            public_code=user.public_code,
            avatar=student.avatar if student is not None else None,
            status=link.status.value,
        )
        for link, user, student in result.all()
    ]


async def list_link_invitations(session: AsyncSession, parent_id: UUID) -> list[LinkInvitationRead]:
    result = await session.execute(
        select(ParentStudentLink, User)
        .join(User, User.id == ParentStudentLink.student_id)
        .where(
            ParentStudentLink.parent_id == parent_id,
            ParentStudentLink.status == ParentLinkStatus.PENDING,
            ParentStudentLink.initiated_by == LinkInitiator.STUDENT_INVITE,
        )
        .order_by(ParentStudentLink.requested_at.desc())
    )
    return [
        LinkInvitationRead(
            link_id=link.id,
            student_id=student_user.id,
            student_full_name=student_user.full_name,
            student_public_code=student_user.public_code,
            requested_at=link.requested_at,
        )
        for link, student_user in result.all()
    ]


async def decide_link_invitation(
    session: AsyncSession, parent_id: UUID, link_id: UUID, accept: bool
) -> ParentStudentLink | None:
    link = await session.get(ParentStudentLink, link_id)
    if link is None or link.parent_id != parent_id or link.initiated_by != LinkInitiator.STUDENT_INVITE:
        return None

    link.status = ParentLinkStatus.ACTIVE if accept else ParentLinkStatus.DENIED
    link.decided_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(link)

    parent = await session.get(User, parent_id)
    parent_name = parent.full_name if parent else "The parent"
    await notifications_service.create_notification(
        session, notifications_service.notify_link_decided(link.student_id, parent_name, accept)
    )
    return link


async def get_active_parent_ids_for_student(session: AsyncSession, student_id: UUID) -> list[UUID]:
    result = await session.execute(
        select(ParentStudentLink.parent_id).where(
            ParentStudentLink.student_id == student_id,
            ParentStudentLink.status == ParentLinkStatus.ACTIVE,
        )
    )
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Parent requests (lightweight one-message-one-reply tickets)
# ---------------------------------------------------------------------------


async def create_request(session: AsyncSession, parent_id: UUID, payload: ParentRequestCreate) -> ParentRequest:
    teacher_id = payload.teacher_id
    if payload.target_type == ParentRequestTargetType.TEACHER and teacher_id is None and payload.course_id is not None:
        course = await session.get(Course, payload.course_id)
        teacher_id = course.teacher_id if course is not None else None

    request = ParentRequest(
        parent_id=parent_id,
        student_id=payload.student_id,
        target_type=payload.target_type,
        teacher_id=teacher_id,
        course_id=payload.course_id,
        subject=payload.subject,
        body=payload.body,
    )
    session.add(request)
    await session.commit()
    await session.refresh(request)

    if payload.target_type == ParentRequestTargetType.TEACHER and teacher_id is not None:
        await notifications_service.create_notification(
            session, notifications_service.notify_request_created(teacher_id, payload.subject)
        )
    elif payload.target_type == ParentRequestTargetType.CHILD:
        await notifications_service.create_notification(
            session, notifications_service.notify_request_created(payload.student_id, payload.subject)
        )
    # PLATFORM target: no single recipient to notify — no admin-broadcast
    # mechanism exists yet; the request is still visible via the admin's
    # general access to the parents module if/when that surface is built.

    return request


async def list_own_requests(session: AsyncSession, parent_id: UUID) -> list[ParentRequest]:
    result = await session.execute(
        select(ParentRequest).where(ParentRequest.parent_id == parent_id).order_by(ParentRequest.created_at.desc())
    )
    return list(result.scalars().all())


async def reply_to_request(session: AsyncSession, request_id: UUID, replier: User, reply_body: str) -> ParentRequest | None:
    request = await session.get(ParentRequest, request_id)
    if request is None:
        return None

    admin_roles = (Role.ADMIN, Role.SUPER_ADMIN)
    if request.target_type == ParentRequestTargetType.TEACHER:
        allowed = replier.id == request.teacher_id or replier.role in admin_roles
    elif request.target_type == ParentRequestTargetType.PLATFORM:
        allowed = replier.role in admin_roles
    else:  # CHILD
        allowed = replier.id == request.student_id or replier.role in admin_roles
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to reply to this request")

    request.reply_body = reply_body
    request.replied_by = replier.id
    request.replied_at = datetime.now(timezone.utc)
    request.status = ParentRequestStatus.REPLIED
    await session.commit()
    await session.refresh(request)

    await notifications_service.create_notification(
        session, notifications_service.notify_request_replied(request.parent_id, request.subject)
    )
    return request


async def close_request(session: AsyncSession, request_id: UUID, parent_id: UUID) -> ParentRequest | None:
    request = await session.get(ParentRequest, request_id)
    if request is None or request.parent_id != parent_id:
        return None
    request.status = ParentRequestStatus.CLOSED
    await session.commit()
    await session.refresh(request)
    return request
