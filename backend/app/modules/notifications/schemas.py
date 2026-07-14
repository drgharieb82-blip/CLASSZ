from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.notifications.models import NotificationCategory, NotificationPriority


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    user_id: UUID
    category: NotificationCategory
    priority: NotificationPriority
    title: str
    body: str
    action_label: str | None
    action_url: str | None
    payload_json: dict[str, object]
    is_read: bool
    read_at: datetime | None
    is_archived: bool
    archived_at: datetime | None
    created_at: datetime
    updated_at: datetime


class NotificationSummaryRead(BaseModel):
    unread_count: int
    total_count: int
    important_count: int
    urgent_count: int


class NotificationListRead(BaseModel):
    summary: NotificationSummaryRead
    items: list[NotificationRead] = Field(default_factory=list)


class NotificationCreate(BaseModel):
    user_id: UUID
    category: NotificationCategory = NotificationCategory.SYSTEM
    priority: NotificationPriority = NotificationPriority.NORMAL
    title: str = Field(min_length=1, max_length=220)
    body: str = Field(min_length=1)
    action_label: str | None = Field(default=None, max_length=80)
    action_url: str | None = Field(default=None, max_length=500)
    payload_json: dict[str, object] = Field(default_factory=dict)


class NotificationUpdate(BaseModel):
    is_read: bool | None = None
    is_archived: bool | None = None
