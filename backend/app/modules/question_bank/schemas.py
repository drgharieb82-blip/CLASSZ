from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.modules.question_bank.models import Difficulty, MediaType, QuestionMediaPurpose, QuestionType


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
    choice_id: UUID | None = None
    file_url: str
    media_type: MediaType
    purpose: QuestionMediaPurpose
    caption: str | None = None
    position: int
    created_at: datetime


class QuestionConceptMapRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question_id: UUID
    course_id: UUID | None = None
    chapter_id: UUID | None = None
    lesson_id: UUID | None = None
    concept_id: UUID
    weight: float
    created_at: datetime


class QuestionStatsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: UUID
    times_used: int
    correct_percentage: float
    wrong_percentage: float
    difficulty_index: float
    discrimination_index: float
    average_time_seconds: int
    updated_at: datetime


class QuestionRevisionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question_id: UUID
    version_number: int
    snapshot: dict
    created_by_id: UUID | None = None
    created_at: datetime


class QuestionCreate(BaseModel):
    category_id: UUID | None = None
    category_name: str | None = Field(default="Chemistry", max_length=120)
    title: str = Field(min_length=1, max_length=500)
    question_type: QuestionType
    difficulty: Difficulty
    explanation: str | None = None
    correct_answer: str | None = None
    source: str | None = Field(default=None, max_length=240)
    bloom_level: str | None = Field(default=None, max_length=80)
    thinking_skill: str | None = Field(default=None, max_length=120)
    estimated_time_seconds: int | None = Field(default=None, ge=0)
    common_mistakes: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    course_id: UUID | None = None
    chapter_id: UUID | None = None
    lesson_id: UUID | None = None
    concept_ids: list[UUID] = Field(default_factory=list)
    created_by_id: UUID | None = None
    updated_by_id: UUID | None = None
    choices: list[QuestionChoiceCreate] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    points: int = Field(default=1, ge=0)
    is_active: bool = True


class QuestionRead(QuestionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    version_number: int
    deleted_at: datetime | None = None
    category: QuestionCategoryRead | None = None
    choices: list[QuestionChoiceRead] = Field(default_factory=list)
    media: list[QuestionMediaRead] = Field(default_factory=list)
    tags: list[QuestionTagRead] = Field(default_factory=list)
    concept_maps: list[QuestionConceptMapRead] = Field(default_factory=list)
    stats: QuestionStatsRead | None = None


class QuestionUpdate(BaseModel):
    category_id: UUID | None = None
    category_name: str | None = Field(default=None, max_length=120)
    title: str | None = Field(default=None, min_length=1, max_length=500)
    question_type: QuestionType | None = None
    difficulty: Difficulty | None = None
    explanation: str | None = None
    correct_answer: str | None = None
    source: str | None = Field(default=None, max_length=240)
    bloom_level: str | None = Field(default=None, max_length=80)
    thinking_skill: str | None = Field(default=None, max_length=120)
    estimated_time_seconds: int | None = Field(default=None, ge=0)
    common_mistakes: list[str] | None = None
    keywords: list[str] | None = None
    course_id: UUID | None = None
    chapter_id: UUID | None = None
    lesson_id: UUID | None = None
    concept_ids: list[UUID] | None = None
    updated_by_id: UUID | None = None
    points: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class QuestionSearchParams(BaseModel):
    q: str | None = None
    subject: str | None = None
    chapter_id: UUID | None = None
    lesson_id: UUID | None = None
    concept_id: UUID | None = None
    difficulty: Difficulty | None = None
    question_type: QuestionType | None = None
    tags: list[str] = Field(default_factory=list)
    limit: int = Field(default=25, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


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
    purpose: QuestionMediaPurpose = QuestionMediaPurpose.QUESTION
    choice_id: UUID | None = None
    caption: str | None = Field(default=None, max_length=240)
    position: int = Field(default=0, ge=0)

    @field_validator("file_url")
    @classmethod
    def normalize_file_url(cls, file_url: HttpUrl) -> str:
        return str(file_url)
