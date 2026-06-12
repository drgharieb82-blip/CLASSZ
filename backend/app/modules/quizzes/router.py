from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.quizzes import service
from app.modules.quizzes.schemas import QuizCreate, QuizQuestionCreate, QuizQuestionRead, QuizRead

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("", response_model=list[QuizRead])
async def list_quizzes(session: AsyncSession = Depends(get_db_session)) -> list[QuizRead]:
    return await service.list_quizzes(session)


@router.get("/{quiz_id}", response_model=QuizRead)
async def get_quiz(
    quiz_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> QuizRead:
    quiz = await service.get_quiz(session, quiz_id)
    if quiz is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    return quiz


@router.post("", response_model=QuizRead, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    payload: QuizCreate,
    session: AsyncSession = Depends(get_db_session),
) -> QuizRead:
    return await service.create_quiz(session, payload)


@router.post("/{quiz_id}/questions", response_model=QuizQuestionRead, status_code=status.HTTP_201_CREATED)
async def add_quiz_question(
    quiz_id: UUID,
    payload: QuizQuestionCreate,
    session: AsyncSession = Depends(get_db_session),
) -> QuizQuestionRead:
    quiz_question = await service.add_quiz_question(session, quiz_id, payload)
    if quiz_question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    return quiz_question
