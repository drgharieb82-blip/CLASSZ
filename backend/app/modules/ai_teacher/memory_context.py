from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.student_memory import service as student_memory_service
from app.modules.student_memory.schemas import StudentMemoryRead


def build_memory_context(memory: StudentMemoryRead | None) -> str:
    if memory is None:
        return "No persistent student memory is available. Use a general explanation."

    profile = memory.student_profile
    strengths = ", ".join(strength.concept_name for strength in memory.strengths[:2]) or "none"
    weaknesses = ", ".join(weakness.concept_name for weakness in memory.weaknesses[:2]) or "none"
    preference = memory.learning_preferences[0] if memory.learning_preferences else None
    pattern = memory.study_patterns[0] if memory.study_patterns else None
    attention = memory.attention_profile
    risks = ", ".join(risk.concept_name for risk in memory.forgetting_curve[:2]) or "none"
    recommendations = "; ".join(recommendation.title for recommendation in memory.personalized_recommendations[:2]) or "none"
    insights = "; ".join(insight.title for insight in memory.long_term_memory_insights[:2]) or "none"

    return (
        f"Grade: {profile.grade}. "
        f"Language: {profile.preferred_language.value}. "
        f"Learning style: {profile.learning_style.value}. "
        f"Strengths: {strengths}. "
        f"Weaknesses: {weaknesses}. "
        f"Preference: {preference.best_content_type.value if preference else 'unknown'} content. "
        f"Study pattern: {pattern.average_session_minutes if pattern else 'unknown'} minute sessions. "
        f"Attention: {attention.best_session_length if attention else 'unknown'} minute best session. "
        f"Forgetting risks: {risks}. "
        f"Recommendations: {recommendations}. "
        f"Long-term insights: {insights}."
    )


async def get_memory_context(session: AsyncSession | None, student_id: UUID | None) -> str:
    if session is None or student_id is None:
        return build_memory_context(None)

    memory = await student_memory_service.get_student_memory(session, student_id)
    return build_memory_context(memory)
