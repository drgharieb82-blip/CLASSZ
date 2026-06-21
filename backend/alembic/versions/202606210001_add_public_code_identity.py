"""Add public_code identity column to users table.

Revision ID: 202606210001
Revises: 202606120012
Create Date: 2026-06-21

Every user gets an immutable public_code (e.g. CLS-26-000145) that serves
as their human-readable identifier across the platform. This replaces
email/username as the public-facing identifier.

Also creates sequences for all entity types to support atomic code generation.
"""

from alembic import op
import sqlalchemy as sa

revision = "202606210001"
down_revision = "202606120012"
branch_labels = None
depends_on = None


# All entity sequences: (sequence_name, start_value)
ENTITY_SEQUENCES = [
    ("seq_student_code", 1),
    ("seq_teacher_code", 1),
    ("seq_parent_code", 1),
    ("seq_assistant_code", 1),
    ("seq_developer_code", 1),
    ("seq_content_manager_code", 1),
    ("seq_finance_code", 1),
    ("seq_admin_code", 1),
    ("seq_super_admin_code", 1),
    ("seq_content_author_code", 1),
    ("seq_course_code", 1),
    ("seq_chapter_code", 1),
    ("seq_session_code", 1),
    ("seq_question_code", 1),
    ("seq_quiz_code", 1),
    ("seq_assignment_code", 1),
    ("seq_certificate_code", 1),
    ("seq_payment_code", 1),
    ("seq_wallet_transaction_code", 1),
    ("seq_support_ticket_code", 1),
    ("seq_ai_request_code", 1),
]


def upgrade() -> None:
    # Add public_code column to users table
    op.add_column(
        "users",
        sa.Column(
            "public_code",
            sa.String(20),
            nullable=True,  # Temporarily nullable for backfill
            comment="Immutable public identifier (e.g. CLS-26-000145). Never changes after creation.",
        ),
    )

    # Create unique index on public_code
    op.create_index("ix_users_public_code", "users", ["public_code"], unique=True)

    # Create sequences for all entity types
    for seq_name, start in ENTITY_SEQUENCES:
        op.execute(sa.text(f"CREATE SEQUENCE IF NOT EXISTS {seq_name} START WITH {start}"))

    # Backfill existing users with generated codes based on role and creation order
    op.execute(sa.text("""
        WITH ordered_users AS (
            SELECT id, role, ROW_NUMBER() OVER (PARTITION BY role ORDER BY created_at) as seq
            FROM users
            WHERE public_code IS NULL
        )
        UPDATE users SET public_code = CASE
            WHEN ordered_users.role = 'student' THEN 'CLS-' || TO_CHAR(EXTRACT(YEAR FROM NOW())::int % 100, 'FM00') || '-' || LPAD(ordered_users.seq::text, 6, '0')
            WHEN ordered_users.role = 'teacher' THEN 'TCH-' || TO_CHAR(EXTRACT(YEAR FROM NOW())::int % 100, 'FM00') || '-' || LPAD(ordered_users.seq::text, 4, '0')
            WHEN ordered_users.role = 'parent' THEN 'PRT-' || TO_CHAR(EXTRACT(YEAR FROM NOW())::int % 100, 'FM00') || '-' || LPAD(ordered_users.seq::text, 4, '0')
            WHEN ordered_users.role = 'assistant' THEN 'AST-' || TO_CHAR(EXTRACT(YEAR FROM NOW())::int % 100, 'FM00') || '-' || LPAD(ordered_users.seq::text, 4, '0')
            WHEN ordered_users.role = 'admin' THEN 'ADM-' || TO_CHAR(EXTRACT(YEAR FROM NOW())::int % 100, 'FM00') || '-' || LPAD(ordered_users.seq::text, 4, '0')
            ELSE 'CLS-' || TO_CHAR(EXTRACT(YEAR FROM NOW())::int % 100, 'FM00') || '-' || LPAD(ordered_users.seq::text, 6, '0')
        END
        FROM ordered_users
        WHERE users.id = ordered_users.id
    """))

    # Update sequences to reflect backfilled counts
    for role_seq in [
        ("student", "seq_student_code"),
        ("teacher", "seq_teacher_code"),
        ("parent", "seq_parent_code"),
        ("assistant", "seq_assistant_code"),
        ("admin", "seq_admin_code"),
    ]:
        op.execute(sa.text(f"""
            SELECT setval('{role_seq[1]}',
                COALESCE((SELECT COUNT(*) FROM users WHERE role = '{role_seq[0]}'), 0) + 1,
                false
            )
        """))

    # Make column NOT NULL after backfill
    op.alter_column("users", "public_code", nullable=False)


def downgrade() -> None:
    op.drop_index("ix_users_public_code", table_name="users")
    op.drop_column("users", "public_code")

    for seq_name, _ in ENTITY_SEQUENCES:
        op.execute(sa.text(f"DROP SEQUENCE IF EXISTS {seq_name}"))
