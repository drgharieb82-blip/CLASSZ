from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.revision_plans.models import RevisionPlan
from app.modules.revision_plans.schemas import RevisionPlanCreate, RevisionPlanUpdate


async def list_revision_plans(session: AsyncSession, student_id: UUID | None = None) -> list[RevisionPlan]:
    statement = select(RevisionPlan)
    if student_id is not None:
        statement = statement.where(RevisionPlan.student_id == student_id)

    result = await session.execute(statement.order_by(RevisionPlan.created_at.desc()))
    return list(result.scalars().all())


async def get_revision_plan(session: AsyncSession, plan_id: UUID) -> RevisionPlan | None:
    result = await session.execute(select(RevisionPlan).where(RevisionPlan.id == plan_id))
    return result.scalar_one_or_none()


async def create_revision_plan(session: AsyncSession, payload: RevisionPlanCreate) -> RevisionPlan:
    plan = RevisionPlan(**payload.model_dump())
    session.add(plan)
    await session.commit()
    await session.refresh(plan)
    return plan


async def update_revision_plan(session: AsyncSession, plan: RevisionPlan, payload: RevisionPlanUpdate) -> RevisionPlan:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(plan, key, value)

    await session.commit()
    await session.refresh(plan)
    return plan
