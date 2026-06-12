from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.modules.question_bank.models import Difficulty, MediaType, QuestionType


class QuestionCategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None


class QuestionTagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class QuestionChoiceCreate(BaseModel):
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
    points: int = Field(default=1, ge=0)
    is_active: bool = True


class QuestionRead(QuestionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    category: QuestionCategoryRead | None = None
    choices: list[QuestionChoiceRead] = Field(default_factory=list)
    media: list[QuestionMediaRead] = Field(default_factory=list)
    tags: list[QuestionTagRead] = Field(default_factory=list)


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
