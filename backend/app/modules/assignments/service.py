from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.models.user import Role, User
from app.modules.assignments.models import Assignment, AssignmentSubmission, AssignmentSubmissionStatus, SubmissionFile
from app.modules.assignments.schemas import AssignmentCreate, AssignmentRead, AssignmentSubmissionCreate
from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment, EnrollmentStatus


def _assignment_options():
    return selectinload(Assignment.submissions).selectinload(AssignmentSubmission.files)


def scope_submissions_to_student(assignment: Assignment, student_id: UUID) -> AssignmentRead:
    """`Assignment.submissions` eager-loads every student's submission —
    fine for a teacher grading their own course, but any single-student
    viewer (the student themself, or a linked parent) must never see another
    student's submission text embedded in the response."""
    read = AssignmentRead.model_validate(assignment)
    read.submissions = [s for s in read.submissions if s.student_id == student_id]
    return read


async def list_assignments_for_student(session: AsyncSession, student_id: UUID) -> list[Assignment]:
    query = (
        select(Assignment)
        .options(_assignment_options())
        .join(Enrollment, Enrollment.course_id == Assignment.course_id)
        .where(Enrollment.student_id == student_id, Enrollment.status == EnrollmentStatus.ACTIVE)
        .order_by(Assignment.created_at.desc())
    )
    result = await session.execute(query)
    return list(result.scalars().all())


async def list_assignments(session: AsyncSession, current_user: User) -> list[Assignment]:
    if current_user.role == Role.STUDENT:
        return await list_assignments_for_student(session, current_user.id)

    query = select(Assignment).options(_assignment_options()).order_by(Assignment.created_at.desc())
    if current_user.role == Role.TEACHER:
        query = query.join(Course, Course.id == Assignment.course_id).where(Course.teacher_id == current_user.id)

    result = await session.execute(query)
    return list(result.scalars().all())


async def get_assignment(session: AsyncSession, assignment_id: UUID) -> Assignment | None:
    result = await session.execute(
        select(Assignment)
        .where(Assignment.id == assignment_id)
        .options(_assignment_options())
    )
    return result.scalar_one_or_none()


async def create_assignment(session: AsyncSession, payload: AssignmentCreate) -> Assignment:
    assignment = Assignment(**payload.model_dump())
    session.add(assignment)
    await session.commit()
    return await get_assignment(session, assignment.id) or assignment


async def submit_assignment(
    session: AsyncSession,
    assignment_id: UUID,
    student_id: UUID,
    payload: AssignmentSubmissionCreate,
) -> AssignmentSubmission | None:
    assignment = await get_assignment(session, assignment_id)
    if assignment is None:
        return None

    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=student_id,
        submission_text=payload.submission_text,
        status=AssignmentSubmissionStatus.SUBMITTED,
    )
    session.add(submission)
    await session.flush()

    for file_payload in payload.files:
        session.add(SubmissionFile(submission_id=submission.id, **file_payload.model_dump()))

    await session.commit()
    result = await session.execute(
        select(AssignmentSubmission)
        .where(AssignmentSubmission.id == submission.id)
        .options(selectinload(AssignmentSubmission.files))
    )
    return result.scalar_one()
