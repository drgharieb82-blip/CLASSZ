from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import Role
from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=160)
    role: Role = Role.STUDENT

    @field_validator("role")
    @classmethod
    def restrict_self_registration(cls, v: Role) -> Role:
        if v not in (Role.STUDENT, Role.PARENT):
            raise ValueError("Only student and parent accounts can self-register")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
