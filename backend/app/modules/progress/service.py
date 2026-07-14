from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import UTC, datetime
from statistics import fmean
from uuid import UUID

from sqlalchemy import and_, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import migrations  # noqa: F401
from app.models.user import User
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment
from app.modules.progress.models import SessionProgress
from app.modules.progress.schemas import (
    CourseProgressRead,
    SessionProgressComplete,
    SessionProgressRead,
    SessionProgressStart,
    SessionProgressUpdate,
    StudentProgressSummaryRead,
)
from app.modules.quizzes.models import Quiz
from app.modules.quiz_attempts.models import QuizAttempt, QuizAttemptStatus
from app.modules.results.models import QuizResult
from app.modules.sessions.models import Session, SessionStatus


@dataclass(slots=True)
class _CourseAccumulator:
    course_id: UUID
    course_title: str
    subject: str
    grade: str
    teacher_name: str | None
    session_rows: list[tuple[UUID, str, int, datetime | None, int]] = field(default_factory=list)
    quiz_ids: set[UUID] = field(default_factory=set)
    quiz_scores: dict[UUID, tuple[datetime, float]] = field(default_factory=dict)

    def to_read(self) -> CourseProgressRead:
        sessions_total = len(self.session_rows)
        sessions_completed = sum(1 for _, _, _, completed_at, _ in self.session_rows if completed_at is not None)
        quizzes_total = len(self.quiz_ids)
        quizzes_completed = len(self.quiz_scores)
        average_score = round(fmean(score for _, score in self.quiz_scores.values()), 2) if self.quiz_scores else 0.0
        progress_percent = round((sessions_completed / sessions_total) * 100, 2) if sessions_total else 0.0
        total_time_minutes = round(sum(last_position_seconds for _, _, _, _, last_position_seconds in self.session_rows) / 60)
        last_session_title = next(
            (title for _, title, _, completed_at, _ in reversed(self.session_rows) if completed_at is not None),
            self.session_rows[-1][1] if self.session_rows else None,
        )
        next_session_title = next(
            (title for _, title, _, completed_at, _ in self.session_rows if completed_at is None),
            None,
        )
        status = "completed" if sessions_total and sessions_completed == sessions_total else "active"
        return CourseProgressRead(
            course_id=self.course_id,
            course_title=self.course_title,
            subject=self.subject,
            grade=self.grade,
            teacher_name=self.teacher_name,
            progress_percent=progress_percent,
            sessions_completed=sessions_completed,
            sessions_total=sessions_total,
            quizzes_completed=quizzes_completed,
            quizzes_total=quizzes_total,
            average_score=average_score,
            last_session_title=last_session_title,
            next_session_title=next_session_title,
            total_time_minutes=total_time_minutes,
            status=status,
        )


async def get_session_progress(
    session: AsyncSession,
    session_id: UUID,
    student_id: UUID,
) -> SessionProgress | None:
    result = await session.execute(
        select(SessionProgress).where(
            SessionProgress.session_id == session_id,
            SessionProgress.student_id == student_id,
        )
    )
    return result.scalar_one_or_none()


async def start_session_progress(
    session: AsyncSession,
    student_id: UUID,
    payload: SessionProgressStart,
) -> SessionProgress:
    progress = await get_session_progress(session, payload.session_id, student_id)
    now = datetime.now(UTC)

    if progress is None:
        progress = SessionProgress(
            student_id=student_id,
            session_id=payload.session_id,
            started_at=now,
            percent_complete=0,
            last_position_seconds=payload.last_position_seconds,
        )
        session.add(progress)
    else:
        progress.started_at = progress.started_at or now
        progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)
    return progress


async def update_session_progress(
    session: AsyncSession,
    student_id: UUID,
    payload: SessionProgressUpdate,
) -> SessionProgress:
    progress = await get_session_progress(session, payload.session_id, student_id)
    if progress is None:
        progress = SessionProgress(
            student_id=student_id,
            session_id=payload.session_id,
            started_at=datetime.now(UTC),
        )
        session.add(progress)

    progress.percent_complete = payload.percent_complete
    progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)
    return progress


async def complete_session_progress(
    session: AsyncSession,
    student_id: UUID,
    payload: SessionProgressComplete,
) -> SessionProgress:
    progress = await get_session_progress(session, payload.session_id, student_id)
    now = datetime.now(UTC)

    if progress is None:
        progress = SessionProgress(
            student_id=student_id,
            session_id=payload.session_id,
            started_at=now,
        )
        session.add(progress)

    progress.completed_at = now
    progress.percent_complete = 100
    progress.last_position_seconds = payload.last_position_seconds

    await session.commit()
    await session.refresh(progress)

    await _maybe_issue_completion_certificate(session, student_id, payload.session_id)

    return progress


async def _maybe_issue_completion_certificate(
    session: AsyncSession,
    student_id: UUID,
    session_id: UUID,
) -> None:
    course_id_result = await session.execute(select(Session.course_id).where(Session.id == session_id))
    course_id = course_id_result.scalar_one_or_none()
    if course_id is None:
        return

    course_progress = await get_student_course_progress(session, student_id, course_id)
    if course_progress is None or course_progress.status != "completed":
        return

    from app.modules.certificates.service import ensure_certificate_for_course_completion

    await ensure_certificate_for_course_completion(session, student_id, course_id)


