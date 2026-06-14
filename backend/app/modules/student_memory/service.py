from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.student_memory import repository
from app.modules.student_memory.models import (
    ConsistencyLevel,
    ContentType,
    DifficultyPreference,
    LearningStyle,
    MemoryEventType,
    MemoryImportance,
    MemoryPriority,
    PreferredLanguage,
    StudyTime,
    StudentMemoryProfile,
)
from app.modules.student_memory.schemas import (
    AttentionProfileRead,
    MemoryTimelineEventCreate,
    MemoryTimelineRead,
    StudentMemoryRead,
    StudentProfileRead,
)

DEFAULT_STUDENT_ID = UUID("11111111-1111-1111-1111-111111111111")


def build_seed_student_memory(student_id: UUID = DEFAULT_STUDENT_ID) -> dict[str, object]:
    now = datetime.now(UTC)

    return {
        "profile": {
            "student_id": student_id,
            "display_name": "Mariam Hassan",
            "grade": "Secondary 3",
            "preferred_language": PreferredLanguage.AR,
            "learning_style": LearningStyle.MIXED,
            "average_session_minutes": 28,
            "preferred_difficulty": DifficultyPreference.ADAPTIVE,
            "attention_span": 22,
        },
        "strengths": [
            {
                "concept_id": "galvanic-cell",
                "concept_name": "Galvanic Cell",
                "subject": "Chemistry",
                "mastery_level": 82,
                "confidence": 90,
                "evidence": ["82% current mastery", "Consistently answers cell component questions correctly."],
                "reinforcement_action": "Use Galvanic Cell as a confidence anchor before harder connected practice.",
            },
            {
                "concept_id": "stoichiometry",
                "concept_name": "Stoichiometry",
                "subject": "Chemistry",
                "mastery_level": 78,
                "confidence": 78,
                "evidence": ["78% current mastery", "Strong accuracy in mole ratio and mass conversion practice."],
                "reinforcement_action": "Use Stoichiometry in mixed practice to reinforce calculation confidence.",
            },
        ],
        "weaknesses": [
            {
                "concept_id": "oxidation-number",
                "concept_name": "Oxidation Number",
                "subject": "Chemistry",
                "mastery_level": 35,
                "priority": MemoryPriority.HIGH,
                "confidence": 88,
                "recommended_action": "Review lesson 3 and solve 10 focused practice questions.",
                "evidence": ["35% current mastery", "Repeated mistakes in redox equations."],
            },
            {
                "concept_id": "electrolysis",
                "concept_name": "Electrolysis",
                "subject": "Chemistry",
                "mastery_level": 48,
                "priority": MemoryPriority.MEDIUM,
                "confidence": 74,
                "recommended_action": "Watch the electrolysis recap and retake the short quiz.",
                "evidence": ["48% current mastery", "Needs a targeted recap before mixed practice."],
            },
        ],
        "learning_preferences": [
            {
                "learning_style": LearningStyle.MIXED,
                "preferred_language": PreferredLanguage.AR,
                "preferred_difficulty": DifficultyPreference.ADAPTIVE,
                "best_content_type": ContentType.MIXED,
            }
        ],
        "study_patterns": [
            {
                "average_session_minutes": 28,
                "preferred_study_time": StudyTime.EVENING,
                "weekly_study_days": 5,
                "consistency_level": ConsistencyLevel.MEDIUM,
            }
        ],
        "attention_profiles": [
            {
                "attention_span": 22,
                "best_session_length": 28,
                "break_frequency_minutes": 25,
                "needs_motivation": True,
            }
        ],
        "timeline_events": [
            {
                "timestamp": now - timedelta(hours=3),
                "event_type": MemoryEventType.LEARNING_PATH_UPDATED,
                "title": "Revision path updated",
                "description": "Focused path recorded for oxidation number and electrolysis revision.",
                "importance": MemoryImportance.HIGH,
            },
            {
                "timestamp": now - timedelta(days=1),
                "event_type": MemoryEventType.WEAKNESS_DETECTED,
                "title": "Weakness detected in oxidation numbers",
                "description": "Recent answers showed repeated mistakes in redox equations.",
                "importance": MemoryImportance.HIGH,
            },
            {
                "timestamp": now - timedelta(days=2),
                "event_type": MemoryEventType.QUIZ_COMPLETED,
                "title": "Electrochemistry quiz completed",
                "description": "The student completed a short quiz covering galvanic and electrolytic cells.",
                "importance": MemoryImportance.MEDIUM,
            },
        ],
        "forgetting_curve": [
            {
                "concept_id": "oxidation-number",
                "concept_name": "Oxidation Number",
                "last_reviewed_at": now - timedelta(days=1),
                "retention_score": 41,
                "risk_level": MemoryPriority.HIGH,
                "next_review_at": now + timedelta(days=1),
                "recommendation": "Review today with focused recall questions.",
            },
            {
                "concept_id": "galvanic-cell",
                "concept_name": "Galvanic Cell",
                "last_reviewed_at": now - timedelta(days=3),
                "retention_score": 76,
                "risk_level": MemoryPriority.LOW,
                "next_review_at": now + timedelta(days=4),
                "recommendation": "Schedule a short spaced review session.",
            },
        ],
        "recommendations": [
            {
                "title": "Repair Oxidation Number",
                "description": "Review lesson 3 and solve 10 focused practice questions.",
                "priority": MemoryPriority.HIGH,
                "action_type": "practice",
                "related_concept": "Oxidation Number",
            },
            {
                "title": "Use the best study window",
                "description": "Plan focused sessions near 28 minutes before adding a break.",
                "priority": MemoryPriority.MEDIUM,
                "action_type": "learningPath",
                "related_concept": "Study rhythm",
            },
        ],
        "summaries": [
            {
                "generated_at": now,
                "headline": "Mariam Hassan is building a stronger Secondary 3 learning profile.",
                "overview": "The strongest current anchor is Galvanic Cell. The main support area is Oxidation Number.",
                "next_best_action": "Review lesson 3 and solve 10 focused practice questions.",
                "confidence": 86,
                "strengths_count": 2,
                "weaknesses_count": 2,
            }
        ],
        "long_term_insights": [
            {
                "title": "Stable learner profile",
                "description": "Mariam Hassan has 2 strength signals and 2 active support signals in memory.",
                "signal_type": "strength",
                "confidence": 84,
                "importance": MemoryImportance.HIGH,
                "metadata_json": {},
            },
            {
                "title": "Forgetting risk monitor",
                "description": "1 concept requires urgent spaced review.",
                "signal_type": "forgetting",
                "confidence": 80,
                "importance": MemoryImportance.HIGH,
                "metadata_json": {},
            },
        ],
    }


