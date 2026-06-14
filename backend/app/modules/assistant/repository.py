from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.assistant.models import ExplainableInsight
from app.modules.assistant.schemas import ExplainableInsightCreate


async def list_insights(session: AsyncSession, student_id: UUID) -> list[ExplainableInsight]:
    result = await session.execute(
        select(ExplainableInsight)
        .where(ExplainableInsight.student_id == student_id)
        .order_by(ExplainableInsight.created_at.desc())
    )
    return list(result.scalars().all())


async def create_insight(session: AsyncSession, payload: ExplainableInsightCreate) -> ExplainableInsight:
    insight = ExplainableInsight(**payload.model_dump())
    session.add(insight)
    await session.commit()
    await session.refresh(insight)
    return insight
