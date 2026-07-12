"""assistant permission delegation system

Revision ID: 202607120001
Revises: 202607110001
Create Date: 2026-07-12 00:00:00.000000

Also fixes a pre-existing schema-drift bug found while working in this
area: `role_enum` was created with only 5 values (admin, teacher, assistant,
student, parent) back in 202606120001 and was never migrated to add
`super_admin`/`developer`/`finance`, even though the Python-side `Role` enum
has included them for a long time — creating a user with one of those roles
against a real Postgres database currently fails outright. `content_manager`/
`content_author` were similarly never added to the real enum (and are now
being removed from the Python side entirely, so nothing to add there).
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "202607120001"
down_revision: Union[str, None] = "202607110001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


assistant_link_status_enum = postgresql.ENUM(
    "pending", "active", "revoked", "denied", name="assistant_link_status_enum", create_type=False
)
assistant_invite_status_enum = postgresql.ENUM(
    "pending", "matched", "cancelled", name="assistant_invite_status_enum", create_type=False
)
assistant_resource_enum = postgresql.ENUM(
    "chapters_lessons", "materials", "sessions", "questions", "quizzes", "homework", "grading",
    "students_data", "pods", "parent_contacts", "anti_cheating", "quiz_submissions",
    name="assistant_resource_enum", create_type=False,
)
assistant_action_enum = postgresql.ENUM(
    "view", "create", "edit", "delete", "grade", name="assistant_action_enum", create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()

    # Bugfix: role_enum was never migrated to include these 3 real Role
    # values (see module docstring). ADD VALUE runs outside the enum's own
    # transaction-unsafe restriction here because we don't use the new
    # values later in this same migration.
    for value in ("super_admin", "developer", "finance"):
        op.execute(f"ALTER TYPE role_enum ADD VALUE IF NOT EXISTS '{value}'")

    # content_manager/content_author were never added to the real role_enum
    # either (confirmed against the live database), so removing them from
    # the Python-side Role enum requires no corresponding DB enum change.
    # Their leftover, unused public-code sequences are dropped for hygiene.
    op.execute("DROP SEQUENCE IF EXISTS seq_content_manager_code")
    op.execute("DROP SEQUENCE IF EXISTS seq_content_author_code")

    assistant_link_status_enum.create(bind, checkfirst=True)
    assistant_invite_status_enum.create(bind, checkfirst=True)
    assistant_resource_enum.create(bind, checkfirst=True)
    assistant_action_enum.create(bind, checkfirst=True)

    op.create_table(
        "teacher_assistant_links",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("teacher_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assistant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", assistant_link_status_enum, nullable=False, server_default="pending"),
        sa.Column("invited_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assistant_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("teacher_id", "assistant_id", name="uq_teacher_assistant_links_teacher_assistant"),
    )
    op.create_index("ix_teacher_assistant_links_teacher_id", "teacher_assistant_links", ["teacher_id"])
    op.create_index("ix_teacher_assistant_links_assistant_id", "teacher_assistant_links", ["assistant_id"])
    op.create_index("ix_teacher_assistant_links_status", "teacher_assistant_links", ["status"])

    op.create_table(
        "assistant_invites",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("teacher_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("invited_email", sa.String(length=320), nullable=False),
        sa.Column("status", assistant_invite_status_enum, nullable=False, server_default="pending"),
        sa.Column("resolved_link_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resolved_link_id"], ["teacher_assistant_links.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assistant_invites_teacher_id", "assistant_invites", ["teacher_id"])
    op.create_index("ix_assistant_invites_invited_email", "assistant_invites", ["invited_email"])
    op.create_index("ix_assistant_invites_status", "assistant_invites", ["status"])

    op.create_table(
        "assistant_permissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("link_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("resource", assistant_resource_enum, nullable=False),
        sa.Column("action", assistant_action_enum, nullable=False),
        sa.Column("granted_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["link_id"], ["teacher_assistant_links.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("link_id", "resource", "action", name="uq_assistant_permissions_link_resource_action"),
    )
    op.create_index("ix_assistant_permissions_link_id", "assistant_permissions", ["link_id"])
    op.create_index("ix_assistant_permissions_resource", "assistant_permissions", ["resource"])


def downgrade() -> None:
    op.drop_index("ix_assistant_permissions_resource", table_name="assistant_permissions")
    op.drop_index("ix_assistant_permissions_link_id", table_name="assistant_permissions")
    op.drop_table("assistant_permissions")

    op.drop_index("ix_assistant_invites_status", table_name="assistant_invites")
    op.drop_index("ix_assistant_invites_invited_email", table_name="assistant_invites")
    op.drop_index("ix_assistant_invites_teacher_id", table_name="assistant_invites")
    op.drop_table("assistant_invites")

    op.drop_index("ix_teacher_assistant_links_status", table_name="teacher_assistant_links")
    op.drop_index("ix_teacher_assistant_links_assistant_id", table_name="teacher_assistant_links")
    op.drop_index("ix_teacher_assistant_links_teacher_id", table_name="teacher_assistant_links")
    op.drop_table("teacher_assistant_links")

    bind = op.get_bind()
    assistant_action_enum.drop(bind, checkfirst=True)
    assistant_resource_enum.drop(bind, checkfirst=True)
    assistant_invite_status_enum.drop(bind, checkfirst=True)
    assistant_link_status_enum.drop(bind, checkfirst=True)

    # Note: role_enum's added values (super_admin/developer/finance) and the
    # dropped content sequences are not reversed here — Postgres can't remove
    # enum values in place, and recreating the pre-bugfix broken state isn't
    # a meaningful rollback target.
