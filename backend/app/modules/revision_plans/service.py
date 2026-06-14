from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.revision_plans import repository
from app.modules.revision_plans.models import RevisionPlan
from app.modules.revision_plans.schemas import RevisionPlanCreate, RevisionPlanUpdate


async def list_revision_plans(session: AsyncSession, student_id: UUID | None = None) -> list[RevisionPlan]:
    return await repository.list_revision_plans(session, student_id)


async def get_revision_plan(session: AsyncSession, plan_id: UUID) -> RevisionPlan | None:
    return await repository.get_revision_plan(session, plan_id)


async def create_revision_plan(session: AsyncSession, payload: RevisionPlanCreate) -> RevisionPlan:
    return await repository.create_revision_plan(session, payload)


async def update_revision_plan(session: AsyncSession, plan_id: UUID, payload: RevisionPlanUpdate) -> RevisionPlan | None:
    plan = await repository.get_revision_plan(session, plan_id)
    if plan is None:
        return None

    return await repository.update_revision_plan(session, plan, payload)
