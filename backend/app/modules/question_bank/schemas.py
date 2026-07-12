from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.modules.question_bank.models import Difficulty, MediaType, QuestionType


class QuestionCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class QuestionCategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None


class QuestionTagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class QuestionAcademicNodeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str


class QuestionChoiceCreate(BaseModel):
    client_id: str | None = None
    choice_text: str = Field(min_length=1)
    is_correct: bool = False
    position: int = Field(ge=0)


class QuestionChoiceRead(QuestionChoiceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question_id: UUID


class QuestionMediaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question_id: UUID
    file_url: str
    media_type: MediaType
    caption: str | None = None
    position: int
    created_at: datetime


class QuestionCreate(BaseModel):
    category_id: UUID
    title: str = Field(min_length=1, max_length=500)
    question_type: QuestionType
    difficulty: Difficulty
    explanation: str | None = None
    course_id: UUID | None = None
    answer_data_json: dict[str, Any] | None = None
    points: int = Field(default=1, ge=0)
    is_active: bool = True
    chapter_ids: list[UUID] = Field(default_factory=list)
    lesson_ids: list[UUID] = Field(default_factory=list)
    concept_ids: list[UUID] = Field(default_factory=list)
    atomic_concept_ids: list[UUID] = Field(default_factory=list)
    choices: list[QuestionChoiceCreate] = Field(default_factory=list)


class QuestionRead(QuestionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    category: QuestionCategoryRead | None = None
    choices: list[QuestionChoiceRead] = Field(default_factory=list)
    media: list[QuestionMediaRead] = Field(default_factory=list)
    tags: list[QuestionTagRead] = Field(default_factory=list)
    chapters: list[QuestionAcademicNodeRead] = Field(default_factory=list)
    lessons: list[QuestionAcademicNodeRead] = Field(default_factory=list)
    concepts: list[QuestionAcademicNodeRead] = Field(default_factory=list)
    atomic_concepts: list[QuestionAcademicNodeRead] = Field(default_factory=list)


class QuestionTagAttach(BaseModel):
    tag_id: UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, name: str | None) -> str | None:
        if name is None:
            return None

        return name.strip()


class QuestionMediaCreate(BaseModel):
    file_url: HttpUrl
    media_type: MediaType
    caption: str | None = Field(default=None, max_length=240)
    position: int = Field(default=0, ge=0)

    @field_validator("file_url")
    @classmethod
    def normalize_file_url(cls, file_url: HttpUrl) -> str:
        return str(file_url)
