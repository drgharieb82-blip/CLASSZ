from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.modules.certificates.schemas import CertificateRead
from app.modules.notifications.schemas import NotificationRead, NotificationSummaryRead
from app.modules.progress.schemas import CourseProgressRead, StudentProgressSummaryRead


class StudentProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: UUID
    full_name: str
    email: EmailStr
    public_code: str
    headline: str | None
    bio: str | None
    avatar_url: str | None
    timezone: str
    language: str
    theme: str
    notifications_enabled: bool
    email_notifications: bool
    push_notifications: bool
    weekly_digest_enabled: bool
    study_reminder_enabled: bool
    study_goal_minutes: int
    created_at: datetime
    updated_at: datetime


class StudentProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=160)
    headline: str | None = Field(default=None, max_length=160)
    bio: str | None = None
    avatar_url: str | None = Field(default=None, max_length=500)


class StudentSettingsUpdate(BaseModel):
    timezone: str | None = Field(default=None, max_length=80)
    language: str | None = Field(default=None, max_length=12)
    theme: str | None = Field(default=None, max_length=20)
    notifications_enabled: bool | None = None
    email_notifications: bool | None = None
    push_notifications: bool | None = None
    weekly_digest_enabled: bool | None = None
    study_reminder_enabled: bool | None = None
    study_goal_minutes: int | None = Field(default=None, ge=5, le=600)


class StudentDashboardSummaryRead(BaseModel):
    student_id: UUID
    full_name: str
    headline: str | None
    avatar_url: str | None
    wallet_balance: float
    notifications: NotificationSummaryRead
    progress: StudentProgressSummaryRead
    featured_courses: list[CourseProgressRead] = Field(default_factory=list)
    recent_notifications: list[NotificationRead] = Field(default_factory=list)
    recent_certificates: list[CertificateRead] = Field(default_factory=list)

