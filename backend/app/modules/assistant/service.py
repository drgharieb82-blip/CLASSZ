from uuid import UUID
from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.assistant import repository
from app.modules.assistant.models import InsightType
from app.modules.assistant.schemas import (
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantContextRead,
    AssistantQuestionExplanationRead,
    AssistantRevisionRead,
    AssistantWeaknessRead,
    ChatMessageRead,
    ExplainableInsightCreate,
    ExplainableInsightRead,
)
from app.modules.student_memory import service as student_memory_service


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


def _assistant_reply(message: str) -> str:
    normalized = message.lower()
    if "practice" in normalized or "question" in normalized:
        return "Try three focused checks: assign Mn in KMnO4, identify oxidation in Zn + Cu2+ -> Zn2+ + Cu, then explain electron flow in a galvanic cell."
    if "wrong" in normalized or "answer" in normalized:
        return "Check whether the answer tracks the atom oxidation number instead of the total compound charge. The changed atom tells you oxidation or reduction."
    if "oxidation" in normalized:
        return "Oxidation number is the apparent charge assigned to an atom. It helps detect which element lost or gained electrons in a redox reaction."

    return "Start with the concept rule, solve one small example, then ask the student to explain the reason behind each step."


async def chat(payload: AssistantChatRequest) -> AssistantChatResponse:
    created_at = datetime.now(UTC).isoformat()
    user_message = ChatMessageRead(
        id=f"student-{uuid4()}",
        conversation_id=payload.conversation_id,
        role="student",
        content=payload.message,
        created_at=created_at,
    )
    assistant_message = ChatMessageRead(
        id=f"assistant-{uuid4()}",
        conversation_id=payload.conversation_id,
        role="assistant",
        content=_assistant_reply(payload.message),
        created_at=datetime.now(UTC).isoformat(),
    )
    return AssistantChatResponse(user_message=user_message, assistant_message=assistant_message)


async def get_weaknesses(session: AsyncSession, student_id: UUID) -> list[AssistantWeaknessRead]:
    memory = await student_memory_service.get_student_memory_or_fallback(session, student_id)
    weaknesses: list[AssistantWeaknessRead] = []
    for weakness in memory.weaknesses:
        severity = weakness.priority.value if hasattr(weakness.priority, "value") else str(weakness.priority)
        weaknesses.append(
            AssistantWeaknessRead(
                id=str(weakness.id),
                student_id=str(student_id),
                concept_id=weakness.concept_id,
                concept_name=weakness.concept_name,
                concept=weakness.concept_name,
                score=weakness.mastery_level,
                severity=severity,
                confidence_level="high" if weakness.confidence >= 80 else "medium",
                priority=severity,
                progress=weakness.mastery_level,
                recommendation=weakness.recommended_action,
            )
        )

    return weaknesses


async def get_revision(session: AsyncSession, student_id: UUID) -> list[AssistantRevisionRead]:
    memory = await student_memory_service.get_student_memory_or_fallback(session, student_id)
    suggestions: list[AssistantRevisionRead] = []
    for recommendation in memory.personalized_recommendations:
        priority = recommendation.priority.value if hasattr(recommendation.priority, "value") else str(recommendation.priority)
        suggestions.append(
            AssistantRevisionRead(
                id=str(recommendation.id),
                concept_id=recommendation.related_concept.lower().replace(" ", "-"),
                title=recommendation.title,
                concept=recommendation.related_concept,
                description=recommendation.description,
                priority=priority,
                estimated_time="20 min" if priority == "high" else "12 min",
                action_type="solve_questions" if recommendation.action_type == "practice" else "review_notes",
            )
        )

    return suggestions


async def explain_question(question_id: UUID) -> AssistantQuestionExplanationRead:
    return AssistantQuestionExplanationRead(
        id=f"explanation-{question_id}",
        question_id=str(question_id),
        concept_id="oxidation-number",
        question_title="Which element is reduced in the redox reaction?",
        selected_answer="The selected answer tracks the wrong oxidation change.",
        correct_answer="The reduced element is the one whose oxidation number decreases.",
        wrong_explanation="The selected answer is wrong when it follows total charge instead of the atom-level oxidation number.",
        correct_explanation="Compare oxidation numbers before and after the reaction. A decrease means reduction.",
        related_concept="Oxidation Number",
        difficulty="medium",
        summary="Use oxidation-number changes to identify which element gained electrons.",
        steps=[
            "Assign oxidation numbers before the reaction.",
            "Assign oxidation numbers after the reaction.",
            "Compare the atom that increased or decreased.",
            "Choose the decreased oxidation number for reduction.",
        ],
    )
