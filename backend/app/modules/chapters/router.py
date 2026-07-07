from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.chapters import service
from app.modules.chapters.schemas import ChapterCreate, ChapterRead

router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.get("", response_model=list[ChapterRead])
async def list_chapters(
    course_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
) -> list[ChapterRead]:
    try:
        parsed_id = UUID(course_id)
    except ValueError:
        return []
    return await service.list_chapters(session, course_id=parsed_id)


@router.post("", response_model=ChapterRead, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    payload: ChapterCreate,
    session: AsyncSession = Depends(get_db_session),
) -> ChapterRead:
    return await service.create_chapter(session, payload)
