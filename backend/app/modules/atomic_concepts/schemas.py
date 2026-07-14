from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AtomicConceptBase(BaseModel):
    concept_id: UUID
    title: str = Field(min_length=1, max_length=200)
    position: int = Field(ge=0)


class AtomicConceptCreate(BaseModel):
    concept_id: UUID
    title: str = Field(min_length=1, max_length=200)


class AtomicConceptUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)


class AtomicConceptRead(AtomicConceptBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    created_at: datetime
