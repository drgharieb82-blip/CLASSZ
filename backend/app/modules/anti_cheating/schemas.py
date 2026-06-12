from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.anti_cheating.models import AntiCheatingEventType
from app.modules.quiz_attempts.schemas import QuizAttemptRead


class AntiCheatingEventCreate(BaseModel):
    attempt_id: UUID
    event_type: AntiCheatingEventType
    metadata_json: dict[str, Any] = Field(default_factory=dict)


class AntiCheatingEventRead(AntiCheatingEventCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class AutoSubmitRead(BaseModel):
    event: AntiCheatingEventRead
    attempt: QuizAttemptRead
