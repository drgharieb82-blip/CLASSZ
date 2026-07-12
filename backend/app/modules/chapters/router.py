from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_can, assert_owns_chapter, assert_student_enrolled_in_course
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.chapters import service
from app.modules.chapters.schemas import ChapterCreate, ChapterRead, ChapterUpdate

router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.get("", response_model=list[ChapterRead])
async def list_chapters(
    course_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[ChapterRead]:
    try:
        parsed_id = UUID(course_id)
    except ValueError:
        return []
    await assert_student_enrolled_in_course(session, parsed_id, current_user)
    return await service.list_chapters(session, course_id=parsed_id)


@router.post("", response_model=ChapterRead, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    payload: ChapterCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> ChapterRead:
    await assert_can(session, current_user, payload.course_id, AssistantResource.CHAPTERS_LESSONS, AssistantAction.CREATE)
    return await service.create_chapter(session, payload)


@router.patch("/{chapter_id}", response_model=ChapterRead)
async def update_chapter(
    chapter_id: UUID,
    payload: ChapterUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> ChapterRead:
    await assert_owns_chapter(session, chapter_id, current_user)
    chapter = await service.update_chapter(session, chapter_id, payload)
    if chapter is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return chapter


@router.delete("/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(
    chapter_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await assert_owns_chapter(session, chapter_id, current_user, action=AssistantAction.DELETE)
    deleted = await service.delete_chapter(session, chapter_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
