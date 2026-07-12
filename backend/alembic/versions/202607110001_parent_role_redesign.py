"""parent role redesign

Revision ID: 202607110001
Revises: 202607100009
Create Date: 2026-07-11 00:00:00.000000
"""

import secrets
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "202607110001"
down_revision: Union[str, None] = "202607100009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


parent_link_status_enum = postgresql.ENUM(
    "pending", "active", "revoked", "denied", name="parent_link_status_enum", create_type=False
)
link_initiator_enum = postgresql.ENUM(
    "parent_code", "student_invite", name="link_initiator_enum", create_type=False
)
parent_invite_status_enum = postgresql.ENUM(
    "pending", "matched", "cancelled", name="parent_invite_status_enum", create_type=False
)
parent_request_target_type_enum = postgresql.ENUM(
    "teacher", "platform", "child", name="parent_request_target_type_enum", create_type=False
)
parent_request_status_enum = postgresql.ENUM(
    "open", "replied", "closed", name="parent_request_status_enum", create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()
    parent_link_status_enum.create(bind, checkfirst=True)
    link_initiator_enum.create(bind, checkfirst=True)
    parent_invite_status_enum.create(bind, checkfirst=True)
    parent_request_target_type_enum.create(bind, checkfirst=True)
    parent_request_status_enum.create(bind, checkfirst=True)

    op.add_column("students", sa.Column("parent_link_code", sa.String(length=32), nullable=True))
    op.create_index("ix_students_parent_link_code", "students", ["parent_link_code"], unique=True)

    # Backfill a random link code for every existing student row — done in
    # Python (not a SQL function) so this doesn't depend on pgcrypto/
    # gen_random_uuid() being available.
    student_ids = [row[0] for row in bind.execute(sa.text("SELECT id FROM students")).fetchall()]
    for student_id in student_ids:
        code = secrets.token_urlsafe(9)
        bind.execute(
            sa.text("UPDATE students SET parent_link_code = :code WHERE id = :id"),
            {"code": code, "id": student_id},
        )

    op.create_table(
        "parent_student_links",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", parent_link_status_enum, nullable=False, server_default="pending"),
        sa.Column("initiated_by", link_initiator_enum, nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["parent_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("parent_id", "student_id", name="uq_parent_student_links_parent_student"),
    )
    op.create_index("ix_parent_student_links_parent_id", "parent_student_links", ["parent_id"])
    op.create_index("ix_parent_student_links_student_id", "parent_student_links", ["student_id"])
    op.create_index("ix_parent_student_links_status", "parent_student_links", ["status"])

    op.create_table(
        "parent_invites",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("invited_email", sa.String(length=320), nullable=False),
        sa.Column("status", parent_invite_status_enum, nullable=False, server_default="pending"),
        sa.Column("resolved_link_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resolved_link_id"], ["parent_student_links.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_parent_invites_student_id", "parent_invites", ["student_id"])
    op.create_index("ix_parent_invites_invited_email", "parent_invites", ["invited_email"])
    op.create_index("ix_parent_invites_status", "parent_invites", ["status"])

    op.create_table(
        "parent_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("target_type", parent_request_target_type_enum, nullable=False),
        sa.Column("teacher_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("subject", sa.String(length=220), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", parent_request_status_enum, nullable=False, server_default="open"),
        sa.Column("reply_body", sa.Text(), nullable=True),
        sa.Column("replied_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("replied_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["replied_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_parent_requests_parent_id", "parent_requests", ["parent_id"])
    op.create_index("ix_parent_requests_student_id", "parent_requests", ["student_id"])
    op.create_index("ix_parent_requests_teacher_id", "parent_requests", ["teacher_id"])
    op.create_index("ix_parent_requests_course_id", "parent_requests", ["course_id"])
    op.create_index("ix_parent_requests_status", "parent_requests", ["status"])
    op.create_index("ix_parent_requests_target_type", "parent_requests", ["target_type"])


def downgrade() -> None:
    op.drop_index("ix_parent_requests_target_type", table_name="parent_requests")
    op.drop_index("ix_parent_requests_status", table_name="parent_requests")
    op.drop_index("ix_parent_requests_course_id", table_name="parent_requests")
    op.drop_index("ix_parent_requests_teacher_id", table_name="parent_requests")
    op.drop_index("ix_parent_requests_student_id", table_name="parent_requests")
    op.drop_index("ix_parent_requests_parent_id", table_name="parent_requests")
    op.drop_table("parent_requests")

    op.drop_index("ix_parent_invites_status", table_name="parent_invites")
    op.drop_index("ix_parent_invites_invited_email", table_name="parent_invites")
    op.drop_index("ix_parent_invites_student_id", table_name="parent_invites")
    op.drop_table("parent_invites")

    op.drop_index("ix_parent_student_links_status", table_name="parent_student_links")
    op.drop_index("ix_parent_student_links_student_id", table_name="parent_student_links")
    op.drop_index("ix_parent_student_links_parent_id", table_name="parent_student_links")
    op.drop_table("parent_student_links")

    op.drop_index("ix_students_parent_link_code", table_name="students")
    op.drop_column("students", "parent_link_code")

    bind = op.get_bind()
    parent_request_status_enum.drop(bind, checkfirst=True)
    parent_request_target_type_enum.drop(bind, checkfirst=True)
    parent_invite_status_enum.drop(bind, checkfirst=True)
    link_initiator_enum.drop(bind, checkfirst=True)
    parent_link_status_enum.drop(bind, checkfirst=True)
