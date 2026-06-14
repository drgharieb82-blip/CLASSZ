from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.student_memory import service
from app.modules.student_memory.schemas import MemoryTimelineEventCreate, MemoryTimelineRead, StudentMemoryRead, StudentProfileRead

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


@router.get("/profile/{student_id}", response_model=StudentProfileRead, response_model_by_alias=True)
async def get_student_memory_profile(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> StudentProfileRead:
    memory = await service.get_student_memory_or_fallback(session, student_id)
    return memory.student_profile


@router.get("/timeline/{student_id}", response_model=MemoryTimelineRead, response_model_by_alias=True)
async def get_student_memory_timeline(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> MemoryTimelineRead:
    memory = await service.get_student_memory_or_fallback(session, student_id)
    return memory.memory_timeline


@router.get("/learning-patterns/{student_id}", response_model_by_alias=True)
async def get_student_memory_learning_patterns(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[dict[str, object]]:
    memory = await service.get_student_memory_or_fallback(session, student_id)
    return memory.learning_pattern_insights


@router.get("/review-plan/{student_id}", response_model_by_alias=True)
async def get_student_memory_review_plan(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    memory = await service.get_student_memory_or_fallback(session, student_id)
    return {
        "studentId": student_id,
        "forgettingCurve": memory.forgetting_curve,
        "recommendations": memory.personalized_recommendations,
        "nextAction": memory.student_summary.next_best_action if memory.student_summary else "Continue collecting learning signals.",
    }


@router.get("/knowledge-graph/{student_id}", response_model_by_alias=True)
async def get_student_memory_knowledge_graph(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    memory = await service.get_student_memory_or_fallback(session, student_id)
    return memory.personal_knowledge_graph


@router.get("/persona/{student_id}", response_model_by_alias=True)
async def get_student_memory_persona(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    memory = await service.get_student_memory_or_fallback(session, student_id)
    return memory.student_persona


@router.get("/tutor-context/{student_id}", response_model_by_alias=True)
async def get_student_memory_tutor_context(
    student_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    memory = await service.get_student_memory_or_fallback(session, student_id)
    return memory.personal_tutor_context
