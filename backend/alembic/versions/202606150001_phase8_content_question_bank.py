"""phase 8 content and question bank production

Revision ID: 202606150001
Revises: 202606140001
Create Date: 2026-06-15 00:01:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202606150001"
down_revision: Union[str, None] = "202606140001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def add_enum_value(enum_name: str, value: str) -> None:
    op.execute(
        sa.text(
            f"""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON e.enumtypid = t.oid
                    WHERE t.typname = '{enum_name}' AND e.enumlabel = '{value}'
                ) THEN
                    ALTER TYPE {enum_name} ADD VALUE '{value}';
                END IF;
            END $$;
            """
        )
    )


def create_enum(name: str, values: tuple[str, ...]) -> postgresql.ENUM:
    enum = postgresql.ENUM(*values, name=name)
    enum.create(op.get_bind(), checkfirst=True)
    return postgresql.ENUM(*values, name=name, create_type=False)


def upgrade() -> None:
    add_enum_value("question_type_enum", "SHORT_ANSWER")
    for media_value in ("DIAGRAM", "EQUATION_IMAGE", "ATTACHMENT"):
        add_enum_value("question_media_type_enum", media_value)

    media_purpose_enum = create_enum("question_media_purpose_enum", ("question", "choice", "explanation"))
    import_status_enum = create_enum("question_import_job_status_enum", ("uploaded", "previewed", "committed", "failed"))
    import_source_enum = create_enum("question_import_source_type_enum", ("csv", "excel", "json"))

    op.add_column("questions", sa.Column("correct_answer", sa.Text(), nullable=True))
    op.add_column("questions", sa.Column("source", sa.String(length=240), nullable=True))
    op.add_column("questions", sa.Column("bloom_level", sa.String(length=80), nullable=True))
    op.add_column("questions", sa.Column("thinking_skill", sa.String(length=120), nullable=True))
    op.add_column("questions", sa.Column("estimated_time_seconds", sa.Integer(), nullable=True))
    op.add_column("questions", sa.Column("common_mistakes", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("questions", sa.Column("keywords", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("questions", sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("questions", sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("questions", sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("questions", sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("questions", sa.Column("updated_by_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("questions", sa.Column("version_number", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("questions", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("questions", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_foreign_key("fk_questions_course_id_courses", "questions", "courses", ["course_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_questions_chapter_id_chapters", "questions", "chapters", ["chapter_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_questions_lesson_id_lessons", "questions", "lessons", ["lesson_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_questions_created_by_id_users", "questions", "users", ["created_by_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_questions_updated_by_id_users", "questions", "users", ["updated_by_id"], ["id"], ondelete="SET NULL")
    for index_name, columns in (
        ("ix_questions_source", ["source"]),
        ("ix_questions_bloom_level", ["bloom_level"]),
        ("ix_questions_thinking_skill", ["thinking_skill"]),
        ("ix_questions_course_id", ["course_id"]),
        ("ix_questions_chapter_id", ["chapter_id"]),
        ("ix_questions_lesson_id", ["lesson_id"]),
        ("ix_questions_created_by_id", ["created_by_id"]),
        ("ix_questions_updated_by_id", ["updated_by_id"]),
        ("ix_questions_deleted_at", ["deleted_at"]),
    ):
        op.create_index(index_name, "questions", columns, unique=False)
    op.alter_column("questions", "common_mistakes", server_default=None)
    op.alter_column("questions", "keywords", server_default=None)
    op.alter_column("questions", "version_number", server_default=None)

    op.add_column("question_media", sa.Column("choice_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("question_media", sa.Column("purpose", media_purpose_enum, nullable=False, server_default="question"))
    op.create_foreign_key("fk_question_media_choice_id_question_choices", "question_media", "question_choices", ["choice_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_question_media_choice_id", "question_media", ["choice_id"], unique=False)
    op.create_index("ix_question_media_purpose", "question_media", ["purpose"], unique=False)
    op.alter_column("question_media", "purpose", server_default=None)

    op.create_table(
        "question_concept_maps",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("concept_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["chapter_id"], ["chapters.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("question_id", "concept_id", name="uq_question_concept_maps_question_concept"),
    )
    for index_name, columns in (
        ("ix_question_concept_maps_question_id", ["question_id"]),
        ("ix_question_concept_maps_course_id", ["course_id"]),
        ("ix_question_concept_maps_chapter_id", ["chapter_id"]),
        ("ix_question_concept_maps_lesson_id", ["lesson_id"]),
        ("ix_question_concept_maps_concept_id", ["concept_id"]),
    ):
        op.create_index(index_name, "question_concept_maps", columns, unique=False)

    op.create_table(
        "question_stats",
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("times_used", sa.Integer(), nullable=False),
        sa.Column("correct_percentage", sa.Float(), nullable=False),
        sa.Column("wrong_percentage", sa.Float(), nullable=False),
        sa.Column("difficulty_index", sa.Float(), nullable=False),
        sa.Column("discrimination_index", sa.Float(), nullable=False),
        sa.Column("average_time_seconds", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("question_id"),
    )

    op.create_table(
        "question_revisions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("snapshot", sa.JSON(), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("question_id", "version_number", name="uq_question_revisions_question_version"),
    )
    op.create_index("ix_question_revisions_question_id", "question_revisions", ["question_id"], unique=False)
    op.create_index("ix_question_revisions_created_by_id", "question_revisions", ["created_by_id"], unique=False)

    op.create_table(
        "question_import_jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("source_type", import_source_enum, nullable=False),
        sa.Column("status", import_status_enum, nullable=False),
        sa.Column("uploaded_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("raw_rows", sa.JSON(), nullable=False),
        sa.Column("preview_rows", sa.JSON(), nullable=False),
        sa.Column("created_question_ids", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_question_import_jobs_source_type", "question_import_jobs", ["source_type"], unique=False)
    op.create_index("ix_question_import_jobs_status", "question_import_jobs", ["status"], unique=False)
    op.create_index("ix_question_import_jobs_uploaded_by_id", "question_import_jobs", ["uploaded_by_id"], unique=False)

    op.create_table(
        "question_import_errors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("row_number", sa.Integer(), nullable=False),
        sa.Column("field_name", sa.String(length=120), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["question_import_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_question_import_errors_job_id", "question_import_errors", ["job_id"], unique=False)

    op.create_table(
        "question_import_summaries",
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("total_rows", sa.Integer(), nullable=False),
        sa.Column("valid_rows", sa.Integer(), nullable=False),
        sa.Column("invalid_rows", sa.Integer(), nullable=False),
        sa.Column("committed_rows", sa.Integer(), nullable=False),
        sa.Column("skipped_rows", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["question_import_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("job_id"),
    )


def downgrade() -> None:
    op.drop_table("question_import_summaries")
    op.drop_index("ix_question_import_errors_job_id", table_name="question_import_errors")
    op.drop_table("question_import_errors")
    op.drop_index("ix_question_import_jobs_uploaded_by_id", table_name="question_import_jobs")
    op.drop_index("ix_question_import_jobs_status", table_name="question_import_jobs")
    op.drop_index("ix_question_import_jobs_source_type", table_name="question_import_jobs")
    op.drop_table("question_import_jobs")
    op.drop_index("ix_question_revisions_created_by_id", table_name="question_revisions")
    op.drop_index("ix_question_revisions_question_id", table_name="question_revisions")
    op.drop_table("question_revisions")
    op.drop_table("question_stats")
    for index_name in (
        "ix_question_concept_maps_concept_id",
        "ix_question_concept_maps_lesson_id",
        "ix_question_concept_maps_chapter_id",
        "ix_question_concept_maps_course_id",
        "ix_question_concept_maps_question_id",
    ):
        op.drop_index(index_name, table_name="question_concept_maps")
    op.drop_table("question_concept_maps")
    op.drop_index("ix_question_media_purpose", table_name="question_media")
    op.drop_index("ix_question_media_choice_id", table_name="question_media")
    op.drop_constraint("fk_question_media_choice_id_question_choices", "question_media", type_="foreignkey")
    op.drop_column("question_media", "purpose")
    op.drop_column("question_media", "choice_id")
    for index_name in (
        "ix_questions_deleted_at",
        "ix_questions_updated_by_id",
        "ix_questions_created_by_id",
        "ix_questions_lesson_id",
        "ix_questions_chapter_id",
        "ix_questions_course_id",
        "ix_questions_thinking_skill",
        "ix_questions_bloom_level",
        "ix_questions_source",
    ):
        op.drop_index(index_name, table_name="questions")
    for constraint_name in (
        "fk_questions_updated_by_id_users",
        "fk_questions_created_by_id_users",
        "fk_questions_lesson_id_lessons",
        "fk_questions_chapter_id_chapters",
        "fk_questions_course_id_courses",
    ):
        op.drop_constraint(constraint_name, "questions", type_="foreignkey")
    for column_name in (
        "updated_at",
        "deleted_at",
        "version_number",
        "updated_by_id",
        "created_by_id",
        "lesson_id",
        "chapter_id",
        "course_id",
        "keywords",
        "common_mistakes",
        "estimated_time_seconds",
        "thinking_skill",
        "bloom_level",
        "source",
        "correct_answer",
    ):
        op.drop_column("questions", column_name)

    for enum_name in (
        "question_import_source_type_enum",
        "question_import_job_status_enum",
        "question_media_purpose_enum",
    ):
        postgresql.ENUM(name=enum_name).drop(op.get_bind(), checkfirst=True)
