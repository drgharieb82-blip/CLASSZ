import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MemoryImportance(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class MemoryPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class MemoryEventType(str, enum.Enum):
    LESSON_COMPLETED = "LessonCompleted"
    QUIZ_COMPLETED = "QuizCompleted"
    WEAKNESS_DETECTED = "WeaknessDetected"
    MASTERY_IMPROVED = "MasteryImproved"
    REVISION_COMPLETED = "RevisionCompleted"
    LEARNING_PATH_UPDATED = "LearningPathUpdated"


class LearningStyle(str, enum.Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    READING = "reading"
    PRACTICE = "practice"
    MIXED = "mixed"


class DifficultyPreference(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    ADAPTIVE = "adaptive"


class PreferredLanguage(str, enum.Enum):
    AR = "ar"
    EN = "en"


class ContentType(str, enum.Enum):
    VIDEO = "video"
    NOTES = "notes"
    QUESTIONS = "questions"
    MIXED = "mixed"


class StudyTime(str, enum.Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"


class ConsistencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class StudentMemoryProfile(Base):
    __tablename__ = "student_memory_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    display_name: Mapped[str] = mapped_column(String(160), nullable=False)
    grade: Mapped[str] = mapped_column(String(80), nullable=False)
    preferred_language: Mapped[PreferredLanguage] = mapped_column(
        Enum(PreferredLanguage, name="student_memory_preferred_language_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
    )
    learning_style: Mapped[LearningStyle] = mapped_column(
        Enum(LearningStyle, name="student_memory_learning_style_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
    )
    average_session_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_difficulty: Mapped[DifficultyPreference] = mapped_column(
        Enum(
            DifficultyPreference,
            name="student_memory_difficulty_preference_enum",
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
    )
    attention_span: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    strengths: Mapped[list["StudentMemoryStrength"]] = relationship("StudentMemoryStrength", cascade="all, delete-orphan")
    weaknesses: Mapped[list["StudentMemoryWeakness"]] = relationship("StudentMemoryWeakness", cascade="all, delete-orphan")
    learning_preferences: Mapped[list["StudentMemoryLearningPreference"]] = relationship(
        "StudentMemoryLearningPreference",
        cascade="all, delete-orphan",
    )
    study_patterns: Mapped[list["StudentMemoryStudyPattern"]] = relationship("StudentMemoryStudyPattern", cascade="all, delete-orphan")
    attention_profiles: Mapped[list["StudentMemoryAttentionProfile"]] = relationship(
        "StudentMemoryAttentionProfile",
        cascade="all, delete-orphan",
    )
    timeline_events: Mapped[list["StudentMemoryTimelineEvent"]] = relationship(
        "StudentMemoryTimelineEvent",
        cascade="all, delete-orphan",
        order_by="desc(StudentMemoryTimelineEvent.timestamp)",
    )
    forgetting_curve: Mapped[list["StudentMemoryForgettingCurve"]] = relationship(
        "StudentMemoryForgettingCurve",
        cascade="all, delete-orphan",
    )
    recommendations: Mapped[list["StudentMemoryRecommendation"]] = relationship(
        "StudentMemoryRecommendation",
        cascade="all, delete-orphan",
    )
    summaries: Mapped[list["StudentMemorySummary"]] = relationship("StudentMemorySummary", cascade="all, delete-orphan")
    long_term_insights: Mapped[list["StudentMemoryLongTermInsight"]] = relationship(
        "StudentMemoryLongTermInsight",
        cascade="all, delete-orphan",
    )


class StudentMemoryStrength(Base):
    __tablename__ = "student_memory_strengths"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    concept_id: Mapped[str] = mapped_column(String(120), nullable=False)
    concept_name: Mapped[str] = mapped_column(String(180), nullable=False)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    mastery_level: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)
    evidence: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    reinforcement_action: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class StudentMemoryWeakness(Base):
    __tablename__ = "student_memory_weaknesses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    concept_id: Mapped[str] = mapped_column(String(120), nullable=False)
    concept_name: Mapped[str] = mapped_column(String(180), nullable=False)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    mastery_level: Mapped[int] = mapped_column(Integer, nullable=False)
    priority: Mapped[MemoryPriority] = mapped_column(
        Enum(MemoryPriority, name="student_memory_priority_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
        index=True,
    )
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class StudentMemoryLearningPreference(Base):
    __tablename__ = "student_memory_learning_preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    learning_style: Mapped[LearningStyle] = mapped_column(
        Enum(LearningStyle, name="student_memory_learning_style_enum", create_type=False),
        nullable=False,
    )
    preferred_language: Mapped[PreferredLanguage] = mapped_column(
        Enum(PreferredLanguage, name="student_memory_preferred_language_enum", create_type=False),
        nullable=False,
    )
    preferred_difficulty: Mapped[DifficultyPreference] = mapped_column(
        Enum(DifficultyPreference, name="student_memory_difficulty_preference_enum", create_type=False),
        nullable=False,
    )
    best_content_type: Mapped[ContentType] = mapped_column(
        Enum(ContentType, name="student_memory_content_type_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
    )


class StudentMemoryStudyPattern(Base):
    __tablename__ = "student_memory_study_patterns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    average_session_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_study_time: Mapped[StudyTime] = mapped_column(
        Enum(StudyTime, name="student_memory_study_time_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
    )
    weekly_study_days: Mapped[int] = mapped_column(Integer, nullable=False)
    consistency_level: Mapped[ConsistencyLevel] = mapped_column(
        Enum(ConsistencyLevel, name="student_memory_consistency_level_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
    )


class StudentMemoryAttentionProfile(Base):
    __tablename__ = "student_memory_attention_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    attention_span: Mapped[int] = mapped_column(Integer, nullable=False)
    best_session_length: Mapped[int] = mapped_column(Integer, nullable=False)
    break_frequency_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    needs_motivation: Mapped[bool] = mapped_column(Boolean, nullable=False)


class StudentMemoryTimelineEvent(Base):
    __tablename__ = "student_memory_timeline_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    event_type: Mapped[MemoryEventType] = mapped_column(
        Enum(MemoryEventType, name="student_memory_event_type_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    importance: Mapped[MemoryImportance] = mapped_column(
        Enum(MemoryImportance, name="student_memory_importance_enum", values_callable=lambda values: [value.value for value in values]),
        nullable=False,
    )


class MemoryEvent(Base):
    __tablename__ = "memory_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type: Mapped[MemoryEventType] = mapped_column(
        Enum(MemoryEventType, name="student_memory_event_type_enum", create_type=False),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    importance: Mapped[MemoryImportance] = mapped_column(Enum(MemoryImportance, name="student_memory_importance_enum", create_type=False), nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class StudentMemoryForgettingCurve(Base):
    __tablename__ = "student_memory_forgetting_curve"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    concept_id: Mapped[str] = mapped_column(String(120), nullable=False)
    concept_name: Mapped[str] = mapped_column(String(180), nullable=False)
    last_reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    retention_score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_level: Mapped[MemoryPriority] = mapped_column(Enum(MemoryPriority, name="student_memory_priority_enum", create_type=False), nullable=False)
    next_review_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)


class StudentMemoryRecommendation(Base):
    __tablename__ = "student_memory_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[MemoryPriority] = mapped_column(Enum(MemoryPriority, name="student_memory_priority_enum", create_type=False), nullable=False)
    action_type: Mapped[str] = mapped_column(String(80), nullable=False)
    related_concept: Mapped[str] = mapped_column(String(180), nullable=False)


class StudentMemorySummary(Base):
    __tablename__ = "student_memory_summaries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    headline: Mapped[str] = mapped_column(String(255), nullable=False)
    overview: Mapped[str] = mapped_column(Text, nullable=False)
    next_best_action: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)
    strengths_count: Mapped[int] = mapped_column(Integer, nullable=False)
    weaknesses_count: Mapped[int] = mapped_column(Integer, nullable=False)


class StudentMemoryLongTermInsight(Base):
    __tablename__ = "student_memory_long_term_insights"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_memory_profiles.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    signal_type: Mapped[str] = mapped_column(String(80), nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)
    importance: Mapped[MemoryImportance] = mapped_column(Enum(MemoryImportance, name="student_memory_importance_enum", create_type=False), nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
