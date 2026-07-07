from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SessionProgressStart(BaseModel):
    student_id: UUID
    session_id: UUID
    last_position_seconds: int = Field(default=0, ge=0)


class SessionProgressUpdate(BaseModel):
    student_id: UUID
    session_id: UUID
    percent_complete: int = Field(ge=0, le=100)
    last_position_seconds: int = Field(ge=0)


class SessionProgressComplete(BaseModel):
    student_id: UUID
    session_id: UUID
    last_position_seconds: int = Field(default=0, ge=0)


class SessionProgressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    session_id: UUID
    started_at: datetime | None
    completed_at: datetime | None
    percent_complete: int
    last_position_seconds: int
    created_at: datetime
    updated_at: datetime
