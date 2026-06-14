from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.question_bank.models import Question
from app.modules.quiz_attempts.models import QuizAnswer, QuizAttempt
from app.modules.quizzes.models import Quiz, QuizQuestion


def attempt_load_options():
    return (
        selectinload(QuizAttempt.answers),
        selectinload(QuizAttempt.quiz)
        .selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.category),
        selectinload(QuizAttempt.quiz)
        .selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.choices),
        selectinload(QuizAttempt.quiz)
        .selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.media),
        selectinload(QuizAttempt.quiz)
        .selectinload(Quiz.questions)
        .selectinload(QuizQuestion.question)
        .selectinload(Question.tags),
    )


async def get_quiz(session: AsyncSession, quiz_id: UUID) -> Quiz | None:
    result = await session.execute(select(Quiz).where(Quiz.id == quiz_id))
    return result.scalar_one_or_none()


async def count_student_attempts(session: AsyncSession, quiz_id: UUID, student_id: UUID) -> int:
    result = await session.execute(
        select(func.count(QuizAttempt.id)).where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.student_id == student_id,
        )
    )
    return int(result.scalar_one() or 0)


async def get_attempt(session: AsyncSession, attempt_id: UUID) -> QuizAttempt | None:
    result = await session.execute(
        select(QuizAttempt)
        .where(QuizAttempt.id == attempt_id)
        .options(*attempt_load_options())
    )
    return result.scalar_one_or_none()


async def create_attempt(session: AsyncSession, attempt: QuizAttempt) -> QuizAttempt:
    session.add(attempt)
    await session.commit()
    return await get_attempt(session, attempt.id) or attempt


async def get_answer(session: AsyncSession, attempt_id: UUID, question_id: UUID) -> QuizAnswer | None:
    result = await session.execute(
        select(QuizAnswer).where(
            QuizAnswer.attempt_id == attempt_id,
            QuizAnswer.question_id == question_id,
        )
    )
    return result.scalar_one_or_none()


async def save_answer(session: AsyncSession, answer: QuizAnswer) -> QuizAnswer:
    session.add(answer)
    await session.commit()
    await session.refresh(answer)
    return answer


async def save_attempt(session: AsyncSession, attempt: QuizAttempt) -> QuizAttempt:
    await session.commit()
    return await get_attempt(session, attempt.id) or attempt
