from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.question_bank import service
from app.modules.question_bank.schemas import (
    QuestionChoiceCreate,
    QuestionChoiceRead,
    QuestionCreate,
    QuestionRead,
    QuestionTagAttach,
)

router = APIRouter(prefix="/questions", tags=["question_bank"])


@router.get("", response_model=list[QuestionRead])
async def list_questions(session: AsyncSession = Depends(get_db_session)) -> list[QuestionRead]:
    return await service.list_questions(session)


@router.get("/{question_id}", response_model=QuestionRead)
async def get_question(
    question_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> QuestionRead:
    question = await service.get_question(session, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    return question


@router.post("", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(
    payload: QuestionCreate,
    session: AsyncSession = Depends(get_db_session),
) -> QuestionRead:
    return await service.create_question(session, payload)


@router.post("/{question_id}/choices", response_model=QuestionChoiceRead, status_code=status.HTTP_201_CREATED)
async def add_question_choice(
    question_id: UUID,
    payload: QuestionChoiceCreate,
    session: AsyncSession = Depends(get_db_session),
) -> QuestionChoiceRead:
    choice = await service.add_question_choice(session, question_id, payload)
    if choice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    return choice


@router.post("/{question_id}/tags", response_model=QuestionRead)
async def add_question_tag(
    question_id: UUID,
    payload: QuestionTagAttach,
    session: AsyncSession = Depends(get_db_session),
) -> QuestionRead:
    question = await service.add_question_tag(session, question_id, payload)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question or tag not found")

    return question
