from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.modules.lessons.models import Lesson
from app.modules.lessons.schemas import LessonCreate, LessonUpdate


async def _next_lesson_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_lesson_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.LESSON, sequence)


async def create_lesson(session: AsyncSession, payload: LessonCreate) -> Lesson:
    result = await session.execute(
        select(func.coalesce(func.max(Lesson.position), -1)).where(Lesson.chapter_id == payload.chapter_id)
    )
    position = result.scalar_one() + 1
    public_code = await _next_lesson_public_code(session)
    lesson = Lesson(
        public_code=public_code,
        chapter_id=payload.chapter_id,
        title=payload.title,
        position=position,
    )
    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)
    return lesson


async def list_lessons(session: AsyncSession, chapter_id: UUID) -> list[Lesson]:
    result = await session.execute(
        select(Lesson)
        .where(Lesson.chapter_id == chapter_id)
        .order_by(Lesson.position)
    )
    return list(result.scalars().all())


async def update_lesson(session: AsyncSession, lesson_id: UUID, payload: LessonUpdate) -> Lesson | None:
    lesson = await session.get(Lesson, lesson_id)
    if lesson is None:
        return None
    if payload.title is not None:
        lesson.title = payload.title
    await session.commit()
    await session.refresh(lesson)
    return lesson


async def delete_lesson(session: AsyncSession, lesson_id: UUID) -> bool:
    lesson = await session.get(Lesson, lesson_id)
    if lesson is None:
        return False
    await session.delete(lesson)
    await session.commit()
    return True
