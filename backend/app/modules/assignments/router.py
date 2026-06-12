from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.assignments import service
from app.modules.assignments.schemas import (
    AssignmentCreate,
    AssignmentRead,
    AssignmentSubmissionCreate,
    AssignmentSubmissionRead,
)

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("", response_model=list[AssignmentRead])
async def list_assignments(session: AsyncSession = Depends(get_db_session)) -> list[AssignmentRead]:
    return await service.list_assignments(session)


@router.get("/{assignment_id}", response_model=AssignmentRead)
async def get_assignment(
    assignment_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> AssignmentRead:
    assignment = await service.get_assignment(session, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    return assignment


@router.post("", response_model=AssignmentRead, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    payload: AssignmentCreate,
    session: AsyncSession = Depends(get_db_session),
) -> AssignmentRead:
    return await service.create_assignment(session, payload)


@router.post("/{assignment_id}/submit", response_model=AssignmentSubmissionRead, status_code=status.HTTP_201_CREATED)
async def submit_assignment(
    assignment_id: UUID,
    payload: AssignmentSubmissionCreate,
    session: AsyncSession = Depends(get_db_session),
) -> AssignmentSubmissionRead:
    submission = await service.submit_assignment(session, assignment_id, payload)
    if submission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    return submission
