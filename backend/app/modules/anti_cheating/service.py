from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import migrations  # noqa: F401
from app.modules.anti_cheating.models import AntiCheatingEvent, AntiCheatingEventType
from app.modules.anti_cheating.schemas import AntiCheatingEventCreate
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.quiz_attempts.service import get_attempt


async def create_event(session: AsyncSession, payload: AntiCheatingEventCreate) -> AntiCheatingEvent | None:
    attempt = await get_attempt(session, payload.attempt_id)
    if attempt is None:
        return None

    event = AntiCheatingEvent(
        attempt_id=payload.attempt_id,
        event_type=payload.event_type,
        metadata_json=payload.metadata_json,
    )
    session.add(event)

    if payload.event_type == AntiCheatingEventType.FOCUS_LOST:
        attempt.focus_loss_count += 1
    elif payload.event_type == AntiCheatingEventType.AUTO_SUBMIT:
        attempt.is_auto_submitted = True

    await session.commit()
    await session.refresh(event)
    return event


async def list_attempt_events(session: AsyncSession, attempt_id: UUID) -> list[AntiCheatingEvent]:
    result = await session.execute(
        select(AntiCheatingEvent)
        .where(AntiCheatingEvent.attempt_id == attempt_id)
        .order_by(AntiCheatingEvent.created_at.desc())
    )
    return list(result.scalars().all())


async def auto_submit_attempt(session: AsyncSession, attempt_id: UUID) -> tuple[AntiCheatingEvent, QuizAttempt] | None:
    attempt = await get_attempt(session, attempt_id)
    if attempt is None:
        return None

    if attempt.status != QuizAttemptStatus.SUBMITTED:
        attempt.status = QuizAttemptStatus.SUBMITTED
        attempt.submitted_at = datetime.now(UTC)
    attempt.is_auto_submitted = True

    event = AntiCheatingEvent(
        attempt_id=attempt_id,
        event_type=AntiCheatingEventType.AUTO_SUBMIT,
        metadata_json={"reason": "time_expired"},
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    refreshed_attempt = await get_attempt(session, attempt_id)
    return event, refreshed_attempt or attempt
