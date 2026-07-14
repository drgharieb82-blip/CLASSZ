from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.certificates.models import CertificateStatus


class CertificateCreate(BaseModel):
    student_id: UUID
    course_id: UUID
    title: str = Field(min_length=1, max_length=200)


class CertificateUpdate(BaseModel):
    status: CertificateStatus | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)


class CertificateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_code: str
    student_id: UUID
    student_name: str
    course_id: UUID
    course_title: str
    title: str
    status: CertificateStatus
    issued_at: datetime
