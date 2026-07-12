from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.parents.models import ParentAlertStatus, ParentRequestTargetType


class ParentContactCreate(BaseModel):
    student_id: UUID
    name: str = Field(min_length=1, max_length=160)
    relation: str = Field(min_length=1, max_length=60)
    phone: str | None = None
    whatsapp: str | None = None
    email: str | None = None


class ParentContactUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    relation: str | None = Field(default=None, min_length=1, max_length=60)
    phone: str | None = None
    whatsapp: str | None = None
    email: str | None = None
    last_contact_at: datetime | None = None
    alert_status: ParentAlertStatus | None = None


class ParentContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    student_name: str
    name: str
    relation: str
    phone: str | None
    whatsapp: str | None
    email: str | None
    last_contact_at: datetime | None
    alert_status: ParentAlertStatus
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Parent<->student linking (parent side)
# ---------------------------------------------------------------------------


class ParentLinkRequestCreate(BaseModel):
    code: str = Field(min_length=1, max_length=32)


class LinkedChildRead(BaseModel):
    link_id: UUID
    student_id: UUID
    full_name: str
    public_code: str
    avatar: str | None
    status: str


class LinkInvitationRead(BaseModel):
    link_id: UUID
    student_id: UUID
    student_full_name: str
    student_public_code: str
    requested_at: datetime


# ---------------------------------------------------------------------------
# Parent requests (lightweight one-message-one-reply tickets)
# ---------------------------------------------------------------------------


class ParentRequestCreate(BaseModel):
    student_id: UUID
    target_type: ParentRequestTargetType
    teacher_id: UUID | None = None
    course_id: UUID | None = None
    subject: str = Field(min_length=1, max_length=220)
    body: str = Field(min_length=1)


class ParentRequestReply(BaseModel):
    reply_body: str = Field(min_length=1)


class ParentRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    parent_id: UUID
    student_id: UUID
    target_type: ParentRequestTargetType
    teacher_id: UUID | None
    course_id: UUID | None
    subject: str
    body: str
    status: str
    reply_body: str | None
    replied_by: UUID | None
    replied_at: datetime | None
    created_at: datetime
