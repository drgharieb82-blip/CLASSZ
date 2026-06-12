from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.progress import service
from app.modules.progress.schemas import (
    LessonProgressComplete,
    LessonProgressRead,
    LessonProgressStart,
    LessonProgressUpdate,
)

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/start", response_model=LessonProgressRead, status_code=status.HTTP_201_CREATED)
async def start_progress(
    payload: LessonProgressStart,
    session: AsyncSession = Depends(get_db_session),
) -> LessonProgressRead:
    return await service.start_lesson_progress(session, payload)


@router.post("/update", response_model=LessonProgressRead)
async def update_progress(
    payload: LessonProgressUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> LessonProgressRead:
    return await service.update_lesson_progress(session, payload)


@router.post("/complete", response_model=LessonProgressRead)
async def complete_progress(
    payload: LessonProgressComplete,
    session: AsyncSession = Depends(get_db_session),
) -> LessonProgressRead:
    return await service.complete_lesson_progress(session, payload)


@router.get("/{lesson_id}", response_model=LessonProgressRead)
async def get_progress(
    lesson_id: UUID,
    student_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
) -> LessonProgressRead:
    progress = await service.get_lesson_progress(session, lesson_id, student_id)
    if progress is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson progress not found")

    return progress
