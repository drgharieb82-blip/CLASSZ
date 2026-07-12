from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import Role
from app.modules.students.schemas import StudentProfileRead
from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=160)
    role: Role = Role.STUDENT

    # Student profile — optional, only persisted when role == STUDENT.
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=20)
    national_id: str | None = Field(default=None, max_length=50)
    whatsapp: str | None = Field(default=None, max_length=40)
    nickname: str | None = Field(default=None, max_length=80)
    avatar: str | None = Field(default=None, max_length=500)

    # Parent/guardian contact — optional, only persisted when role == STUDENT
    # and a name is provided. Stored as a `ParentContact` record (see
    # backend/app/modules/parents/models.py), not a linked Parent user.
    parent_name: str | None = Field(default=None, max_length=160)
    parent_relation: str | None = Field(default=None, max_length=60)
    parent_whatsapp: str | None = Field(default=None, max_length=40)

    @field_validator("role")
    @classmethod
    def restrict_self_registration(cls, v: Role) -> Role:
        if v not in (Role.STUDENT, Role.PARENT, Role.ASSISTANT):
            raise ValueError("Only student, parent, and assistant accounts can self-register")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    detail: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead
    student: StudentProfileRead | None = None


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
