from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.chapters import service
from app.modules.chapters.schemas import ChapterCreate, ChapterRead

router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.post("", response_model=ChapterRead, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    payload: ChapterCreate,
    session: AsyncSession = Depends(get_db_session),
) -> ChapterRead:
    return await service.create_chapter(session, payload)
