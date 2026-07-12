from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.question_bank.models import Question
from app.modules.quizzes.models import Quiz, QuizQuestion
from app.modules.quizzes.schemas import QuizCreate, QuizQuestionCreate


def _quiz_options():
    return (
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.category),
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.choices),
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.media),
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.tags),
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.chapters),
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.lessons),
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.concepts),
        selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.atomic_concepts),
    )


async def list_quizzes(session: AsyncSession) -> list[Quiz]:
    result = await session.execute(select(Quiz).options(*_quiz_options()).order_by(Quiz.created_at.desc()))
    return list(result.scalars().all())


async def get_quiz(session: AsyncSession, quiz_id: UUID) -> Quiz | None:
    result = await session.execute(select(Quiz).where(Quiz.id == quiz_id).options(*_quiz_options()))
    return result.scalar_one_or_none()


async def create_quiz(session: AsyncSession, payload: QuizCreate) -> Quiz:
    quiz = Quiz(**payload.model_dump())
    session.add(quiz)
    await session.commit()
    return await get_quiz(session, quiz.id) or quiz


async def get_quiz_question(session: AsyncSession, quiz_question_id: UUID) -> QuizQuestion | None:
    result = await session.execute(
        select(QuizQuestion)
        .where(QuizQuestion.id == quiz_question_id)
        .options(
            selectinload(QuizQuestion.question).selectinload(Question.category),
            selectinload(QuizQuestion.question).selectinload(Question.choices),
            selectinload(QuizQuestion.question).selectinload(Question.media),
            selectinload(QuizQuestion.question).selectinload(Question.tags),
            selectinload(QuizQuestion.question).selectinload(Question.chapters),
            selectinload(QuizQuestion.question).selectinload(Question.lessons),
            selectinload(QuizQuestion.question).selectinload(Question.concepts),
            selectinload(QuizQuestion.question).selectinload(Question.atomic_concepts),
        )
    )
    return result.scalar_one_or_none()


async def add_quiz_question(
    session: AsyncSession,
    quiz_id: UUID,
    payload: QuizQuestionCreate,
) -> QuizQuestion | None:
    quiz = await get_quiz(session, quiz_id)
    if quiz is None:
        return None

    quiz_question = QuizQuestion(quiz_id=quiz_id, **payload.model_dump())
    session.add(quiz_question)
    await session.commit()
    return await get_quiz_question(session, quiz_question.id) or quiz_question
