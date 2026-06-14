from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db import migrations  # noqa: F401
from app.modules.quiz_attempts import repository
from app.modules.quiz_attempts.models import QuizAnswer, QuizAttempt, QuizAttemptStatus
from app.modules.quiz_attempts.schemas import QuizAnswerSubmit, QuizAttemptStart


async def get_attempt(session: AsyncSession, attempt_id: UUID) -> QuizAttempt | None:
    return await repository.get_attempt(session, attempt_id)


async def start_attempt(session: AsyncSession, payload: QuizAttemptStart) -> QuizAttempt:
    quiz = await repository.get_quiz(session, payload.quiz_id)
    time_limit_minutes = payload.time_limit_minutes or (quiz.duration_minutes if quiz is not None else None)
    started_at = datetime.now(UTC)
    attempt_number = await repository.count_student_attempts(session, payload.quiz_id, payload.student_id) + 1

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
    return await repository.create_attempt(session, attempt)


async def answer_question(
    session: AsyncSession,
    attempt_id: UUID,
    payload: QuizAnswerSubmit,
) -> QuizAnswer | None:
    attempt = await get_attempt(session, attempt_id)
    if attempt is None:
        return None

    answer = await repository.get_answer(session, attempt_id, payload.question_id)
    if answer is None:
        answer = QuizAnswer(
            attempt_id=attempt_id,
            question_id=payload.question_id,
            answer_data=payload.answer_data,
        )
    else:
        answer.answer_data = payload.answer_data

    return await repository.save_answer(session, answer)


async def submit_attempt(session: AsyncSession, attempt_id: UUID) -> QuizAttempt | None:
    attempt = await get_attempt(session, attempt_id)
    if attempt is None:
        return None

    attempt.status = QuizAttemptStatus.SUBMITTED
    attempt.submitted_at = datetime.now(UTC)
    return await repository.save_attempt(session, attempt)
