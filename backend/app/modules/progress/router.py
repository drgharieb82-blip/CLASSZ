from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.progress import service
from app.modules.progress.schemas import (
    SessionProgressComplete,
    SessionProgressRead,
    SessionProgressStart,
    SessionProgressUpdate,
)

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/start", response_model=SessionProgressRead, status_code=status.HTTP_201_CREATED)
async def start_progress(
    payload: SessionProgressStart,
    session: AsyncSession = Depends(get_db_session),
) -> SessionProgressRead:
    return await service.start_session_progress(session, payload)


@router.post("/update", response_model=SessionProgressRead)
async def update_progress(
    payload: SessionProgressUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> SessionProgressRead:
    return await service.update_session_progress(session, payload)


@router.post("/complete", response_model=SessionProgressRead)
async def complete_progress(
    payload: SessionProgressComplete,
    session: AsyncSession = Depends(get_db_session),
) -> SessionProgressRead:
    return await service.complete_session_progress(session, payload)


@router.get("/{session_id}", response_model=SessionProgressRead)
async def get_progress(
    session_id: UUID,
    student_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
) -> SessionProgressRead:
    progress = await service.get_session_progress(session, session_id, student_id)
    if progress is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session progress not found")

    return progress
