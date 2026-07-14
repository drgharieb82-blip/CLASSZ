from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_can, assert_student_enrolled_in_course, teacher_or_assistant_course_ids
from app.core.permissions import require_roles
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_student, get_current_user
from app.modules.assignments import service
from app.modules.assignments.schemas import (
    AssignmentCreate,
    AssignmentRead,
    AssignmentSubmissionCreate,
    AssignmentSubmissionRead,
)

router = APIRouter(prefix="/assignments", tags=["assignments"])

_STAFF_ROLES = (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT)


def _scope_submissions(assignment, current_user: User) -> AssignmentRead:
    if current_user.role == Role.STUDENT:
        return service.scope_submissions_to_student(assignment, current_user.id)
    return AssignmentRead.model_validate(assignment)


@router.get("", response_model=list[AssignmentRead])
async def list_assignments(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[AssignmentRead]:
    if current_user.role == Role.ASSISTANT:
        course_ids = set(
            await teacher_or_assistant_course_ids(
                session, current_user, AssistantResource.HOMEWORK, AssistantAction.VIEW
            )
        )
        assignments = [a for a in await service.list_assignments(session, current_user) if a.course_id in course_ids]
    else:
        assignments = await service.list_assignments(session, current_user)
    return [_scope_submissions(assignment, current_user) for assignment in assignments]


@router.get("/{assignment_id}", response_model=AssignmentRead)
async def get_assignment(
    assignment_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> AssignmentRead:
    assignment = await service.get_assignment(session, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    if current_user.role == Role.STUDENT:
        await assert_student_enrolled_in_course(
            session, assignment.course_id, current_user, not_found_detail="Assignment not found",
        )
    elif current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_can(
            session, current_user, assignment.course_id, AssistantResource.HOMEWORK, AssistantAction.VIEW,
            not_found_detail="Assignment not found",
        )

    return _scope_submissions(assignment, current_user)


@router.post("", response_model=AssignmentRead, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    payload: AssignmentCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_STAFF_ROLES),
) -> AssignmentRead:
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_can(session, current_user, payload.course_id, AssistantResource.HOMEWORK, AssistantAction.CREATE)
    return await service.create_assignment(session, payload)


@router.post("/{assignment_id}/submit", response_model=AssignmentSubmissionRead, status_code=status.HTTP_201_CREATED)
async def submit_assignment(
    assignment_id: UUID,
    payload: AssignmentSubmissionCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> AssignmentSubmissionRead:
    assignment = await service.get_assignment(session, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    await assert_student_enrolled_in_course(
        session, assignment.course_id, current_user, not_found_detail="Assignment not found",
    )

    submission = await service.submit_assignment(session, assignment_id, current_user.id, payload)
    if submission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    return submission
