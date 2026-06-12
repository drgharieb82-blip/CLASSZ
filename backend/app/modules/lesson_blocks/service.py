from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.lesson_blocks.models import LessonBlock
from app.modules.lesson_blocks.schemas import LessonBlockCreate


async def create_lesson_block(session: AsyncSession, payload: LessonBlockCreate) -> LessonBlock:
    block = LessonBlock(**payload.model_dump())
    session.add(block)
    await session.commit()
    await session.refresh(block)
    return block
