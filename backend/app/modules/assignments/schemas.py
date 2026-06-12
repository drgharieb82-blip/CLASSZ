from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.modules.assignments.models import AssignmentSubmissionStatus


class SubmissionFileCreate(BaseModel):
    file_url: HttpUrl
    file_name: str = Field(min_length=1, max_length=255)
    file_size: int = Field(default=0, ge=0)

    @field_validator("file_url")
    @classmethod
    def normalize_file_url(cls, file_url: HttpUrl) -> str:
        return str(file_url)


class SubmissionFileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    submission_id: UUID
    file_url: str
    file_name: str
    file_size: int


class AssignmentSubmissionCreate(BaseModel):
    student_id: UUID
    submission_text: str | None = None
    files: list[SubmissionFileCreate] = Field(default_factory=list)


class AssignmentSubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    assignment_id: UUID
    student_id: UUID
    submission_text: str | None
    status: AssignmentSubmissionStatus
    submitted_at: datetime
    files: list[SubmissionFileRead] = Field(default_factory=list)


class AssignmentBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    course_id: UUID
    chapter_id: UUID | None = None
    lesson_id: UUID | None = None
    deadline_at: datetime | None = None
    max_points: int = Field(default=100, ge=0)
    allow_multiple_submissions: bool = False


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentRead(AssignmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    submissions: list[AssignmentSubmissionRead] = Field(default_factory=list)
