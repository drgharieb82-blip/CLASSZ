from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.assistant.models import InsightType


class ExplainableInsightCreate(BaseModel):
    student_id: UUID
    concept_id: UUID | None = None
    insight_type: InsightType = InsightType.RECOMMENDATION
    title: str
    summary: str
    explanation: str
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    confidence: int = 75


class ExplainableInsightRead(ExplainableInsightCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class AssistantContextRead(BaseModel):
    student_id: UUID
    summary: str
    next_action: str
    tutor_instructions: str
    insights: list[ExplainableInsightRead]
