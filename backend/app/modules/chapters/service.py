from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.modules.chapters.models import Chapter
from app.modules.chapters.schemas import ChapterCreate


async def _next_chapter_public_code(session: AsyncSession) -> str:
    """Real, DB-backed sequence read - see teachers/service.py for why this reads
    the Postgres sequence directly rather than the in-memory CodeGeneratorService."""
    result = await session.execute(text("SELECT nextval('seq_chapter_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.CHAPTER, sequence)


async def create_chapter(session: AsyncSession, payload: ChapterCreate) -> Chapter:
    result = await session.execute(
        select(func.count(Chapter.id)).where(Chapter.course_id == payload.course_id)
    )
    position = result.scalar_one()
    public_code = await _next_chapter_public_code(session)
    chapter = Chapter(
        public_code=public_code,
        course_id=payload.course_id,
        title=payload.title,
        position=position,
    )
    session.add(chapter)
    await session.commit()
    await session.refresh(chapter)
    return chapter


async def list_chapters(session: AsyncSession, course_id: UUID) -> list[Chapter]:
    result = await session.execute(
        select(Chapter)
        .where(Chapter.course_id == course_id)
        .order_by(Chapter.position)
    )
    return list(result.scalars().all())
