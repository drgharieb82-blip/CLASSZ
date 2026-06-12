from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.models import Role, User
from app.modules.assignments.models import Assignment, AssignmentSubmission
from app.modules.chapters.models import Chapter
from app.modules.courses.models import Course
from app.modules.grading import service as grading_service
from app.modules.grading.models import ManualGrade
from app.modules.lessons.models import Lesson
from app.modules.quizzes.models import Quiz
from app.modules.teacher_dashboard.schemas import (
    TeacherActivityItem,
    TeacherCourseOverviewItem,
    TeacherDashboardSummary,
    TeacherPendingTask,
    TeacherPendingTasksResponse,
    TeacherRecentActivity,
)


async def get_summary(session: AsyncSession) -> TeacherDashboardSummary:
    pending_tasks = await grading_service.list_pending_grades(session)

    return TeacherDashboardSummary(
        total_courses=await _count(session, Course),
        total_lessons=await _count(session, Lesson),
        total_students=await _count_students(session),
        pending_grading_count=len(pending_tasks),
        assignments_count=await _count(session, Assignment),
        quizzes_count=await _count(session, Quiz),
    )


async def get_pending_tasks(session: AsyncSession) -> TeacherPendingTasksResponse:
    pending_grades = await grading_service.list_pending_grades(session)
    tasks = [_pending_grade_to_task(grade) for grade in pending_grades]
    return TeacherPendingTasksResponse(pending_tasks=tasks)


async def get_recent_activity(session: AsyncSession) -> TeacherRecentActivity:
    recent_quizzes = await _recent_quizzes(session)
    recent_assignments = await _recent_assignments(session)
    course_overview = await _course_overview(session)
    return TeacherRecentActivity(
        recent_quizzes=recent_quizzes,
        recent_assignments=recent_assignments,
        course_overview=course_overview,
    )


async def _count(session: AsyncSession, model: type) -> int:
    result = await session.execute(select(func.count(model.id)))
    return int(result.scalar_one() or 0)


async def _count_students(session: AsyncSession) -> int:
    result = await session.execute(select(func.count(User.id)).where(User.role == Role.STUDENT))
    return int(result.scalar_one() or 0)


async def _recent_quizzes(session: AsyncSession) -> list[TeacherActivityItem]:
    result = await session.execute(select(Quiz).order_by(Quiz.created_at.desc()).limit(5))
    return [
        TeacherActivityItem(
            id=quiz.id,
            activity_type="QUIZ",
            title=quiz.title,
            created_at=quiz.created_at,
            metadata={
                "duration_minutes": quiz.duration_minutes,
                "passing_score": quiz.passing_score,
                "is_published": quiz.is_published,
            },
        )
        for quiz in result.scalars().all()
    ]


async def _recent_assignments(session: AsyncSession) -> list[TeacherActivityItem]:
    result = await session.execute(select(Assignment).order_by(Assignment.created_at.desc()).limit(5))
    return [
        TeacherActivityItem(
            id=assignment.id,
            activity_type="ASSIGNMENT",
            title=assignment.title,
            created_at=assignment.created_at,
            metadata={
                "max_points": assignment.max_points,
                "deadline_at": assignment.deadline_at.isoformat() if assignment.deadline_at else None,
                "allow_multiple_submissions": assignment.allow_multiple_submissions,
            },
        )
        for assignment in result.scalars().all()
    ]


async def _course_overview(session: AsyncSession) -> list[TeacherCourseOverviewItem]:
    result = await session.execute(
        select(Course)
        .options(selectinload(Course.chapters).selectinload(Chapter.lessons))
        .order_by(Course.updated_at.desc())
        .limit(6)
    )
    courses = list(result.scalars().all())
    overview: list[TeacherCourseOverviewItem] = []

    for course in courses:
        lessons_count = sum(len(chapter.lessons) for chapter in course.chapters)
        quizzes_count = await _course_count(session, Quiz, course.id)
        assignments_count = await _course_count(session, Assignment, course.id)
        overview.append(
            TeacherCourseOverviewItem(
                id=course.id,
                title=course.title,
                subject=course.subject,
                grade=course.grade,
                is_published=course.is_published,
                lessons_count=lessons_count,
                quizzes_count=quizzes_count,
                assignments_count=assignments_count,
            )
        )

    return overview


async def _course_count(session: AsyncSession, model: type, course_id) -> int:
    result = await session.execute(select(func.count(model.id)).where(model.course_id == course_id))
    return int(result.scalar_one() or 0)


def _pending_grade_to_task(grade: ManualGrade) -> TeacherPendingTask:
    is_assignment = grade.assignment_submission is not None
    title = "Assignment submission"
    created_at = None
    if grade.assignment_submission is not None:
        title = "Assignment submission"
        created_at = grade.assignment_submission.submitted_at
    elif grade.question_result is not None and grade.question_result.question is not None:
        title = grade.question_result.question.title

    return TeacherPendingTask(
        id=grade.id,
        task_type="ASSIGNMENT" if is_assignment else "ESSAY",
        title=title,
        student_id=grade.student_id,
        max_score=grade.max_score,
        created_at=created_at,
    )
