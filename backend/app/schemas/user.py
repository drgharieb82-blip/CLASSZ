from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import Role


class UserRead(BaseModel):
    """Public user representation. Uses public_code as the primary identifier."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    email: EmailStr
    full_name: str
    role: Role
    is_active: bool
    created_at: datetime
