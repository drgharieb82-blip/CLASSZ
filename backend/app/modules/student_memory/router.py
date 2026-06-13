from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.student_memory import service
from app.modules.student_memory.schemas import MemoryTimelineEventCreate, StudentMemoryRead

router = APIRouter(prefix="/student-memory", tags=["student-memory"])


@router.get("/{student_id}", response_model=StudentMemoryRead, response_model_by_alias=True)
async def get_student_memory(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> StudentMemoryRead:
    memory = await service.get_student_memory(session, student_id)
    if memory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student memory profile not found")

    return memory


@router.post("/{student_id}/timeline-events", response_model=StudentMemoryRead, response_model_by_alias=True)
async def add_memory_event(
    student_id: UUID,
    payload: MemoryTimelineEventCreate,
    session: AsyncSession = Depends(get_db_session),
) -> StudentMemoryRead:
    memory = await service.add_memory_event(session, student_id, payload)
    if memory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student memory profile not found")

    return memory


@router.post("/seed", response_model=StudentMemoryRead, response_model_by_alias=True, status_code=status.HTTP_201_CREATED)
async def seed_student_memory(session: AsyncSession = Depends(get_db_session)) -> StudentMemoryRead:
    return await service.ensure_seed_student_memory(session)