async def get_student_course_progress_map(
    session: AsyncSession,
    student_id: UUID,
) -> dict[UUID, CourseProgressRead]:
    accumulators = await _build_course_accumulators(session, student_id)
    return {course_id: accumulator.to_read() for course_id, accumulator in accumulators.items()}


async def get_student_course_progress(
    session: AsyncSession,
    student_id: UUID,
    course_id: UUID,
) -> CourseProgressRead | None:
    progress_map = await get_student_course_progress_map(session, student_id)
    return progress_map.get(course_id)


async def get_student_progress_summary(
    session: AsyncSession,
    student_id: UUID,
) -> StudentProgressSummaryRead:
    progress_map = await get_student_course_progress_map(session, student_id)
    courses = list(progress_map.values())

    total_courses_enrolled = len(courses)
    total_courses_completed = sum(1 for course in courses if course.status == "completed")
    total_sessions_completed = sum(course.sessions_completed for course in courses)
    total_sessions = sum(course.sessions_total for course in courses)
    total_quizzes_completed = sum(course.quizzes_completed for course in courses)
    total_quizzes = sum(course.quizzes_total for course in courses)
    total_time_minutes = sum(course.total_time_minutes for course in courses)
    overall_progress_percent = round((total_sessions_completed / total_sessions) * 100, 2) if total_sessions else 0.0
    average_scores = [course.average_score for course in courses if course.quizzes_completed > 0]
    overall_average_score = round(fmean(average_scores), 2) if average_scores else 0.0

    return StudentProgressSummaryRead(
        overall_progress_percent=overall_progress_percent,
        total_courses_enrolled=total_courses_enrolled,
        total_courses_completed=total_courses_completed,
        total_sessions_completed=total_sessions_completed,
        total_sessions=total_sessions,
        total_quizzes_completed=total_quizzes_completed,
        total_quizzes=total_quizzes,
        overall_average_score=overall_average_score,
        total_time_minutes=total_time_minutes,
        courses=courses,
    )


async def _build_course_accumulators(
    session: AsyncSession,
    student_id: UUID,
) -> dict[UUID, _CourseAccumulator]:
    course_rows = await session.execute(
        select(
            Course.id,
            Course.title,
            Course.subject,
            Course.grade,
            User.full_name,
        )
        .join(Enrollment, Enrollment.course_id == Course.id)
        .join(User, User.id == Course.teacher_id)
        .where(
            Enrollment.student_id == student_id,
            Course.is_published.is_(True),
        )
        .order_by(Enrollment.enrolled_at.desc())
    )

    accumulators: dict[UUID, _CourseAccumulator] = {}
    for course_id, title, subject, grade, teacher_name in course_rows.all():
        accumulators[course_id] = _CourseAccumulator(
            course_id=course_id,
            course_title=title,
            subject=subject,
            grade=grade,
            teacher_name=teacher_name,
        )

    if not accumulators:
        return accumulators

    session_rows = await session.execute(
        select(
            Session.course_id,
            Session.id,
            Session.title,
            Session.position,
            SessionProgress.completed_at,
            SessionProgress.percent_complete,
            SessionProgress.last_position_seconds,
        )
        .join(Enrollment, Enrollment.course_id == Session.course_id)
        .outerjoin(
            SessionProgress,
            and_(
                SessionProgress.session_id == Session.id,
                SessionProgress.student_id == student_id,
            ),
        )
        .where(
            Enrollment.student_id == student_id,
            Session.status == SessionStatus.published,
            Session.course_id.in_(accumulators.keys()),
        )
        .order_by(Session.course_id, Session.position)
    )
    for course_id, session_id, title, position, completed_at, percent_complete, last_position_seconds in session_rows.all():
        accumulator = accumulators.get(course_id)
        if accumulator is None:
            continue
        accumulator.session_rows.append(
            (
                session_id,
                title,
                position,
                completed_at,
                int(last_position_seconds or 0),
            )
        )

    quiz_rows = await session.execute(
        select(
            Quiz.course_id,
            Quiz.id,
            QuizResult.percentage,
            QuizResult.graded_at,
        )
        .join(Enrollment, Enrollment.course_id == Quiz.course_id)
        .outerjoin(
            QuizAttempt,
            and_(
                QuizAttempt.quiz_id == Quiz.id,
                QuizAttempt.student_id == student_id,
            ),
        )
        .outerjoin(QuizResult, QuizResult.attempt_id == QuizAttempt.id)
        .where(
            Enrollment.student_id == student_id,
            Quiz.is_published.is_(True),
            Quiz.course_id.in_(accumulators.keys()),
        )
        .order_by(Quiz.course_id, Quiz.created_at)
    )
    for course_id, quiz_id, percentage, graded_at in quiz_rows.all():
        accumulator = accumulators.get(course_id)
        if accumulator is None or quiz_id is None:
            continue
        accumulator.quiz_ids.add(quiz_id)
        if percentage is None:
            continue
        completed_at = graded_at or datetime.min.replace(tzinfo=UTC)
        current = accumulator.quiz_scores.get(quiz_id)
        if current is None or completed_at >= current[0]:
            accumulator.quiz_scores[quiz_id] = (completed_at, float(percentage))

    return accumulators
