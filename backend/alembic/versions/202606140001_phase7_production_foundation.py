"""phase 7 production foundation

Revision ID: 202606140001
Revises: 202606130014
Create Date: 2026-06-14 00:01:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606140001"
down_revision: Union[str, None] = "202606130014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def create_enum(name: str, values: tuple[str, ...]) -> postgresql.ENUM:
    enum = postgresql.ENUM(*values, name=name)
    enum.create(op.get_bind(), checkfirst=True)
    return postgresql.ENUM(*values, name=name, create_type=False)


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = 'role_enum' AND e.enumlabel = 'assistant_teacher'
            ) THEN
                ALTER TYPE role_enum ADD VALUE 'assistant_teacher';
            END IF;
        END $$;
        """
    )

    concept_state_status_enum = create_enum("concept_state_status_enum", ("new", "learning", "review", "mastered"))
    revision_plan_status_enum = create_enum("revision_plan_status_enum", ("draft", "active", "completed", "paused"))
    insight_type_enum = create_enum("explainable_insight_type_enum", ("strength", "weakness", "memory", "recommendation", "risk"))

    op.create_table(
        "students",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("display_name", sa.String(length=160), nullable=False),
        sa.Column("grade", sa.String(length=80), nullable=False),
        sa.Column("parent_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["parent_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_students_parent_user_id"), "students", ["parent_user_id"], unique=False)
    op.create_index(op.f("ix_students_user_id"), "students", ["user_id"], unique=True)

    op.create_table(
        "teachers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("display_name", sa.String(length=160), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("specialization", sa.String(length=160), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_teachers_user_id"), "teachers", ["user_id"], unique=True)

    op.create_table(
        "concepts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("slug", sa.String(length=220), nullable=False),
        sa.Column("subject", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("difficulty_level", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_concepts_course_id"), "concepts", ["course_id"], unique=False)
    op.create_index(op.f("ix_concepts_lesson_id"), "concepts", ["lesson_id"], unique=False)
    op.create_index(op.f("ix_concepts_name"), "concepts", ["name"], unique=False)
    op.create_index(op.f("ix_concepts_slug"), "concepts", ["slug"], unique=True)
    op.create_index(op.f("ix_concepts_subject"), "concepts", ["subject"], unique=False)

    op.create_table(
        "concept_dependencies",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("target_concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("relation_type", sa.String(length=80), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["source_concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_concept_id", "target_concept_id", name="uq_concept_dependencies_source_target"),
    )
    op.create_index(op.f("ix_concept_dependencies_source_concept_id"), "concept_dependencies", ["source_concept_id"], unique=False)
    op.create_index(op.f("ix_concept_dependencies_target_concept_id"), "concept_dependencies", ["target_concept_id"], unique=False)

    op.create_table(
        "student_concept_states",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mastery_score", sa.Integer(), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column("weakness_score", sa.Integer(), nullable=False),
        sa.Column("status", concept_state_status_enum, nullable=False),
        sa.Column("last_practiced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_review_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "concept_id", name="uq_student_concept_states_student_concept"),
    )
    op.create_index(op.f("ix_student_concept_states_concept_id"), "student_concept_states", ["concept_id"], unique=False)
    op.create_index(op.f("ix_student_concept_states_next_review_at"), "student_concept_states", ["next_review_at"], unique=False)
    op.create_index(op.f("ix_student_concept_states_status"), "student_concept_states", ["status"], unique=False)
    op.create_index(op.f("ix_student_concept_states_student_id"), "student_concept_states", ["student_id"], unique=False)

    op.create_table(
        "memory_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("event_type", postgresql.ENUM(name="student_memory_event_type_enum", create_type=False), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("importance", postgresql.ENUM(name="student_memory_importance_enum", create_type=False), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_memory_events_concept_id"), "memory_events", ["concept_id"], unique=False)
    op.create_index(op.f("ix_memory_events_event_type"), "memory_events", ["event_type"], unique=False)
    op.create_index(op.f("ix_memory_events_occurred_at"), "memory_events", ["occurred_at"], unique=False)
    op.create_index(op.f("ix_memory_events_student_id"), "memory_events", ["student_id"], unique=False)

    op.create_table(
        "revision_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", revision_plan_status_enum, nullable=False),
        sa.Column("priority", sa.String(length=40), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("plan_items", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_revision_plans_due_at"), "revision_plans", ["due_at"], unique=False)
    op.create_index(op.f("ix_revision_plans_priority"), "revision_plans", ["priority"], unique=False)
    op.create_index(op.f("ix_revision_plans_status"), "revision_plans", ["status"], unique=False)
    op.create_index(op.f("ix_revision_plans_student_id"), "revision_plans", ["student_id"], unique=False)

    op.create_table(
        "explainable_insights",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("insight_type", insight_type_enum, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_explainable_insights_concept_id"), "explainable_insights", ["concept_id"], unique=False)
    op.create_index(op.f("ix_explainable_insights_insight_type"), "explainable_insights", ["insight_type"], unique=False)
    op.create_index(op.f("ix_explainable_insights_student_id"), "explainable_insights", ["student_id"], unique=False)


def downgrade() -> None:
    for index_name, table_name in (
        (op.f("ix_explainable_insights_student_id"), "explainable_insights"),
        (op.f("ix_explainable_insights_insight_type"), "explainable_insights"),
        (op.f("ix_explainable_insights_concept_id"), "explainable_insights"),
        (op.f("ix_revision_plans_student_id"), "revision_plans"),
        (op.f("ix_revision_plans_status"), "revision_plans"),
        (op.f("ix_revision_plans_priority"), "revision_plans"),
        (op.f("ix_revision_plans_due_at"), "revision_plans"),
        (op.f("ix_memory_events_student_id"), "memory_events"),
        (op.f("ix_memory_events_occurred_at"), "memory_events"),
        (op.f("ix_memory_events_event_type"), "memory_events"),
        (op.f("ix_memory_events_concept_id"), "memory_events"),
        (op.f("ix_student_concept_states_student_id"), "student_concept_states"),
        (op.f("ix_student_concept_states_status"), "student_concept_states"),
        (op.f("ix_student_concept_states_next_review_at"), "student_concept_states"),
        (op.f("ix_student_concept_states_concept_id"), "student_concept_states"),
        (op.f("ix_concept_dependencies_target_concept_id"), "concept_dependencies"),
        (op.f("ix_concept_dependencies_source_concept_id"), "concept_dependencies"),
        (op.f("ix_concepts_subject"), "concepts"),
        (op.f("ix_concepts_slug"), "concepts"),
        (op.f("ix_concepts_name"), "concepts"),
        (op.f("ix_concepts_lesson_id"), "concepts"),
        (op.f("ix_concepts_course_id"), "concepts"),
        (op.f("ix_teachers_user_id"), "teachers"),
        (op.f("ix_students_user_id"), "students"),
        (op.f("ix_students_parent_user_id"), "students"),
    ):
        op.drop_index(index_name, table_name=table_name)

    for table_name in (
        "explainable_insights",
        "revision_plans",
        "memory_events",
        "student_concept_states",
        "concept_dependencies",
        "concepts",
        "teachers",
        "students",
    ):
        op.drop_table(table_name)

    for enum_name in (
        "explainable_insight_type_enum",
        "revision_plan_status_enum",
        "concept_state_status_enum",
    ):
        postgresql.ENUM(name=enum_name).drop(op.get_bind(), checkfirst=True)
