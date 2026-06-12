from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.question_bank.models import Question
from app.modules.quiz_attempts.models import QuizAnswer, QuizAttempt, QuizAttemptStatus
from app.modules.quiz_attempts.schemas import QuizAnswerSubmit, QuizAttemptStart
from app.modules.quizzes.models import Quiz, QuizQuestion


def _attempt_options():
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


async def get_attempt(session: AsyncSession, attempt_id: UUID) -> QuizAttempt | None:
    result = await session.execute(
        select(QuizAttempt)
        .where(QuizAttempt.id == attempt_id)
        .options(*_attempt_options())
    )
    return result.scalar_one_or_none()


async def start_attempt(session: AsyncSession, payload: QuizAttemptStart) -> QuizAttempt:
    quiz_result = await session.execute(select(Quiz).where(Quiz.id == payload.quiz_id))
    quiz = quiz_result.scalar_one_or_none()
    time_limit_minutes = payload.time_limit_minutes or (quiz.duration_minutes if quiz is not None else None)
    started_at = datetime.now(UTC)
    attempt_count_result = await session.execute(
        select(func.count(QuizAttempt.id)).where(
            QuizAttempt.quiz_id == payload.quiz_id,
            QuizAttempt.student_id == payload.student_id,
        )
    )
    attempt_number = int(attempt_count_result.scalar_one() or 0) + 1

    attempt = QuizAttempt(
        quiz_id=payload.quiz_id,
        student_id=payload.student_id,
        started_at=started_at,
        expires_at=started_at + timedelta(minutes=time_limit_minutes) if time_limit_minutes else None,
        time_limit_minutes=time_limit_minutes,
        attempt_number=attempt_number,
        ip_address=payload.ip_address,
        user_agent=payload.user_agent,
        device_fingerprint=payload.device_fingerprint,
        status=QuizAttemptStatus.IN_PROGRESS,
    )
    session.add(attempt)
    await session.commit()
    return await get_attempt(session, attempt.id) or attempt


async def answer_question(
    session: AsyncSession,
    attempt_id: UUID,
    payload: QuizAnswerSubmit,
) -> QuizAnswer | None:
    attempt = await get_attempt(session, attempt_id)
    if attempt is None:
        return None

    result = await session.execute(
        select(QuizAnswer).where(
            QuizAnswer.attempt_id == attempt_id,
            QuizAnswer.question_id == payload.question_id,
        )
    )
    answer = result.scalar_one_or_none()
    if answer is None:
        answer = QuizAnswer(
            attempt_id=attempt_id,
            question_id=payload.question_id,
            answer_data=payload.answer_data,
        )
        session.add(answer)
    else:
        answer.answer_data = payload.answer_data

    await session.commit()
    await session.refresh(answer)
    return answer


async def submit_attempt(session: AsyncSession, attempt_id: UUID) -> QuizAttempt | None:
    attempt = await get_attempt(session, attempt_id)
    if attempt is None:
        return None

    attempt.status = QuizAttemptStatus.SUBMITTED
    attempt.submitted_at = datetime.now(UTC)
    await session.commit()
    return await get_attempt(session, attempt_id)
