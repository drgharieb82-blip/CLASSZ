from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_can, teacher_or_assistant_course_ids
from app.core.permissions import require_roles
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.grading import service
from app.modules.grading.schemas import ManualGradeAction, ManualGradeRead, ManualGradeReturn

router = APIRouter(prefix="/grading", tags=["grading"])

_GRADER_ROLES = (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT)


async def _assert_can_access_grade(
    session: AsyncSession, current_user: User, grade, not_found_detail: str, *, action: AssistantAction
) -> None:
    """Course-ownership/delegation check for TEACHER and ASSISTANT callers —
    ADMIN/SUPER_ADMIN remain platform-wide graders."""
    if current_user.role not in (Role.TEACHER, Role.ASSISTANT):
        return
    course_id = service.resolve_grade_course_id(grade)
    if course_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=not_found_detail)
    await assert_can(
        session, current_user, course_id, AssistantResource.GRADING, action, not_found_detail=not_found_detail
    )


@router.get("", response_model=list[ManualGradeRead])
async def list_all_grades(
    limit: int | None = Query(default=None, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_GRADER_ROLES),
) -> list[ManualGradeRead]:
    grades = await service.list_all_grades(session)
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        owned = set(
            await teacher_or_assistant_course_ids(session, current_user, AssistantResource.GRADING, AssistantAction.VIEW)
        )
        grades = [g for g in grades if service.resolve_grade_course_id(g) in owned]
    if limit is not None:
        grades = grades[offset : offset + limit]
    elif offset:
        grades = grades[offset:]
    return grades


@router.get("/pending", response_model=list[ManualGradeRead])
async def list_pending_grades(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_GRADER_ROLES),
) -> list[ManualGradeRead]:
    grades = await service.list_pending_grades(session)
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        owned = set(
            await teacher_or_assistant_course_ids(session, current_user, AssistantResource.GRADING, AssistantAction.VIEW)
        )
        grades = [g for g in grades if service.resolve_grade_course_id(g) in owned]
    return grades


@router.get("/{grade_id}", response_model=ManualGradeRead)
async def get_manual_grade(
    grade_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_GRADER_ROLES),
) -> ManualGradeRead:
    grade = await service.get_manual_grade(session, grade_id)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")
    await _assert_can_access_grade(session, current_user, grade, "Manual grade not found", action=AssistantAction.VIEW)

    return grade


@router.post("/{grade_id}/grade", response_model=ManualGradeRead)
async def grade_manual_grade(
    grade_id: UUID,
    payload: ManualGradeAction,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_GRADER_ROLES),
) -> ManualGradeRead:
    existing = await service.get_manual_grade(session, grade_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")
    await _assert_can_access_grade(
        session, current_user, existing, "Manual grade not found", action=AssistantAction.GRADE
    )

    payload.grader_id = current_user.id
    grade = await service.grade_manual_grade(session, grade_id, payload)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")

    return grade


@router.post("/{grade_id}/return", response_model=ManualGradeRead)
async def return_manual_grade(
    grade_id: UUID,
    payload: ManualGradeReturn,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_GRADER_ROLES),
) -> ManualGradeRead:
    existing = await service.get_manual_grade(session, grade_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")
    await _assert_can_access_grade(
        session, current_user, existing, "Manual grade not found", action=AssistantAction.GRADE
    )

    payload.grader_id = current_user.id
    grade = await service.return_manual_grade(session, grade_id, payload)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manual grade not found")

    return grade
