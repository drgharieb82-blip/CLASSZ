from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRead


class RegisterTeacherRequest(BaseModel):
    # Account
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=160)

    # Identity
    name_on_id: str | None = Field(default=None, max_length=160)
    national_id: str | None = Field(default=None, max_length=50)
    id_document_url: str | None = Field(default=None, max_length=500)
    photo_url: str | None = Field(default=None, max_length=500)
    gender: str | None = Field(default=None, max_length=20)
    date_of_birth: date | None = None

    # Profile
    nickname: str | None = Field(default=None, max_length=80)
    bio: str | None = None
    headline: str | None = Field(default=None, max_length=200)
    specialization: str | None = Field(default=None, max_length=160)
    social_links: dict[str, str] = Field(default_factory=dict)
    mobile_number: str | None = Field(default=None, max_length=30)

    # Certification
    certification_text: str | None = None
    certification_document_url: str | None = Field(default=None, max_length=500)


class TeacherProfileRead(BaseModel):
    id: UUID
    user_id: UUID
    name_on_id: str | None
    national_id: str | None
    id_document_url: str | None
    photo_url: str | None
    nickname: str | None
    bio: str | None
    social_links: dict[str, str]
    mobile_number: str | None
    mobile_verified: bool
    certification_text: str | None
    certification_document_url: str | None
    specialization: str | None
    headline: str | None
    gender: str | None
    date_of_birth: date | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeacherRegisterResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead
    teacher: TeacherProfileRead
