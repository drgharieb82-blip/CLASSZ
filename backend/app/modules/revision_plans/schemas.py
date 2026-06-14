from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.revision_plans.models import RevisionPlanStatus


class RevisionPlanBase(BaseModel):
    student_id: UUID
    title: str
    description: str | None = None
    status: RevisionPlanStatus = RevisionPlanStatus.ACTIVE
    priority: str = "medium"
    starts_at: datetime | None = None
    due_at: datetime | None = None
    plan_items: list[dict[str, Any]] = Field(default_factory=list)


class RevisionPlanCreate(RevisionPlanBase):
    pass


class RevisionPlanUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: RevisionPlanStatus | None = None
    priority: str | None = None
    starts_at: datetime | None = None
    due_at: datetime | None = None
    plan_items: list[dict[str, Any]] | None = None


class RevisionPlanRead(RevisionPlanBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
