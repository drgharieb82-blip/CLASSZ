import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Table, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    TRUE_FALSE = "TRUE_FALSE"
    MULTIPLE_SELECT = "MULTIPLE_SELECT"
    SHORT_ANSWER = "SHORT_ANSWER"
    FILL_BLANK = "FILL_BLANK"
    MATCHING = "MATCHING"
    ORDERING = "ORDERING"
    ESSAY = "ESSAY"


class Difficulty(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class MediaType(str, enum.Enum):
    IMAGE = "IMAGE"
    DIAGRAM = "DIAGRAM"
    EQUATION_IMAGE = "EQUATION_IMAGE"
    ATTACHMENT = "ATTACHMENT"
    PDF = "PDF"
    AUDIO = "AUDIO"
    VIDEO = "VIDEO"


class QuestionMediaPurpose(str, enum.Enum):
    QUESTION = "question"
    CHOICE = "choice"
    EXPLANATION = "explanation"


question_tag_links = Table(
    "question_tag_links",
    Base.metadata,
    Column("question_id", UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "tag_id",
        UUID(as_uuid=True),
        ForeignKey("question_tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


def enum_values(values: type[enum.Enum]) -> list[str]:
    return [value.value for value in values]


class QuestionCategory(Base):
    __tablename__ = "question_categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    questions: Mapped[list["Question"]] = relationship("Question", back_populates="category")


class QuestionTag(Base):
    __tablename__ = "question_tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)

    questions: Mapped[list["Question"]] = relationship(
        "Question",
        secondary=question_tag_links,
        back_populates="tags",
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(
            QuestionType,
            name="question_type_enum",
            values_callable=lambda question_types: [question_type.value for question_type in question_types],
        ),
        nullable=False,
        index=True,
    )
    difficulty: Mapped[Difficulty] = mapped_column(
        Enum(
            Difficulty,
            name="question_difficulty_enum",
            values_callable=lambda difficulties: [difficulty.value for difficulty in difficulties],
        ),
        nullable=False,
        index=True,
    )
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    correct_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str | None] = mapped_column(String(240), nullable=True, index=True)
    bloom_level: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    thinking_skill: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    estimated_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    common_mistakes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    keywords: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    course_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    chapter_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="SET NULL"), nullable=True, index=True)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    updated_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    category: Mapped["QuestionCategory"] = relationship("QuestionCategory", back_populates="questions")
    choices: Mapped[list["QuestionChoice"]] = relationship(
        "QuestionChoice",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionChoice.position",
    )
    media: Mapped[list["QuestionMedia"]] = relationship(
        "QuestionMedia",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionMedia.position",
    )
    tags: Mapped[list["QuestionTag"]] = relationship(
        "QuestionTag",
        secondary=question_tag_links,
        back_populates="questions",
    )
    concept_maps: Mapped[list["QuestionConceptMap"]] = relationship(
        "QuestionConceptMap",
        back_populates="question",
        cascade="all, delete-orphan",
    )
    stats: Mapped["QuestionStats | None"] = relationship(
        "QuestionStats",
        back_populates="question",
        cascade="all, delete-orphan",
        uselist=False,
    )
    revisions: Mapped[list["QuestionRevision"]] = relationship(
        "QuestionRevision",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionRevision.version_number.desc()",
    )


class QuestionChoice(Base):
    __tablename__ = "question_choices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    choice_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    question: Mapped["Question"] = relationship("Question", back_populates="choices")
    media: Mapped[list["QuestionMedia"]] = relationship(
        "QuestionMedia",
        back_populates="choice",
        cascade="all, delete-orphan",
        order_by="QuestionMedia.position",
    )


class QuestionMedia(Base):
    __tablename__ = "question_media"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    choice_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_choices.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[MediaType] = mapped_column(
        Enum(
            MediaType,
            name="question_media_type_enum",
            values_callable=enum_values,
        ),
        nullable=False,
        index=True,
    )
    purpose: Mapped[QuestionMediaPurpose] = mapped_column(
        Enum(QuestionMediaPurpose, name="question_media_purpose_enum", values_callable=enum_values),
        nullable=False,
        default=QuestionMediaPurpose.QUESTION,
        index=True,
    )
    caption: Mapped[str | None] = mapped_column(String(240), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    question: Mapped["Question"] = relationship("Question", back_populates="media")
    choice: Mapped["QuestionChoice | None"] = relationship("QuestionChoice", back_populates="media")


class QuestionConceptMap(Base):
    __tablename__ = "question_concept_maps"
    __table_args__ = (
        UniqueConstraint("question_id", "concept_id", name="uq_question_concept_maps_question_concept"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    chapter_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="SET NULL"), nullable=True, index=True)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True)
    concept_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    weight: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    question: Mapped["Question"] = relationship("Question", back_populates="concept_maps")


class QuestionStats(Base):
    __tablename__ = "question_stats"

    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)
    times_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    correct_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    wrong_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    difficulty_index: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    discrimination_index: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    average_time_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    question: Mapped["Question"] = relationship("Question", back_populates="stats")


class QuestionRevision(Base):
    __tablename__ = "question_revisions"
    __table_args__ = (UniqueConstraint("question_id", "version_number", name="uq_question_revisions_question_version"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    question: Mapped["Question"] = relationship("Question", back_populates="revisions")
