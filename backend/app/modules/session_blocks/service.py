from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.session_blocks.models import SessionBlock
from app.modules.session_blocks.schemas import SessionBlockCreate


async def list_session_blocks(session: AsyncSession, session_id: UUID | None = None) -> list[SessionBlock]:
    statement = select(SessionBlock).order_by(SessionBlock.position.asc())
    if session_id is not None:
        statement = statement.where(SessionBlock.session_id == session_id)

    result = await session.execute(statement)
    return list(result.scalars().all())


async def get_session_block(session: AsyncSession, block_id: UUID) -> SessionBlock | None:
    result = await session.execute(select(SessionBlock).where(SessionBlock.id == block_id))
    return result.scalar_one_or_none()


async def create_session_block(session: AsyncSession, payload: SessionBlockCreate) -> SessionBlock:
    block = SessionBlock(**payload.model_dump())
    session.add(block)
    await session.commit()
    await session.refresh(block)
    return block
