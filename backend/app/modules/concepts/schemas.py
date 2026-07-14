from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.atomic_concepts.schemas import AtomicConceptRead


class ConceptBase(BaseModel):
    lesson_id: UUID
    title: str = Field(min_length=1, max_length=200)
    position: int = Field(ge=0)


class ConceptCreate(BaseModel):
    lesson_id: UUID
    title: str = Field(min_length=1, max_length=200)


class ConceptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)


class ConceptRead(ConceptBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    created_at: datetime


class ConceptDetails(ConceptRead):
    atomic_concepts: list[AtomicConceptRead] = Field(default_factory=list)
