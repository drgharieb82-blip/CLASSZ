from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.assistant import repository
from app.modules.assistant.models import InsightType
from app.modules.assistant.schemas import AssistantContextRead, ExplainableInsightCreate, ExplainableInsightRead


async def create_insight(session: AsyncSession, payload: ExplainableInsightCreate):
    return await repository.create_insight(session, payload)


async def build_assistant_context(session: AsyncSession, student_id: UUID) -> AssistantContextRead:
    insights = await repository.list_insights(session, student_id)
    if not insights:
        seeded = await repository.create_insight(
            session,
            ExplainableInsightCreate(
                student_id=student_id,
                insight_type=InsightType.RECOMMENDATION,
                title="Start with current memory priorities",
                summary="Use the student's strongest concept as an anchor before targeted repair practice.",
                explanation="No persisted assistant insights were found, so the assistant returned a deterministic starter context.",
                evidence=[],
                confidence=70,
            ),
        )
        insights = [seeded]

    primary = insights[0]
    return AssistantContextRead(
        student_id=student_id,
        summary=primary.summary,
        next_action=primary.title,
        tutor_instructions="Give concise guidance, ask one check question, and adapt difficulty from the student's stored memory state.",
        insights=[ExplainableInsightRead.model_validate(insight) for insight in insights],
    )
