from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import migrations  # noqa: F401
from app.modules.progress.models import SessionProgress
from app.modules.progress.schemas import SessionProgressComplete, SessionProgressStart, SessionProgressUpdate


async def get_session_progress(
    session: AsyncSession,
    session_id: UUID,
    student_id: UUID,
) -> SessionProgress | None:
    result = await session.execute(
        select(SessionProgress).where(
            SessionProgress.session_id == session_id,
            SessionProgress.student_id == student_id,
        )
    )
    return result.scalar_one_or_none()


async def start_session_progress(session: AsyncSession, payload: SessionProgressStart) -> SessionProgress:
    progress = await get_session_progress(session, payload.session_id, payload.student_id)
    now = datetime.now(UTC)

    if progress is None:
        progress = SessionProgress(
            student_id=payload.student_id,
            session_id=payload.session_id,
            started_at=now,
            percent_complete=0,
            last_position_seconds=payload.last_position_seconds,
        )
        session.add(progress)
    else:
        progress.started_at = progress.started_at or now
        progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)
    return progress


async def update_session_progress(session: AsyncSession, payload: SessionProgressUpdate) -> SessionProgress:
    progress = await get_session_progress(session, payload.session_id, payload.student_id)
    if progress is None:
        progress = SessionProgress(
            student_id=payload.student_id,
            session_id=payload.session_id,
            started_at=datetime.now(UTC),
        )
        session.add(progress)

    progress.percent_complete = payload.percent_complete
    progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)
    return progress


async def complete_session_progress(session: AsyncSession, payload: SessionProgressComplete) -> SessionProgress:
    progress = await get_session_progress(session, payload.session_id, payload.student_id)
    now = datetime.now(UTC)

    if progress is None:
        progress = SessionProgress(
            student_id=payload.student_id,
            session_id=payload.session_id,
            started_at=now,
        )
        session.add(progress)

    progress.completed_at = now
    progress.percent_complete = 100
    progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)
    return progress
