import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    TRUE_FALSE = "TRUE_FALSE"
    MULTIPLE_SELECT = "MULTIPLE_SELECT"
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
    PDF = "PDF"
    AUDIO = "AUDIO"
    VIDEO = "VIDEO"


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

question_chapter_links = Table(
    "question_chapter_links",
    Base.metadata,
    Column("question_id", UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    Column("chapter_id", UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), primary_key=True),
)

question_lesson_links = Table(
    "question_lesson_links",
    Base.metadata,
    Column("question_id", UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    Column("lesson_id", UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), primary_key=True),
)

question_concept_links = Table(
    "question_concept_links",
    Base.metadata,
    Column("question_id", UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    Column("concept_id", UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="CASCADE"), primary_key=True),
)

question_atomic_concept_links = Table(
    "question_atomic_concept_links",
    Base.metadata,
    Column("question_id", UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "atomic_concept_id",
        UUID(as_uuid=True),
        ForeignKey("atomic_concepts.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


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
    course_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
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
    answer_data_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True, default=dict)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
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
    chapters: Mapped[list["Chapter"]] = relationship("Chapter", secondary=question_chapter_links)
    lessons: Mapped[list["Lesson"]] = relationship("Lesson", secondary=question_lesson_links)
    concepts: Mapped[list["Concept"]] = relationship("Concept", secondary=question_concept_links)
    atomic_concepts: Mapped[list["AtomicConcept"]] = relationship(
        "AtomicConcept",
        secondary=question_atomic_concept_links,
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


class QuestionMedia(Base):
    __tablename__ = "question_media"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[MediaType] = mapped_column(
        Enum(
            MediaType,
            name="question_media_type_enum",
            values_callable=lambda media_types: [media_type.value for media_type in media_types],
        ),
        nullable=False,
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
