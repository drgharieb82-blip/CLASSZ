from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import migrations  # noqa: F401
from app.modules.assignments.models import Assignment, AssignmentSubmission, AssignmentSubmissionStatus, SubmissionFile
from app.modules.assignments.schemas import AssignmentCreate, AssignmentSubmissionCreate


def _assignment_options():
    return selectinload(Assignment.submissions).selectinload(AssignmentSubmission.files)


async def list_assignments(session: AsyncSession) -> list[Assignment]:
    result = await session.execute(
        select(Assignment)
        .options(_assignment_options())
        .order_by(Assignment.created_at.desc())
    )
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
    payload: AssignmentSubmissionCreate,
) -> AssignmentSubmission | None:
    assignment = await get_assignment(session, assignment_id)
    if assignment is None:
        return None

    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=payload.student_id,
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
