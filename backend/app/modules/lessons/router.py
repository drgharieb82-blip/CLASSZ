from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.lessons import service
from app.modules.lessons.schemas import LessonCreate, LessonRead

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    payload: LessonCreate,
    session: AsyncSession = Depends(get_db_session),
) -> LessonRead:
    return await service.create_lesson(session, payload)
