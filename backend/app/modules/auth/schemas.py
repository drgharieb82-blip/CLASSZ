from pydantic import BaseModel

from app.models.user import Role


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class CurrentUserRead(BaseModel):
    id: str
    email: str
    full_name: str
    role: Role
