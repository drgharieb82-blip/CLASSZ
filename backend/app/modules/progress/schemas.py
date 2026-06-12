from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LessonProgressStart(BaseModel):
    student_id: UUID
    lesson_id: UUID
    last_position_seconds: int = Field(default=0, ge=0)


class LessonProgressUpdate(BaseModel):
    student_id: UUID
    lesson_id: UUID
    percent_complete: int = Field(ge=0, le=100)
    last_position_seconds: int = Field(ge=0)


class LessonProgressComplete(BaseModel):
    student_id: UUID
    lesson_id: UUID
    last_position_seconds: int = Field(default=0, ge=0)


class LessonProgressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    lesson_id: UUID
    started_at: datetime | None
    completed_at: datetime | None
    percent_complete: int
    last_position_seconds: int
    created_at: datetime
    updated_at: datetime
