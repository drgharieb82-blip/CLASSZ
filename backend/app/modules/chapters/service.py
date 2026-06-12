from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.chapters.models import Chapter
from app.modules.chapters.schemas import ChapterCreate


async def create_chapter(session: AsyncSession, payload: ChapterCreate) -> Chapter:
    chapter = Chapter(**payload.model_dump())
    session.add(chapter)
    await session.commit()
    await session.refresh(chapter)
    return chapter
