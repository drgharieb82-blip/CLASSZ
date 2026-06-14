from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.assistant import service
from app.modules.assistant.schemas import AssistantContextRead, ExplainableInsightCreate, ExplainableInsightRead

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.get("/context/{student_id}", response_model=AssistantContextRead)
async def get_assistant_context(student_id: UUID, session: AsyncSession = Depends(get_db_session)) -> AssistantContextRead:
    return await service.build_assistant_context(session, student_id)


@router.post("/insights", response_model=ExplainableInsightRead, status_code=status.HTTP_201_CREATED)
async def create_insight(payload: ExplainableInsightCreate, session: AsyncSession = Depends(get_db_session)) -> ExplainableInsightRead:
    return await service.create_insight(session, payload)
