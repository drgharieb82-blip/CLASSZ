from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.revision_plans import service
from app.modules.revision_plans.schemas import RevisionPlanCreate, RevisionPlanRead, RevisionPlanUpdate

router = APIRouter(prefix="/revision-plans", tags=["revision-plans"])


@router.get("", response_model=list[RevisionPlanRead])
async def list_revision_plans(
    student_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
) -> list[RevisionPlanRead]:
    return await service.list_revision_plans(session, student_id)


@router.get("/{plan_id}", response_model=RevisionPlanRead)
async def get_revision_plan(plan_id: UUID, session: AsyncSession = Depends(get_db_session)) -> RevisionPlanRead:
    plan = await service.get_revision_plan(session, plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision plan not found")

    return plan


@router.post("", response_model=RevisionPlanRead, status_code=status.HTTP_201_CREATED)
async def create_revision_plan(payload: RevisionPlanCreate, session: AsyncSession = Depends(get_db_session)) -> RevisionPlanRead:
    return await service.create_revision_plan(session, payload)


@router.patch("/{plan_id}", response_model=RevisionPlanRead)
async def update_revision_plan(
    plan_id: UUID,
    payload: RevisionPlanUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> RevisionPlanRead:
    plan = await service.update_revision_plan(session, plan_id, payload)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision plan not found")

    return plan
