"""student memory persistence

Revision ID: 202606130013
Revises: 202606120012
Create Date: 2026-06-13 00:13:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606130013"
down_revision: Union[str, None] = "202606120012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def create_enum(name: str, values: tuple[str, ...]) -> postgresql.ENUM:
    enum = postgresql.ENUM(*values, name=name)
    enum.create(op.get_bind(), checkfirst=True)
    return postgresql.ENUM(*values, name=name, create_type=False)


def upgrade() -> None:
    importance_enum = create_enum("student_memory_importance_enum", ("low", "medium", "high"))
    priority_enum = create_enum("student_memory_priority_enum", ("low", "medium", "high"))
    event_type_enum = create_enum(
        "student_memory_event_type_enum",
        ("LessonCompleted", "QuizCompleted", "WeaknessDetected", "MasteryImproved", "RevisionCompleted", "LearningPathUpdated"),
    )
    learning_style_enum = create_enum("student_memory_learning_style_enum", ("visual", "auditory", "reading", "practice", "mixed"))
    difficulty_enum = create_enum("student_memory_difficulty_preference_enum", ("easy", "medium", "hard", "adaptive"))
    language_enum = create_enum("student_memory_preferred_language_enum", ("ar", "en"))
    content_type_enum = create_enum("student_memory_content_type_enum", ("video", "notes", "questions", "mixed"))
    study_time_enum = create_enum("student_memory_study_time_enum", ("morning", "afternoon", "evening", "night"))
    consistency_enum = create_enum("student_memory_consistency_level_enum", ("low", "medium", "high"))

    op.create_table(
        "student_memory_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("display_name", sa.String(length=160), nullable=False),
        sa.Column("grade", sa.String(length=80), nullable=False),
        sa.Column("preferred_language", language_enum, nullable=False),
        sa.Column("learning_style", learning_style_enum, nullable=False),
        sa.Column("average_session_minutes", sa.Integer(), nullable=False),
        sa.Column("preferred_difficulty", difficulty_enum, nullable=False),
        sa.Column("attention_span", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id"),
    )
    op.create_index(op.f("ix_student_memory_profiles_student_id"), "student_memory_profiles", ["student_id"], unique=True)

    op.create_table(
        "student_memory_strengths",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", sa.String(length=120), nullable=False),
        sa.Column("concept_name", sa.String(length=180), nullable=False),
        sa.Column("subject", sa.String(length=120), nullable=False),
        sa.Column("mastery_level", sa.Integer(), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False),
        sa.Column("reinforcement_action", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_strengths_profile_id"), "student_memory_strengths", ["profile_id"], unique=False)

    op.create_table(
        "student_memory_weaknesses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", sa.String(length=120), nullable=False),
        sa.Column("concept_name", sa.String(length=180), nullable=False),
        sa.Column("subject", sa.String(length=120), nullable=False),
        sa.Column("mastery_level", sa.Integer(), nullable=False),
        sa.Column("priority", priority_enum, nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column("recommended_action", sa.Text(), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_weaknesses_profile_id"), "student_memory_weaknesses", ["profile_id"], unique=False)
    op.create_index(op.f("ix_student_memory_weaknesses_priority"), "student_memory_weaknesses", ["priority"], unique=False)

    op.create_table(
        "student_memory_learning_preferences",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("learning_style", learning_style_enum, nullable=False),
        sa.Column("preferred_language", language_enum, nullable=False),
        sa.Column("preferred_difficulty", difficulty_enum, nullable=False),
        sa.Column("best_content_type", content_type_enum, nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_learning_preferences_profile_id"), "student_memory_learning_preferences", ["profile_id"], unique=False)

    op.create_table(
        "student_memory_study_patterns",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("average_session_minutes", sa.Integer(), nullable=False),
        sa.Column("preferred_study_time", study_time_enum, nullable=False),
        sa.Column("weekly_study_days", sa.Integer(), nullable=False),
        sa.Column("consistency_level", consistency_enum, nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_study_patterns_profile_id"), "student_memory_study_patterns", ["profile_id"], unique=False)

    op.create_table(
        "student_memory_attention_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("attention_span", sa.Integer(), nullable=False),
        sa.Column("best_session_length", sa.Integer(), nullable=False),
        sa.Column("break_frequency_minutes", sa.Integer(), nullable=False),
        sa.Column("needs_motivation", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_attention_profiles_profile_id"), "student_memory_attention_profiles", ["profile_id"], unique=False)

    op.create_table(
        "student_memory_timeline_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("event_type", event_type_enum, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("importance", importance_enum, nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_timeline_events_event_type"), "student_memory_timeline_events", ["event_type"], unique=False)
    op.create_index(op.f("ix_student_memory_timeline_events_profile_id"), "student_memory_timeline_events", ["profile_id"], unique=False)
    op.create_index(op.f("ix_student_memory_timeline_events_timestamp"), "student_memory_timeline_events", ["timestamp"], unique=False)

    op.create_table(
        "student_memory_forgetting_curve",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", sa.String(length=120), nullable=False),
        sa.Column("concept_name", sa.String(length=180), nullable=False),
        sa.Column("last_reviewed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("retention_score", sa.Integer(), nullable=False),
        sa.Column("risk_level", priority_enum, nullable=False),
        sa.Column("next_review_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("recommendation", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_forgetting_curve_profile_id"), "student_memory_forgetting_curve", ["profile_id"], unique=False)

    op.create_table(
        "student_memory_recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", priority_enum, nullable=False),
        sa.Column("action_type", sa.String(length=80), nullable=False),
        sa.Column("related_concept", sa.String(length=180), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_recommendations_profile_id"), "student_memory_recommendations", ["profile_id"], unique=False)

    op.create_table(
        "student_memory_summaries",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("headline", sa.String(length=255), nullable=False),
        sa.Column("overview", sa.Text(), nullable=False),
        sa.Column("next_best_action", sa.Text(), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column("strengths_count", sa.Integer(), nullable=False),
        sa.Column("weaknesses_count", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_summaries_profile_id"), "student_memory_summaries", ["profile_id"], unique=False)

    op.create_table(
        "student_memory_long_term_insights",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("signal_type", sa.String(length=80), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column("importance", importance_enum, nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["student_memory_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_memory_long_term_insights_profile_id"), "student_memory_long_term_insights", ["profile_id"], unique=False)


def downgrade() -> None:
    for table_name in (
        "student_memory_long_term_insights",
        "student_memory_summaries",
        "student_memory_recommendations",
        "student_memory_forgetting_curve",
        "student_memory_timeline_events",
        "student_memory_attention_profiles",
        "student_memory_study_patterns",
        "student_memory_learning_preferences",
        "student_memory_weaknesses",
        "student_memory_strengths",
        "student_memory_profiles",
    ):
        op.drop_table(table_name)

    for enum_name in (
        "student_memory_consistency_level_enum",
        "student_memory_study_time_enum",
        "student_memory_content_type_enum",
        "student_memory_preferred_language_enum",
        "student_memory_difficulty_preference_enum",
        "student_memory_learning_style_enum",
        "student_memory_event_type_enum",
        "student_memory_priority_enum",
        "student_memory_importance_enum",
    ):
        postgresql.ENUM(name=enum_name).drop(op.get_bind(), checkfirst=True)
