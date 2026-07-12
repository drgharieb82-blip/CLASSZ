from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_can
from app.db.session import get_db_session
from app.models.user import User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_student, get_current_teacher
from app.modules.students import service
from app.modules.students.schemas import (
    AtRiskEntry,
    CourseReportSummary,
    MemoryInsightEntry,
    ParentInviteCreate,
    ParentInviteRead,
    ParentLinkCodeRead,
    ParentLinkRequestRead,
    PodMemberAdd,
    StudentPodCreate,
    StudentPodRead,
    StudentPodUpdate,
    StudentProfileRead,
    StudentProfileUpdate,
    StudentProgressEntry,
    StudentRosterEntry,
    WrongQuestionEntry,
)

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me", response_model=StudentProfileRead)
async def get_my_profile(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentProfileRead:
    profile = await service.get_profile(session, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


@router.patch("/me", response_model=StudentProfileRead)
async def update_my_profile(
    payload: StudentProfileUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentProfileRead:
    return await service.update_profile(session, current_user.id, payload)


@router.get("/me/parent-link-code", response_model=ParentLinkCodeRead)
async def get_my_parent_link_code(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> ParentLinkCodeRead:
    code = await service.get_or_create_link_code(session, current_user.id)
    return ParentLinkCodeRead(code=code)


@router.post("/me/parent-link-code/regenerate", response_model=ParentLinkCodeRead)
async def regenerate_my_parent_link_code(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> ParentLinkCodeRead:
    code = await service.regenerate_link_code(session, current_user.id)
    return ParentLinkCodeRead(code=code)


@router.get("/me/parent-link-requests", response_model=list[ParentLinkRequestRead])
async def list_my_parent_link_requests(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[ParentLinkRequestRead]:
    return await service.list_pending_link_requests(session, current_user.id)


@router.post("/me/parent-link-requests/{link_id}/approve", response_model=ParentLinkRequestRead)
async def approve_parent_link_request(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> ParentLinkRequestRead:
    link = await service.decide_link_request(session, current_user.id, link_id, approve=True)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link request not found")
    parent = await session.get(User, link.parent_id)
    return ParentLinkRequestRead(
        id=link.id,
        parent_id=link.parent_id,
        parent_full_name=parent.full_name if parent else "",
        parent_public_code=parent.public_code if parent else "",
        status=link.status.value,
        requested_at=link.requested_at,
    )


@router.post("/me/parent-link-requests/{link_id}/deny", response_model=ParentLinkRequestRead)
async def deny_parent_link_request(
    link_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> ParentLinkRequestRead:
    link = await service.decide_link_request(session, current_user.id, link_id, approve=False)
    if link is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link request not found")
    parent = await session.get(User, link.parent_id)
    return ParentLinkRequestRead(
        id=link.id,
        parent_id=link.parent_id,
        parent_full_name=parent.full_name if parent else "",
        parent_public_code=parent.public_code if parent else "",
        status=link.status.value,
        requested_at=link.requested_at,
    )


@router.post("/me/parent-invites", response_model=ParentInviteRead, status_code=status.HTTP_201_CREATED)
async def create_my_parent_invite(
    payload: ParentInviteCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> ParentInviteRead:
    return await service.create_parent_invite(session, current_user.id, payload.email)


@router.get("/me/parent-invites", response_model=list[ParentInviteRead])
async def list_my_parent_invites(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[ParentInviteRead]:
    return await service.list_parent_invites(session, current_user.id)


@router.post("/me/parent-invites/{invite_id}/cancel", response_model=ParentInviteRead)
async def cancel_my_parent_invite(
    invite_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> ParentInviteRead:
    invite = await service.cancel_parent_invite(session, current_user.id, invite_id)
    if invite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    return invite


@router.get("/roster", response_model=list[StudentRosterEntry])
async def get_roster(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[StudentRosterEntry]:
    await assert_can(session, current_user, course_id, AssistantResource.STUDENTS_DATA, AssistantAction.VIEW)
    return await service.list_roster(session, course_id)


@router.get("/progress", response_model=list[StudentProgressEntry])
async def get_progress(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[StudentProgressEntry]:
    await assert_can(session, current_user, course_id, AssistantResource.STUDENTS_DATA, AssistantAction.VIEW)
    return await service.list_progress(session, course_id)


@router.get("/at-risk", response_model=list[AtRiskEntry])
async def get_at_risk(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[AtRiskEntry]:
    await assert_can(session, current_user, course_id, AssistantResource.STUDENTS_DATA, AssistantAction.VIEW)
    return await service.list_at_risk(session, course_id)


@router.get("/wrong-questions", response_model=list[WrongQuestionEntry])
async def get_wrong_questions(
    course_id: UUID = Query(...),
    student_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[WrongQuestionEntry]:
    await assert_can(session, current_user, course_id, AssistantResource.STUDENTS_DATA, AssistantAction.VIEW)
    return await service.list_wrong_questions(session, course_id, student_id)


@router.get("/memory", response_model=list[MemoryInsightEntry])
async def get_memory_insights(
    course_id: UUID = Query(...),
    student_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[MemoryInsightEntry]:
    await assert_can(session, current_user, course_id, AssistantResource.STUDENTS_DATA, AssistantAction.VIEW)
    return await service.list_memory_insights(session, course_id, student_id)


@router.get("/reports", response_model=CourseReportSummary)
async def get_report_summary(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> CourseReportSummary:
    await assert_can(session, current_user, course_id, AssistantResource.STUDENTS_DATA, AssistantAction.VIEW)
    return await service.course_report_summary(session, course_id)


# ---------------------------------------------------------------------------
# Pods
# ---------------------------------------------------------------------------


async def _assert_owns_pod(
    session: AsyncSession, pod_id: UUID, current_user: User, *, action: AssistantAction = AssistantAction.EDIT
) -> None:
    pod = await service.get_pod(session, pod_id)
    if pod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod not found")
    await assert_can(session, current_user, pod.course_id, AssistantResource.PODS, action, not_found_detail="Pod not found")


@router.get("/pods", response_model=list[StudentPodRead])
async def list_pods(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[StudentPodRead]:
    await assert_can(session, current_user, course_id, AssistantResource.PODS, AssistantAction.VIEW)
    return await service.list_pods(session, course_id)


@router.post("/pods", response_model=StudentPodRead, status_code=status.HTTP_201_CREATED)
async def create_pod(
    payload: StudentPodCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> StudentPodRead:
    await assert_can(session, current_user, payload.course_id, AssistantResource.PODS, AssistantAction.CREATE)
    return await service.create_pod(session, payload)


@router.patch("/pods/{pod_id}", response_model=StudentPodRead)
async def update_pod(
    pod_id: UUID,
    payload: StudentPodUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> StudentPodRead:
    await _assert_owns_pod(session, pod_id, current_user)
    pod = await service.update_pod(session, pod_id, payload)
    if pod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod not found")
    return pod


@router.delete("/pods/{pod_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pod(
    pod_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await _assert_owns_pod(session, pod_id, current_user, action=AssistantAction.DELETE)
    if not await service.delete_pod(session, pod_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod not found")


@router.post("/pods/{pod_id}/members", response_model=StudentPodRead, status_code=status.HTTP_201_CREATED)
async def add_pod_member(
    pod_id: UUID,
    payload: PodMemberAdd,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> StudentPodRead:
    await _assert_owns_pod(session, pod_id, current_user)
    pod = await service.add_pod_member(session, pod_id, payload)
    if pod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod not found")
    return pod


@router.delete("/pods/{pod_id}/members/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_pod_member(
    pod_id: UUID,
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await _assert_owns_pod(session, pod_id, current_user)
    if not await service.remove_pod_member(session, pod_id, student_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod member not found")
