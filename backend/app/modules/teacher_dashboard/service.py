from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.assignments.models import Assignment, AssignmentSubmission
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.grading.models import ManualGrade
from app.modules.quiz_attempts.models import QuizAttempt
from app.modules.results.models import QuestionResult, QuizResult
from app.modules.sessions.models import Session
from app.modules.quizzes.models import Quiz
from app.modules.teacher_dashboard.schemas import (
    TeacherActivityItem,
    TeacherCourseOverviewItem,
    TeacherDashboardSummary,
    TeacherPendingTask,
    TeacherPendingTasksResponse,
    TeacherRecentActivity,
)


async def _teacher_course_ids(session: AsyncSession, teacher_id: UUID) -> list[UUID]:
    result = await session.execute(select(Course.id).where(Course.teacher_id == teacher_id))
    return list(result.scalars().all())


def _pending_grades_query(course_ids: list[UUID]):
    """A manual grade belongs to this teacher if it's for an assignment
    submission under one of their courses, or for a quiz question result
    under one of their courses (via quiz_result -> attempt -> quiz)."""
    return (
        select(ManualGrade)
        .outerjoin(AssignmentSubmission, ManualGrade.assignment_submission_id == AssignmentSubmission.id)
        .outerjoin(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .outerjoin(QuestionResult, ManualGrade.question_result_id == QuestionResult.id)
        .outerjoin(QuizResult, QuestionResult.quiz_result_id == QuizResult.id)
        .outerjoin(QuizAttempt, QuizResult.attempt_id == QuizAttempt.id)
        .outerjoin(Quiz, QuizAttempt.quiz_id == Quiz.id)
        .where(or_(Assignment.course_id.in_(course_ids), Quiz.course_id.in_(course_ids)))
        .options(
            selectinload(ManualGrade.assignment_submission),
            selectinload(ManualGrade.question_result).selectinload(QuestionResult.question),
        )
    )


async def get_summary(session: AsyncSession, teacher_id: UUID) -> TeacherDashboardSummary:
    course_ids = await _teacher_course_ids(session, teacher_id)
    pending_result = await session.execute(_pending_grades_query(course_ids))
    pending_tasks = list(pending_result.scalars().unique().all())

    return TeacherDashboardSummary(
        total_courses=len(course_ids),
        total_sessions=await _course_scoped_count(session, Session, course_ids),
        total_students=await _count_students(session, course_ids),
        pending_grading_count=len(pending_tasks),
        assignments_count=await _course_scoped_count(session, Assignment, course_ids),
        quizzes_count=await _course_scoped_count(session, Quiz, course_ids),
    )


async def get_pending_tasks(session: AsyncSession, teacher_id: UUID) -> TeacherPendingTasksResponse:
    course_ids = await _teacher_course_ids(session, teacher_id)
    result = await session.execute(_pending_grades_query(course_ids))
    tasks = [_pending_grade_to_task(grade) for grade in result.scalars().unique().all()]
    return TeacherPendingTasksResponse(pending_tasks=tasks)


async def get_recent_activity(session: AsyncSession, teacher_id: UUID) -> TeacherRecentActivity:
    course_ids = await _teacher_course_ids(session, teacher_id)
    recent_quizzes = await _recent_quizzes(session, course_ids)
    recent_assignments = await _recent_assignments(session, course_ids)
    course_overview = await _course_overview(session, teacher_id)
    return TeacherRecentActivity(
        recent_quizzes=recent_quizzes,
        recent_assignments=recent_assignments,
        course_overview=course_overview,
    )


async def _course_scoped_count(session: AsyncSession, model: type, course_ids: list[UUID]) -> int:
    if not course_ids:
        return 0
    result = await session.execute(select(func.count(model.id)).where(model.course_id.in_(course_ids)))
    return int(result.scalar_one() or 0)


async def _count_students(session: AsyncSession, course_ids: list[UUID]) -> int:
    if not course_ids:
        return 0
    result = await session.execute(
        select(func.count(func.distinct(Enrollment.student_id))).where(Enrollment.course_id.in_(course_ids))
    )
    return int(result.scalar_one() or 0)


async def _recent_quizzes(session: AsyncSession, course_ids: list[UUID]) -> list[TeacherActivityItem]:
    if not course_ids:
        return []
    result = await session.execute(
        select(Quiz).where(Quiz.course_id.in_(course_ids)).order_by(Quiz.created_at.desc()).limit(5)
    )
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


async def _recent_assignments(session: AsyncSession, course_ids: list[UUID]) -> list[TeacherActivityItem]:
    if not course_ids:
        return []
    result = await session.execute(
        select(Assignment).where(Assignment.course_id.in_(course_ids)).order_by(Assignment.created_at.desc()).limit(5)
    )
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


async def _course_overview(session: AsyncSession, teacher_id: UUID) -> list[TeacherCourseOverviewItem]:
    result = await session.execute(
        select(Course)
        .where(Course.teacher_id == teacher_id)
        .options(selectinload(Course.sessions))
        .order_by(Course.updated_at.desc())
        .limit(6)
    )
    courses = list(result.scalars().all())
    overview: list[TeacherCourseOverviewItem] = []

    for course in courses:
        sessions_count = len(course.sessions)
        quizzes_count = await _course_count(session, Quiz, course.id)
        assignments_count = await _course_count(session, Assignment, course.id)
        overview.append(
            TeacherCourseOverviewItem(
                id=course.id,
                title=course.title,
                subject=course.subject,
                grade=course.grade,
                is_published=course.is_published,
                sessions_count=sessions_count,
                quizzes_count=quizzes_count,
                assignments_count=assignments_count,
            )
        )

    return overview


async def _course_count(session: AsyncSession, model: type, course_id: UUID) -> int:
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
