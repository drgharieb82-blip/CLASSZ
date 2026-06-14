from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TeacherBase(BaseModel):
    display_name: str
    bio: str | None = None
    specialization: str | None = None


class TeacherCreate(TeacherBase):
    user_id: UUID


class TeacherUpdate(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    specialization: str | None = None


class TeacherRead(TeacherBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
