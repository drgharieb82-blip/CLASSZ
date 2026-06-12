from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.quiz_attempts import service
from app.modules.quiz_attempts.schemas import QuizAnswerRead, QuizAnswerSubmit, QuizAttemptRead, QuizAttemptStart

router = APIRouter(prefix="/quiz-attempts", tags=["quiz_attempts"])


@router.post("/start", response_model=QuizAttemptRead, status_code=status.HTTP_201_CREATED)
async def start_attempt(
    payload: QuizAttemptStart,
    session: AsyncSession = Depends(get_db_session),
) -> QuizAttemptRead:
    return await service.start_attempt(session, payload)


@router.post("/{attempt_id}/answer", response_model=QuizAnswerRead)
async def answer_question(
    attempt_id: UUID,
    payload: QuizAnswerSubmit,
    session: AsyncSession = Depends(get_db_session),
) -> QuizAnswerRead:
    answer = await service.answer_question(session, attempt_id, payload)
    if answer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return answer


@router.post("/{attempt_id}/submit", response_model=QuizAttemptRead)
async def submit_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> QuizAttemptRead:
    attempt = await service.submit_attempt(session, attempt_id)
    if attempt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return attempt


@router.get("/{attempt_id}", response_model=QuizAttemptRead)
async def get_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> QuizAttemptRead:
    attempt = await service.get_attempt(session, attempt_id)
    if attempt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return attempt
