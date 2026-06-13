from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.student_memory.models import (
    StudentMemoryAttentionProfile,
    StudentMemoryForgettingCurve,
    StudentMemoryLearningPreference,
    StudentMemoryLongTermInsight,
    StudentMemoryProfile,
    StudentMemoryRecommendation,
    StudentMemoryStrength,
    StudentMemoryStudyPattern,
    StudentMemorySummary,
    StudentMemoryTimelineEvent,
    StudentMemoryWeakness,
)
from app.modules.student_memory.schemas import MemoryTimelineEventCreate


profile_load_options = (
    selectinload(StudentMemoryProfile.strengths),
    selectinload(StudentMemoryProfile.weaknesses),
    selectinload(StudentMemoryProfile.learning_preferences),
    selectinload(StudentMemoryProfile.study_patterns),
    selectinload(StudentMemoryProfile.attention_profiles),
    selectinload(StudentMemoryProfile.timeline_events),
    selectinload(StudentMemoryProfile.forgetting_curve),
    selectinload(StudentMemoryProfile.recommendations),
    selectinload(StudentMemoryProfile.summaries),
    selectinload(StudentMemoryProfile.long_term_insights),
)


async def get_profile_by_student_id(session: AsyncSession, student_id: UUID) -> StudentMemoryProfile | None:
    result = await session.execute(
        select(StudentMemoryProfile)
        .where(StudentMemoryProfile.student_id == student_id)
        .options(*profile_load_options)
    )
    return result.scalar_one_or_none()


async def add_timeline_event(
    session: AsyncSession,
    profile: StudentMemoryProfile,
    payload: MemoryTimelineEventCreate,
) -> StudentMemoryTimelineEvent:
    event = StudentMemoryTimelineEvent(
        profile_id=profile.id,
        timestamp=payload.timestamp,
        event_type=payload.event_type,
        title=payload.title,
        description=payload.description,
        importance=payload.importance,
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


async def create_seed_profile(session: AsyncSession, profile: StudentMemoryProfile) -> StudentMemoryProfile:
    session.add(profile)
    await session.commit()
    seeded = await get_profile_by_student_id(session, profile.student_id)
    if seeded is None:
        raise RuntimeError("Student memory seed profile was not persisted.")
    return seeded


def build_profile_with_children(data: dict[str, object]) -> StudentMemoryProfile:
    profile = StudentMemoryProfile(**data["profile"])  # type: ignore[arg-type]
    profile.strengths = [StudentMemoryStrength(**item) for item in data["strengths"]]  # type: ignore[arg-type]
    profile.weaknesses = [StudentMemoryWeakness(**item) for item in data["weaknesses"]]  # type: ignore[arg-type]
    profile.learning_preferences = [StudentMemoryLearningPreference(**item) for item in data["learning_preferences"]]  # type: ignore[arg-type]
    profile.study_patterns = [StudentMemoryStudyPattern(**item) for item in data["study_patterns"]]  # type: ignore[arg-type]
    profile.attention_profiles = [StudentMemoryAttentionProfile(**item) for item in data["attention_profiles"]]  # type: ignore[arg-type]
    profile.timeline_events = [StudentMemoryTimelineEvent(**item) for item in data["timeline_events"]]  # type: ignore[arg-type]
    profile.forgetting_curve = [StudentMemoryForgettingCurve(**item) for item in data["forgetting_curve"]]  # type: ignore[arg-type]
    profile.recommendations = [StudentMemoryRecommendation(**item) for item in data["recommendations"]]  # type: ignore[arg-type]
    profile.summaries = [StudentMemorySummary(**item) for item in data["summaries"]]  # type: ignore[arg-type]
    profile.long_term_insights = [StudentMemoryLongTermInsight(**item) for item in data["long_term_insights"]]  # type: ignore[arg-type]
    return profile
