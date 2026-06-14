from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

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
)


class StudentMemoryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class StudentStrengthRead(StudentMemoryBase):
    id: UUID
    concept_id: str = Field(serialization_alias="conceptId")
    concept_name: str = Field(serialization_alias="conceptName")
    subject: str
    mastery_level: int = Field(serialization_alias="masteryLevel")
    confidence: int
    evidence: list[str]
    reinforcement_action: str = Field(serialization_alias="reinforcementAction")


class StudentWeaknessRead(StudentMemoryBase):
    id: UUID
    concept_id: str = Field(serialization_alias="conceptId")
    concept_name: str = Field(serialization_alias="conceptName")
    subject: str
    mastery_level: int = Field(serialization_alias="masteryLevel")
    priority: MemoryPriority
    confidence: int
    recommended_action: str = Field(serialization_alias="recommendedAction")
    evidence: list[str]


class LearningPreferenceRead(StudentMemoryBase):
    id: UUID
    learning_style: LearningStyle = Field(serialization_alias="learningStyle")
    preferred_language: PreferredLanguage = Field(serialization_alias="preferredLanguage")
    preferred_difficulty: DifficultyPreference = Field(serialization_alias="preferredDifficulty")
    best_content_type: ContentType = Field(serialization_alias="bestContentType")


class StudyPatternRead(StudentMemoryBase):
    id: UUID
    average_session_minutes: int = Field(serialization_alias="averageSessionMinutes")
    preferred_study_time: StudyTime = Field(serialization_alias="preferredStudyTime")
    weekly_study_days: int = Field(serialization_alias="weeklyStudyDays")
    consistency_level: ConsistencyLevel = Field(serialization_alias="consistencyLevel")


class AttentionProfileRead(StudentMemoryBase):
    attention_span: int = Field(serialization_alias="attentionSpan")
    best_session_length: int = Field(serialization_alias="bestSessionLength")
    break_frequency_minutes: int = Field(serialization_alias="breakFrequencyMinutes")
    needs_motivation: bool = Field(serialization_alias="needsMotivation")


class MemoryTimelineEventCreate(BaseModel):
    timestamp: datetime
    event_type: MemoryEventType = Field(alias="eventType")
    title: str
    description: str
    importance: MemoryImportance


class MemoryTimelineEventRead(StudentMemoryBase):
    id: UUID
    timestamp: datetime
    event_type: MemoryEventType = Field(serialization_alias="eventType")
    title: str
    description: str
    importance: MemoryImportance


class MemoryTimelineRead(BaseModel):
    id: str
    student_id: UUID = Field(serialization_alias="studentId")
    events: list[MemoryTimelineEventRead]


class ForgettingCurveItemRead(StudentMemoryBase):
    id: UUID
    concept_id: str = Field(serialization_alias="conceptId")
    concept_name: str = Field(serialization_alias="conceptName")
    last_reviewed_at: datetime = Field(serialization_alias="lastReviewedAt")
    retention_score: int = Field(serialization_alias="retentionScore")
    risk_level: MemoryPriority = Field(serialization_alias="riskLevel")
    next_review_at: datetime = Field(serialization_alias="nextReviewAt")
    recommendation: str


class RecommendationRead(StudentMemoryBase):
    id: UUID
    title: str
    description: str
    priority: MemoryPriority
    action_type: str = Field(serialization_alias="actionType")
    related_concept: str = Field(serialization_alias="relatedConcept")


class StudentSummaryRead(StudentMemoryBase):
    id: UUID
    generated_at: datetime = Field(serialization_alias="generatedAt")
    headline: str
    overview: str
    next_best_action: str = Field(serialization_alias="nextBestAction")
    confidence: int
    strengths_count: int = Field(serialization_alias="strengthsCount")
    weaknesses_count: int = Field(serialization_alias="weaknessesCount")


class LongTermMemoryInsightRead(StudentMemoryBase):
    id: UUID
    title: str
    description: str
    signal_type: str = Field(serialization_alias="signalType")
    confidence: int
    importance: MemoryImportance


class StudentProfileRead(StudentMemoryBase):
    id: UUID
    student_id: UUID = Field(serialization_alias="studentId")
    display_name: str = Field(serialization_alias="displayName")
    grade: str
    preferred_language: PreferredLanguage = Field(serialization_alias="preferredLanguage")
    learning_style: LearningStyle = Field(serialization_alias="learningStyle")
    average_session_minutes: int = Field(serialization_alias="averageSessionMinutes")
    preferred_difficulty: DifficultyPreference = Field(serialization_alias="preferredDifficulty")
    attention_span: int = Field(serialization_alias="attentionSpan")
    strengths: list[StudentStrengthRead]
    weaknesses: list[StudentWeaknessRead]


class StudentMemoryRead(BaseModel):
    student_profile: StudentProfileRead = Field(serialization_alias="studentProfile")
    strengths: list[StudentStrengthRead]
    weaknesses: list[StudentWeaknessRead]
    learning_preferences: list[LearningPreferenceRead] = Field(serialization_alias="learningPreferences")
    study_patterns: list[StudyPatternRead] = Field(serialization_alias="studyPatterns")
    attention_profile: AttentionProfileRead | None = Field(serialization_alias="attentionProfile")
    memory_timeline: MemoryTimelineRead = Field(serialization_alias="memoryTimeline")
    detected_weaknesses: list[StudentWeaknessRead] = Field(serialization_alias="detectedWeaknesses")
    detected_strengths: list[StudentStrengthRead] = Field(serialization_alias="detectedStrengths")
    learning_pattern_insights: list[dict[str, object]] = Field(serialization_alias="learningPatternInsights")
    forgetting_curve: list[ForgettingCurveItemRead] = Field(serialization_alias="forgettingCurve")
    personalized_recommendations: list[RecommendationRead] = Field(serialization_alias="personalizedRecommendations")
    student_summary: StudentSummaryRead | None = Field(serialization_alias="studentSummary")
    long_term_memory_insights: list[LongTermMemoryInsightRead] = Field(serialization_alias="longTermMemoryInsights")
    personal_knowledge_graph: dict[str, object] = Field(serialization_alias="personalKnowledgeGraph")
    long_term_memory: list[dict[str, object]] = Field(serialization_alias="longTermMemory")
    memory_insights: list[dict[str, object]] = Field(serialization_alias="memoryInsights")
    memory_trends: list[dict[str, object]] = Field(serialization_alias="memoryTrends")
    student_persona: dict[str, object] = Field(serialization_alias="studentPersona")
    personal_tutor_context: dict[str, object] = Field(serialization_alias="personalTutorContext")