def build_student_memory_response(profile: StudentMemoryProfile) -> StudentMemoryRead:
    attention_profile = profile.attention_profiles[0] if profile.attention_profiles else None
    latest_summary = sorted(profile.summaries, key=lambda summary: summary.generated_at, reverse=True)[0] if profile.summaries else None
    graph_nodes = [
        {
            "id": f"pkg-node-{item.concept_id}",
            "conceptId": item.concept_id,
            "conceptName": item.concept_name,
            "subject": item.subject,
            "mastery": item.mastery_level,
            "confidence": item.confidence,
            "weaknessScore": max(0, 100 - item.mastery_level),
            "importance": min(100, item.confidence + max(0, 100 - item.mastery_level) // 3),
            "connectedConceptsCount": 1,
            "relationSummary": item.reinforcement_action,
        }
        for item in profile.strengths
    ] + [
        {
            "id": f"pkg-node-{item.concept_id}",
            "conceptId": item.concept_id,
            "conceptName": item.concept_name,
            "subject": item.subject,
            "mastery": item.mastery_level,
            "confidence": item.confidence,
            "weaknessScore": max(0, 100 - item.mastery_level),
            "importance": min(100, item.confidence + max(0, 100 - item.mastery_level) // 2),
            "connectedConceptsCount": 1,
            "relationSummary": item.recommended_action,
        }
        for item in profile.weaknesses
    ]
    graph_edges = [
        {
            "id": "pkg-edge-persisted-anchor",
            "sourceConceptId": profile.strengths[0].concept_id,
            "targetConceptId": profile.weaknesses[0].concept_id,
            "relationType": "supports",
            "strength": 76,
            "summary": f"{profile.strengths[0].concept_name} can anchor practice for {profile.weaknesses[0].concept_name}.",
        }
    ] if profile.strengths and profile.weaknesses else []
    long_term_memory = [
        {
            "id": f"ltm-item-{insight.id}",
            "title": insight.title,
            "type": insight.signal_type,
            "importance": insight.importance.value,
            "relatedConcept": profile.weaknesses[0].concept_name if profile.weaknesses else "General memory",
            "insightSummary": insight.description,
            "createdAt": datetime.now(UTC).isoformat(),
        }
        for insight in profile.long_term_insights
    ]
    primary_weakness = profile.weaknesses[0] if profile.weaknesses else None
    primary_strength = profile.strengths[0] if profile.strengths else None

    return StudentMemoryRead(
        student_profile=StudentProfileRead.model_validate(profile),
        strengths=profile.strengths,
        weaknesses=profile.weaknesses,
        learning_preferences=profile.learning_preferences,
        study_patterns=profile.study_patterns,
        attention_profile=AttentionProfileRead.model_validate(attention_profile) if attention_profile else None,
        memory_timeline=MemoryTimelineRead(
            id=f"timeline-{profile.id}",
            student_id=profile.student_id,
            events=sorted(profile.timeline_events, key=lambda event: event.timestamp, reverse=True),
        ),
        detected_weaknesses=profile.weaknesses,
        detected_strengths=profile.strengths,
        learning_pattern_insights=[
            {
                "id": "pattern-consistency",
                "patternType": "consistency",
                "title": "Study consistency",
                "description": "Persistent study rhythm is available from stored memory.",
                "confidence": 84,
                "recommendation": "Keep revision sessions predictable and tied to short practice tasks.",
            }
        ],
        forgetting_curve=profile.forgetting_curve,
        personalized_recommendations=profile.recommendations,
        student_summary=latest_summary,
        long_term_memory_insights=profile.long_term_insights,
        personal_knowledge_graph={
            "id": f"personal-knowledge-graph-{profile.id}",
            "studentId": profile.student_id,
            "generatedAt": datetime.now(UTC).isoformat(),
            "nodes": graph_nodes,
            "edges": graph_edges,
        },
        long_term_memory=long_term_memory,
        memory_insights=[
            {
                "id": "memory-insight-persisted-profile",
                "title": "Persisted memory profile",
                "summary": f"{len(profile.long_term_insights)} long-term insights are stored.",
                "importance": "medium",
                "relatedConcept": primary_weakness.concept_name if primary_weakness else "General memory",
                "confidence": 82,
            }
        ],
        memory_trends=[
            {
                "id": "memory-trend-persisted-risk",
                "title": "Weakness pressure",
                "direction": "declining" if primary_weakness else "stable",
                "conceptName": primary_weakness.concept_name if primary_weakness else "General memory",
                "summary": primary_weakness.recommended_action if primary_weakness else "No active weakness trend.",
                "confidence": primary_weakness.confidence if primary_weakness else 70,
            }
        ],
        student_persona={
            "id": f"student-persona-{profile.id}",
            "studentId": profile.student_id,
            "personaName": "Guided Concept Builder" if primary_weakness else "Independent Momentum Learner",
            "learningStyle": profile.learning_style.value,
            "strengthTraits": [
                {
                    "id": "persona-trait-strength",
                    "name": "Concept anchor",
                    "category": "strength",
                    "confidence": primary_strength.confidence,
                    "summary": primary_strength.reinforcement_action,
                }
            ] if primary_strength else [],
            "riskTraits": [
                {
                    "id": "persona-trait-risk",
                    "name": "Repair loop needed",
                    "category": "risk",
                    "confidence": primary_weakness.confidence,
                    "summary": primary_weakness.recommended_action,
                }
            ] if primary_weakness else [],
            "learningBehaviors": [],
            "behaviorSummary": "Use short guided repair loops and connect new work to known strengths.",
            "recommendedTeachingApproach": "Start with a known strength, repair one weak concept, then check understanding.",
        },
        personal_tutor_context={
            "id": f"personal-tutor-context-{profile.id}",
            "studentId": profile.student_id,
            "generatedAt": datetime.now(UTC).isoformat(),
            "studentSummary": latest_summary.overview if latest_summary else "Persistent student memory is available.",
            "keyWeaknesses": [weakness.concept_name for weakness in profile.weaknesses[:3]],
            "keyStrengths": [strength.concept_name for strength in profile.strengths[:3]],
            "preferredLearningStyle": profile.learning_style.value,
            "nextRecommendedAction": latest_summary.next_best_action if latest_summary else "Continue collecting learning signals.",
            "tutorInstructions": "Use concise guidance, connect to strengths, and check understanding before adding difficulty.",
            "sections": [],
            "recommendations": [],
        },
    )


async def get_student_memory(session: AsyncSession, student_id: UUID) -> StudentMemoryRead | None:
    profile = await repository.get_profile_by_student_id(session, student_id)
    if profile is None:
        return None

    return build_student_memory_response(profile)


async def add_memory_event(
    session: AsyncSession,
    student_id: UUID,
    payload: MemoryTimelineEventCreate,
) -> StudentMemoryRead | None:
    profile = await repository.get_profile_by_student_id(session, student_id)
    if profile is None:
        return None

    await repository.add_timeline_event(session, profile, payload)
    updated_profile = await repository.get_profile_by_student_id(session, student_id)
    if updated_profile is None:
        return None

    return build_student_memory_response(updated_profile)


async def ensure_seed_student_memory(session: AsyncSession, student_id: UUID = DEFAULT_STUDENT_ID) -> StudentMemoryRead:
    existing = await repository.get_profile_by_student_id(session, student_id)
    if existing is not None:
        return build_student_memory_response(existing)

    profile = repository.build_profile_with_children(build_seed_student_memory(student_id))
    seeded = await repository.create_seed_profile(session, profile)
    return build_student_memory_response(seeded)
