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


class AssistantChatRequest(BaseModel):
    message: str
    student_id: UUID | None = None
    conversation_id: str = "backend-assistant-conversation"


class ChatMessageRead(BaseModel):
    id: str
    conversation_id: str = Field(serialization_alias="conversationId")
    role: str
    content: str
    created_at: str = Field(serialization_alias="createdAt")
    status: str = "sent"


class AssistantChatResponse(BaseModel):
    user_message: ChatMessageRead = Field(serialization_alias="userMessage")
    assistant_message: ChatMessageRead = Field(serialization_alias="assistantMessage")


class AssistantWeaknessRead(BaseModel):
    id: str
    student_id: str = Field(serialization_alias="studentId")
    concept_id: str = Field(serialization_alias="conceptId")
    concept_name: str = Field(serialization_alias="conceptName")
    concept: str
    score: int
    severity: str
    confidence_level: str = Field(serialization_alias="confidenceLevel")
    priority: str
    progress: int
    recommendation: str


class AssistantRevisionRead(BaseModel):
    id: str
    concept_id: str = Field(serialization_alias="conceptId")
    title: str
    concept: str
    description: str
    priority: str
    estimated_time: str = Field(serialization_alias="estimatedTime")
    action_type: str = Field(serialization_alias="actionType")


class AssistantQuestionExplanationRead(BaseModel):
    id: str
    question_id: str = Field(serialization_alias="questionId")
    concept_id: str = Field(serialization_alias="conceptId")
    question_title: str = Field(serialization_alias="questionTitle")
    selected_answer: str = Field(serialization_alias="selectedAnswer")
    correct_answer: str = Field(serialization_alias="correctAnswer")
    wrong_explanation: str = Field(serialization_alias="wrongExplanation")
    correct_explanation: str = Field(serialization_alias="correctExplanation")
    related_concept: str = Field(serialization_alias="relatedConcept")
    difficulty: str
    summary: str
    steps: list[str]
