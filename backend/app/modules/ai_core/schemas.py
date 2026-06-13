from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AIMessage(BaseModel):
    role: str
    content: str


class AICompletionRequest(BaseModel):
    feature: str
    messages: list[AIMessage]
    response_format: str = "json_object"
    temperature: float = 0.2


class AIUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    estimated_cost: float = 0.0


class AICompletionResponse(BaseModel):
    provider: str
    model: str
    content: str
    structured: dict[str, Any]
    usage: AIUsage
    fallback_used: bool = False


class AIRequestLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    feature: str
    provider: str
    model: str
    status: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost: float
    success: bool
    error_message: str | None
    created_at: datetime
