from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.lesson_blocks.models import LessonBlock
from app.modules.lesson_blocks.schemas import LessonBlockCreate


async def list_lesson_blocks(session: AsyncSession, lesson_id: UUID | None = None) -> list[LessonBlock]:
    statement = select(LessonBlock).order_by(LessonBlock.position.asc())
    if lesson_id is not None:
        statement = statement.where(LessonBlock.lesson_id == lesson_id)

    result = await session.execute(statement)
    return list(result.scalars().all())


async def get_lesson_block(session: AsyncSession, block_id: UUID) -> LessonBlock | None:
    result = await session.execute(select(LessonBlock).where(LessonBlock.id == block_id))
    return result.scalar_one_or_none()


async def create_lesson_block(session: AsyncSession, payload: LessonBlockCreate) -> LessonBlock:
    block = LessonBlock(**payload.model_dump())
    session.add(block)
    await session.commit()
    await session.refresh(block)
    return block
