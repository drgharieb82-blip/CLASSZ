from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.lesson_blocks import service
from app.modules.lesson_blocks.schemas import LessonBlockCreate, LessonBlockRead

router = APIRouter(prefix="/lesson-blocks", tags=["lesson_blocks"])


@router.get("", response_model=list[LessonBlockRead])
async def list_lesson_blocks(
    lesson_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
) -> list[LessonBlockRead]:
    return await service.list_lesson_blocks(session, lesson_id)


@router.get("/{block_id}", response_model=LessonBlockRead)
async def get_lesson_block(
    block_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> LessonBlockRead:
    block = await service.get_lesson_block(session, block_id)
    if block is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson block not found")

    return block


@router.post("", response_model=LessonBlockRead, status_code=status.HTTP_201_CREATED)
async def create_lesson_block(
    payload: LessonBlockCreate,
    session: AsyncSession = Depends(get_db_session),
) -> LessonBlockRead:
    return await service.create_lesson_block(session, payload)
