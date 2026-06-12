from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import migrations  # noqa: F401
from app.modules.progress.models import LessonProgress
from app.modules.progress.schemas import LessonProgressComplete, LessonProgressStart, LessonProgressUpdate


async def get_lesson_progress(
    session: AsyncSession,
    lesson_id: UUID,
    student_id: UUID,
) -> LessonProgress | None:
    result = await session.execute(
        select(LessonProgress).where(
            LessonProgress.lesson_id == lesson_id,
            LessonProgress.student_id == student_id,
        )
    )
    return result.scalar_one_or_none()


async def start_lesson_progress(session: AsyncSession, payload: LessonProgressStart) -> LessonProgress:
    progress = await get_lesson_progress(session, payload.lesson_id, payload.student_id)
    now = datetime.now(UTC)

    if progress is None:
        progress = LessonProgress(
            student_id=payload.student_id,
            lesson_id=payload.lesson_id,
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


async def update_lesson_progress(session: AsyncSession, payload: LessonProgressUpdate) -> LessonProgress:
    progress = await get_lesson_progress(session, payload.lesson_id, payload.student_id)
    if progress is None:
        progress = LessonProgress(
            student_id=payload.student_id,
            lesson_id=payload.lesson_id,
            started_at=datetime.now(UTC),
        )
        session.add(progress)

    progress.percent_complete = payload.percent_complete
    progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)
    return progress


async def complete_lesson_progress(session: AsyncSession, payload: LessonProgressComplete) -> LessonProgress:
    progress = await get_lesson_progress(session, payload.lesson_id, payload.student_id)
    now = datetime.now(UTC)

    if progress is None:
        progress = LessonProgress(
            student_id=payload.student_id,
            lesson_id=payload.lesson_id,
            started_at=now,
        )
        session.add(progress)

    progress.completed_at = now
    progress.percent_complete = 100
    progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)
    return progress
