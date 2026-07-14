from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.assistants.models import AssistantAction, AssistantResource


class AssistantInviteCreate(BaseModel):
    email: str = Field(min_length=3, max_length=320)


class AssistantInviteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invited_email: str
    status: str
    created_at: datetime
    resolved_at: datetime | None


class AssistantLinkRead(BaseModel):
    link_id: UUID
    assistant_id: UUID
    full_name: str
    public_code: str
    status: str


class AssistantInvitationRead(BaseModel):
    link_id: UUID
    teacher_id: UUID
    teacher_full_name: str
    teacher_public_code: str
    invited_at: datetime


class AssistantPermissionGrant(BaseModel):
    resource: AssistantResource
    action: AssistantAction


class AssistantPermissionsUpdate(BaseModel):
    grants: list[AssistantPermissionGrant] = Field(default_factory=list)


class AssistantTeacherPermissionsRead(BaseModel):
    teacher_id: UUID
    teacher_full_name: str
    permissions: list[AssistantPermissionGrant]
