from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.assistant import service
from app.modules.assistant.schemas import (
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantContextRead,
    AssistantQuestionExplanationRead,
    AssistantRevisionRead,
    AssistantWeaknessRead,
    ExplainableInsightCreate,
    ExplainableInsightRead,
)

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.get("/context/{student_id}", response_model=AssistantContextRead)
async def get_assistant_context(student_id: UUID, session: AsyncSession = Depends(get_db_session)) -> AssistantContextRead:
    return await service.build_assistant_context(session, student_id)


@router.post("/insights", response_model=ExplainableInsightRead, status_code=status.HTTP_201_CREATED)
async def create_insight(payload: ExplainableInsightCreate, session: AsyncSession = Depends(get_db_session)) -> ExplainableInsightRead:
    return await service.create_insight(session, payload)


@router.post("/chat", response_model=AssistantChatResponse, response_model_by_alias=True)
async def chat(payload: AssistantChatRequest) -> AssistantChatResponse:
    return await service.chat(payload)


@router.get("/weaknesses/{student_id}", response_model=list[AssistantWeaknessRead], response_model_by_alias=True)
async def get_weaknesses(student_id: UUID, session: AsyncSession = Depends(get_db_session)) -> list[AssistantWeaknessRead]:
    return await service.get_weaknesses(session, student_id)


@router.get("/revision/{student_id}", response_model=list[AssistantRevisionRead], response_model_by_alias=True)
async def get_revision(student_id: UUID, session: AsyncSession = Depends(get_db_session)) -> list[AssistantRevisionRead]:
    return await service.get_revision(session, student_id)


@router.get("/explanation/{question_id}", response_model=AssistantQuestionExplanationRead, response_model_by_alias=True)
async def get_explanation(question_id: UUID) -> AssistantQuestionExplanationRead:
    return await service.explain_question(question_id)
