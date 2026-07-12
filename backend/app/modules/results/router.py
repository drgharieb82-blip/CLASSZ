from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_quiz
from app.core.permissions import require_roles
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_user
from app.modules.quiz_attempts import service as quiz_attempts_service
from app.modules.results import service
from app.modules.results.schemas import QuizResultRead

router = APIRouter(prefix="/results", tags=["results"])

_STAFF_ROLES = (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT)


@router.post("/grade/{attempt_id}", response_model=QuizResultRead)
async def grade_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_STAFF_ROLES),
) -> QuizResultRead:
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        attempt = await quiz_attempts_service.get_attempt(session, attempt_id)
        if attempt is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")
        await assert_owns_quiz(
            session, attempt.quiz_id, current_user, resource=AssistantResource.QUIZ_SUBMISSIONS, action=AssistantAction.GRADE
        )

    result = await service.grade_attempt(session, attempt_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return result


@router.get("/{attempt_id}", response_model=QuizResultRead)
async def get_result(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> QuizResultRead:
    if current_user.role == Role.STUDENT:
        student_id = current_user.id
    elif current_user.role in _STAFF_ROLES:
        student_id = None
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    result = await service.get_result_by_attempt(session, attempt_id, student_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz result not found")
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_owns_quiz(
            session, result.attempt.quiz_id, current_user,
            resource=AssistantResource.QUIZ_SUBMISSIONS, action=AssistantAction.VIEW,
        )

    return result
