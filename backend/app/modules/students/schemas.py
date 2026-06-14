from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StudentBase(BaseModel):
    display_name: str
    grade: str
    parent_user_id: UUID | None = None


class StudentCreate(StudentBase):
    user_id: UUID


class StudentUpdate(BaseModel):
    display_name: str | None = None
    grade: str | None = None
    parent_user_id: UUID | None = None


class StudentRead(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
