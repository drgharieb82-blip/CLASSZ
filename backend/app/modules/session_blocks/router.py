from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.session_blocks import service
from app.modules.session_blocks.schemas import SessionBlockCreate, SessionBlockRead

router = APIRouter(prefix="/session-blocks", tags=["session_blocks"])


@router.get("", response_model=list[SessionBlockRead])
async def list_session_blocks(
    session_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
) -> list[SessionBlockRead]:
    return await service.list_session_blocks(session, session_id)


@router.get("/{block_id}", response_model=SessionBlockRead)
async def get_session_block(
    block_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> SessionBlockRead:
    block = await service.get_session_block(session, block_id)
    if block is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session block not found")

    return block


@router.post("", response_model=SessionBlockRead, status_code=status.HTTP_201_CREATED)
async def create_session_block(
    payload: SessionBlockCreate,
    session: AsyncSession = Depends(get_db_session),
) -> SessionBlockRead:
    return await service.create_session_block(session, payload)
