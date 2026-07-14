from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------


class StudentProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    date_of_birth: date | None
    gender: str | None
    national_id: str | None
    whatsapp: str | None
    nickname: str | None
    avatar: str | None
    created_at: datetime
    updated_at: datetime


class StudentProfileUpdate(BaseModel):
    whatsapp: str | None = Field(default=None, max_length=40)
    nickname: str | None = Field(default=None, max_length=80)
    avatar: str | None = Field(default=None, max_length=500)


# ---------------------------------------------------------------------------
# Parent linking (student side)
# ---------------------------------------------------------------------------


class ParentLinkCodeRead(BaseModel):
    code: str


class ParentLinkRequestRead(BaseModel):
    id: UUID
    parent_id: UUID
    parent_full_name: str
    parent_public_code: str
    status: str
    requested_at: datetime


class ParentInviteCreate(BaseModel):
    email: str = Field(min_length=3, max_length=320)


class ParentInviteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invited_email: str
    status: str
    created_at: datetime
    resolved_at: datetime | None


# ---------------------------------------------------------------------------
# Pods
# ---------------------------------------------------------------------------


class StudentPodCreate(BaseModel):
    course_id: UUID
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class StudentPodUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None


class StudentPodMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: UUID
    full_name: str
    email: str


class StudentPodRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    course_id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
    members: list[StudentPodMemberRead] = Field(default_factory=list)


class PodMemberAdd(BaseModel):
    student_id: UUID


# ---------------------------------------------------------------------------
# Roster / progress / at-risk
# ---------------------------------------------------------------------------


class StudentRosterEntry(BaseModel):
    student_id: UUID
    public_code: str
    full_name: str
    email: str
    course_id: UUID
    enrolled_at: datetime
    progress_percent: float
    quiz_average: float | None
    sessions_completed: int
    sessions_total: int
    last_activity_at: datetime | None


class StudentProgressEntry(BaseModel):
    student_id: UUID
    full_name: str
    course_id: UUID
    sessions_completed: int
    sessions_total: int
    progress_percent: float
    quiz_average: float | None
    watch_time_minutes: int


class AtRiskEntry(BaseModel):
    student_id: UUID
    full_name: str
    course_id: UUID
    risk_level: str  # "high" | "medium" | "low" | "none"
    risk_reasons: list[str]
    progress_percent: float
    quiz_average: float | None
    last_activity_at: datetime | None


# ---------------------------------------------------------------------------
# Wrong questions
# ---------------------------------------------------------------------------


class WrongQuestionEntry(BaseModel):
    student_id: UUID
    full_name: str
    question_id: UUID
    question_title: str
    course_id: UUID
    course_title: str
    chapter: str | None
    concept: str | None
    atomic_concept: str | None
    question_type: str
    difficulty: str
    retry_count: int
    last_wrong_at: datetime | None


# ---------------------------------------------------------------------------
# Memory / retention insights
# ---------------------------------------------------------------------------


class ConceptScore(BaseModel):
    concept: str
    score: float
    last_practiced_at: datetime | None


class MemoryInsightEntry(BaseModel):
    student_id: UUID
    full_name: str
    strengths: list[str]
    weak_concepts: list[ConceptScore]
    recommendations: list[str]


# ---------------------------------------------------------------------------
# Reports (course-level aggregate)
# ---------------------------------------------------------------------------


class CourseReportSummary(BaseModel):
    course_id: UUID
    course_title: str
    total_students: int
    active_students: int
    average_progress_percent: float
    average_quiz_score: float | None
    at_risk_count: int
    certificates_issued: int
    total_revenue: float
    pending_payments: float
