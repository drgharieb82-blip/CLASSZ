from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student
from app.modules.progress import service
from app.modules.progress.schemas import (
    CourseProgressRead,
    SessionProgressComplete,
    SessionProgressRead,
    SessionProgressStart,
    SessionProgressUpdate,
    StudentProgressSummaryRead,
)

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/start", response_model=SessionProgressRead, status_code=status.HTTP_201_CREATED)
async def start_progress(
    payload: SessionProgressStart,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> SessionProgressRead:
    return await service.start_session_progress(session, current_user.id, payload)


@router.post("/update", response_model=SessionProgressRead)
async def update_progress(
    payload: SessionProgressUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> SessionProgressRead:
    return await service.update_session_progress(session, current_user.id, payload)


@router.post("/complete", response_model=SessionProgressRead)
async def complete_progress(
    payload: SessionProgressComplete,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> SessionProgressRead:
    return await service.complete_session_progress(session, current_user.id, payload)


@router.get("/me/course/{course_id}", response_model=CourseProgressRead)
async def get_my_course_progress(
    course_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> CourseProgressRead:
    progress = await service.get_student_course_progress(session, current_user.id, course_id)
    if progress is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course progress not found")
    return progress


@router.get("/me", response_model=StudentProgressSummaryRead)
async def get_my_progress_summary(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentProgressSummaryRead:
    return await service.get_student_progress_summary(session, current_user.id)


@router.get("/{session_id}", response_model=SessionProgressRead)
async def get_progress(
    session_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> SessionProgressRead:
    progress = await service.get_session_progress(session, session_id, current_user.id)
    if progress is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session progress not found")

    return progress
