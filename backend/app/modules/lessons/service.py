from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.modules.lessons.models import Lesson
from app.modules.lessons.schemas import LessonCreate


async def _next_lesson_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_lesson_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.LESSON, sequence)


async def create_lesson(session: AsyncSession, payload: LessonCreate) -> Lesson:
    result = await session.execute(
        select(func.count(Lesson.id)).where(Lesson.chapter_id == payload.chapter_id)
    )
    position = result.scalar_one()
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
