from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_can, assert_parent_linked_to_student, assert_teaches_student
from app.db.session import get_db_session
from app.models.user import User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.assignments import service as assignments_service
from app.modules.assignments.schemas import AssignmentRead
from app.modules.auth.dependencies import get_current_parent, get_current_teacher, get_current_user
from app.modules.parents import service
from app.modules.parents.schemas import (
    LinkedChildRead,
    LinkInvitationRead,
    ParentContactCreate,
    ParentContactRead,
    ParentContactUpdate,
    ParentLinkRequestCreate,
    ParentRequestCreate,
    ParentRequestRead,
    ParentRequestReply,
)
from app.modules.progress import service as progress_service
from app.modules.progress.schemas import CourseProgressRead, StudentProgressSummaryRead
from app.modules.student_portal import service as student_portal_service
from app.modules.student_portal.schemas import StudentDashboardSummaryRead

router = APIRouter(prefix="/parents", tags=["parents"])


async def _assert_owns_contact(
    session: AsyncSession, contact_id: UUID, current_user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    contact = await service.get_contact(session, contact_id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent contact not found")
    await assert_teaches_student(session, contact.student_id, current_user, assistant_action=action)


@router.get("", response_model=list[ParentContactRead])
async def list_contacts(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[ParentContactRead]:
    await assert_can(session, current_user, course_id, AssistantResource.PARENT_CONTACTS, AssistantAction.VIEW)
    return await service.list_contacts_for_course(session, course_id)


@router.post("", response_model=ParentContactRead, status_code=status.HTTP_201_CREATED)
async def create_contact(
    payload: ParentContactCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> ParentContactRead:
    await assert_teaches_student(session, payload.student_id, current_user, assistant_action=AssistantAction.CREATE)
    return await service.create_contact(session, payload)


@router.patch("/{contact_id}", response_model=ParentContactRead)
async def update_contact(
    contact_id: UUID,
    payload: ParentContactUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> ParentContactRead:
    await _assert_owns_contact(session, contact_id, current_user)
    updated = await service.update_contact(session, contact_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent contact not found")
    return updated


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await _assert_owns_contact(session, contact_id, current_user, action=AssistantAction.DELETE)
    if not await service.delete_contact(session, contact_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent contact not found")


# ---------------------------------------------------------------------------
# Parent<->student linking (parent side)
# ---------------------------------------------------------------------------


@router.post("/me/link-requests", response_model=LinkedChildRead, status_code=status.HTTP_201_CREATED)
async def submit_link_request(
    payload: ParentLinkRequestCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> LinkedChildRead:
    link = await service.submit_link_request(session, current_user.id, payload.code)
    children = await service.list_linked_children(session, current_user.id)
    match = next((c for c in children if c.link_id == link.id), None)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link request not found")
    return match


@router.get("/me/children", response_model=list[LinkedChildRead])
async def list_my_children(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> list[LinkedChildRead]:
    return await service.list_linked_children(session, current_user.id)


@router.get("/me/link-invitations", response_model=list[LinkInvitationRead])
async def list_my_link_invitations(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> list[LinkInvitationRead]:
    return await service.list_link_invitations(session, current_user.id)


@router.post("/me/link-invitations/{link_id}/accept", response_model=LinkInvitationRead)
async def accept_link_invitation(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> LinkInvitationRead:
    link = await service.decide_link_invitation(session, current_user.id, link_id, accept=True)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    student = await session.get(User, link.student_id)
    return LinkInvitationRead(
        link_id=link.id,
        student_id=link.student_id,
        student_full_name=student.full_name if student else "",
        student_public_code=student.public_code if student else "",
        requested_at=link.requested_at,
    )


@router.post("/me/link-invitations/{link_id}/decline", response_model=LinkInvitationRead)
async def decline_link_invitation(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> LinkInvitationRead:
    link = await service.decide_link_invitation(session, current_user.id, link_id, accept=False)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    student = await session.get(User, link.student_id)
    return LinkInvitationRead(
        link_id=link.id,
        student_id=link.student_id,
        student_full_name=student.full_name if student else "",
        student_public_code=student.public_code if student else "",
        requested_at=link.requested_at,
    )


# ---------------------------------------------------------------------------
# Parent views of a linked child (read-only, reuses existing student-facing
# service functions once ownership is verified)
# ---------------------------------------------------------------------------


@router.get("/me/children/{student_id}/dashboard", response_model=StudentDashboardSummaryRead)
async def get_child_dashboard(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> StudentDashboardSummaryRead:
    await assert_parent_linked_to_student(session, student_id, current_user)
    return await student_portal_service.get_student_dashboard_summary(session, student_id)


@router.get("/me/children/{student_id}/progress", response_model=StudentProgressSummaryRead)
async def get_child_progress(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> StudentProgressSummaryRead:
    await assert_parent_linked_to_student(session, student_id, current_user)
    return await progress_service.get_student_progress_summary(session, student_id)


@router.get("/me/children/{student_id}/attendance", response_model=dict[UUID, CourseProgressRead])
async def get_child_attendance(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> dict[UUID, CourseProgressRead]:
    """Named "attendance" for the parent-facing UI, but backed by session-
    completion/progress data — there is no roll-call attendance system."""
    await assert_parent_linked_to_student(session, student_id, current_user)
    return await progress_service.get_student_course_progress_map(session, student_id)


@router.get("/me/children/{student_id}/homework", response_model=list[AssignmentRead])
async def get_child_homework(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> list[AssignmentRead]:
    await assert_parent_linked_to_student(session, student_id, current_user)
    assignments = await assignments_service.list_assignments_for_student(session, student_id)
    return [assignments_service.scope_submissions_to_student(a, student_id) for a in assignments]


# ---------------------------------------------------------------------------
# Parent requests (lightweight one-message-one-reply tickets)
# ---------------------------------------------------------------------------


@router.post("/me/requests", response_model=ParentRequestRead, status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: ParentRequestCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> ParentRequestRead:
    await assert_parent_linked_to_student(session, payload.student_id, current_user)
    return await service.create_request(session, current_user.id, payload)


@router.get("/me/requests", response_model=list[ParentRequestRead])
async def list_my_requests(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> list[ParentRequestRead]:
    return await service.list_own_requests(session, current_user.id)


@router.post("/me/requests/{request_id}/close", response_model=ParentRequestRead)
async def close_my_request(
    request_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_parent),
) -> ParentRequestRead:
    request = await service.close_request(session, request_id, current_user.id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return request


@router.post("/requests/{request_id}/reply", response_model=ParentRequestRead)
async def reply_to_request(
    request_id: UUID,
    payload: ParentRequestReply,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> ParentRequestRead:
    request = await service.reply_to_request(session, request_id, current_user, payload.reply_body)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return request
