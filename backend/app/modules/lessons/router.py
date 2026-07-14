from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_chapter, assert_owns_lesson, assert_student_enrolled_in_chapter
from app.modules.assistants.models import AssistantAction
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.lessons import service
from app.modules.lessons.schemas import LessonCreate, LessonRead, LessonUpdate

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("", response_model=list[LessonRead])
async def list_lessons(
    chapter_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[LessonRead]:
    try:
        parsed_id = UUID(chapter_id)
    except ValueError:
        return []
    await assert_student_enrolled_in_chapter(session, parsed_id, current_user)
    return await service.list_lessons(session, chapter_id=parsed_id)


@router.post("", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    payload: LessonCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> LessonRead:
    await assert_owns_chapter(session, payload.chapter_id, current_user, action=AssistantAction.CREATE)
    return await service.create_lesson(session, payload)


@router.patch("/{lesson_id}", response_model=LessonRead)
async def update_lesson(
    lesson_id: UUID,
    payload: LessonUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> LessonRead:
    await assert_owns_lesson(session, lesson_id, current_user)
    lesson = await service.update_lesson(session, lesson_id, payload)
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return lesson


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await assert_owns_lesson(session, lesson_id, current_user, action=AssistantAction.DELETE)
    deleted = await service.delete_lesson(session, lesson_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
