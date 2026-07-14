from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.courses.schemas import CourseRead
from app.modules.progress.schemas import CourseProgressRead
from app.modules.enrollments.models import EnrollmentStatus


class EnrollmentCreate(BaseModel):
    course_id: UUID
    coupon_code: str | None = None


class EnrollmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    course_id: UUID
    status: EnrollmentStatus
    enrolled_at: datetime
    created_at: datetime
    updated_at: datetime
    course: CourseRead
    progress: CourseProgressRead | None = None


class EnrollmentStatusRead(BaseModel):
    enrolled: bool
    enrollment: EnrollmentRead | None = None


class EnrollmentListResponse(BaseModel):
    items: list[EnrollmentRead] = Field(default_factory=list)
