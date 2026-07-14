from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SessionProgressStart(BaseModel):
    session_id: UUID
    last_position_seconds: int = Field(default=0, ge=0)


class SessionProgressUpdate(BaseModel):
    session_id: UUID
    percent_complete: int = Field(ge=0, le=100)
    last_position_seconds: int = Field(ge=0)


class SessionProgressComplete(BaseModel):
    session_id: UUID
    last_position_seconds: int = Field(default=0, ge=0)


class SessionProgressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    session_id: UUID
    started_at: datetime | None
    completed_at: datetime | None
    percent_complete: int
    last_position_seconds: int
    created_at: datetime
    updated_at: datetime


class CourseProgressRead(BaseModel):
    course_id: UUID
    course_title: str
    subject: str
    grade: str
    teacher_name: str | None = None
    progress_percent: float
    sessions_completed: int
    sessions_total: int
    quizzes_completed: int
    quizzes_total: int
    average_score: float
    last_session_title: str | None = None
    next_session_title: str | None = None
    total_time_minutes: int = 0
    status: str = "active"


class StudentProgressSummaryRead(BaseModel):
    overall_progress_percent: float
    total_courses_enrolled: int
    total_courses_completed: int
    total_sessions_completed: int
    total_sessions: int
    total_quizzes_completed: int
    total_quizzes: int
    overall_average_score: float
    total_time_minutes: int
    courses: list[CourseProgressRead] = Field(default_factory=list)
