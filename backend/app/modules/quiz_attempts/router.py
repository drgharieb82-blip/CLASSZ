from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_quiz
from app.core.permissions import require_roles
from app.db.session import get_db_session
from app.models.user import Role
from app.models.user import User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_student, get_current_user
from app.modules.quiz_attempts import service
from app.modules.quiz_attempts.schemas import QuizAnswerRead, QuizAnswerSubmit, QuizAttemptRead, QuizAttemptStart

router = APIRouter(prefix="/quiz-attempts", tags=["quiz_attempts"])

_STAFF_ROLES = (Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT)


@router.post("/start", response_model=QuizAttemptRead, status_code=status.HTTP_201_CREATED)
async def start_attempt(
    payload: QuizAttemptStart,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> QuizAttemptRead:
    return await service.start_attempt(session, current_user.id, payload)


@router.get("/quiz/{quiz_id}/latest", response_model=QuizAttemptRead)
async def get_latest_quiz_attempt(
    quiz_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> QuizAttemptRead:
    attempt = await service.get_latest_attempt_for_quiz(session, quiz_id, current_user.id)
    if attempt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return attempt


@router.post("/{attempt_id}/answer", response_model=QuizAnswerRead)
async def answer_question(
    attempt_id: UUID,
    payload: QuizAnswerSubmit,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> QuizAnswerRead:
    try:
        answer = await service.answer_question(session, attempt_id, current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    if answer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return answer


@router.post("/{attempt_id}/submit", response_model=QuizAttemptRead)
async def submit_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> QuizAttemptRead:
    attempt = await service.submit_attempt(session, attempt_id, current_user.id)
    if attempt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return attempt


@router.get("/{attempt_id}", response_model=QuizAttemptRead)
async def get_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> QuizAttemptRead:
    if current_user.role == Role.STUDENT:
        student_id = current_user.id
    elif current_user.role in _STAFF_ROLES:
        student_id = None
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    attempt = await service.get_attempt(session, attempt_id, student_id)
    if attempt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_owns_quiz(
            session, attempt.quiz_id, current_user,
            resource=AssistantResource.QUIZ_SUBMISSIONS, action=AssistantAction.VIEW,
        )

    return attempt


@router.get("/quiz/{quiz_id}/submissions", response_model=list[QuizAttemptRead])
async def list_quiz_submissions(
    quiz_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(*_STAFF_ROLES),
) -> list[QuizAttemptRead]:
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_owns_quiz(
            session, quiz_id, current_user,
            resource=AssistantResource.QUIZ_SUBMISSIONS, action=AssistantAction.VIEW,
        )
    return await service.list_attempts_for_quiz(session, quiz_id)
