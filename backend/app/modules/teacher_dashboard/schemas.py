from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TeacherDashboardSummary(BaseModel):
    total_courses: int
    total_lessons: int
    total_students: int
    pending_grading_count: int
    assignments_count: int
    quizzes_count: int


class TeacherCourseOverviewItem(BaseModel):
    id: UUID
    title: str
    subject: str
    grade: str
    is_published: bool
    lessons_count: int
    quizzes_count: int
    assignments_count: int


class TeacherPendingTask(BaseModel):
    id: UUID
    task_type: str
    title: str
    student_id: UUID
    max_score: int
    created_at: datetime | None = None


class TeacherActivityItem(BaseModel):
    id: UUID
    activity_type: str
    title: str
    created_at: datetime
    metadata: dict[str, str | int | bool | None] = Field(default_factory=dict)


class TeacherRecentActivity(BaseModel):
    recent_quizzes: list[TeacherActivityItem] = Field(default_factory=list)
    recent_assignments: list[TeacherActivityItem] = Field(default_factory=list)
    course_overview: list[TeacherCourseOverviewItem] = Field(default_factory=list)


class TeacherPendingTasksResponse(BaseModel):
    pending_tasks: list[TeacherPendingTask] = Field(default_factory=list)
