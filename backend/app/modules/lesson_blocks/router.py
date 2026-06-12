from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.lesson_blocks import service
from app.modules.lesson_blocks.schemas import LessonBlockCreate, LessonBlockRead

router = APIRouter(prefix="/lesson-blocks", tags=["lesson_blocks"])


@router.post("", response_model=LessonBlockRead, status_code=status.HTTP_201_CREATED)
async def create_lesson_block(
    payload: LessonBlockCreate,
    session: AsyncSession = Depends(get_db_session),
) -> LessonBlockRead:
    return await service.create_lesson_block(session, payload)
