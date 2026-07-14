import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AssistantLinkStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REVOKED = "revoked"
    DENIED = "denied"


class AssistantInviteStatus(str, enum.Enum):
    PENDING = "pending"
    MATCHED = "matched"
    CANCELLED = "cancelled"


class AssistantResource(str, enum.Enum):
    """One member per teacher-owned resource type an assistant can be
    granted delegated access to. Deliberately mirrors real screens/menus,
    not raw endpoint paths, so the permission grid maps 1:1 to what a
    teacher actually sees when delegating."""

    CHAPTERS_LESSONS = "chapters_lessons"
    MATERIALS = "materials"
    SESSIONS = "sessions"
    QUESTIONS = "questions"
    QUIZZES = "quizzes"
    HOMEWORK = "homework"
    GRADING = "grading"
    STUDENTS_DATA = "students_data"
    PODS = "pods"
    PARENT_CONTACTS = "parent_contacts"
    ANTI_CHEATING = "anti_cheating"
    QUIZ_SUBMISSIONS = "quiz_submissions"


class AssistantAction(str, enum.Enum):
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    GRADE = "grade"


class TeacherAssistantLink(Base):
    """A verified link between a TEACHER and an ASSISTANT user. Always
    teacher-initiated (no assistant-requests-to-join flow exists anywhere
    in the product) — the assistant must accept before the link is ACTIVE
    and any permissions on it take effect."""

    __tablename__ = "teacher_assistant_links"
    __table_args__ = (
        UniqueConstraint("teacher_id", "assistant_id", name="uq_teacher_assistant_links_teacher_assistant"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assistant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[AssistantLinkStatus] = mapped_column(
        Enum(
            AssistantLinkStatus,
            name="assistant_link_status_enum",
            values_callable=lambda statuses: [s.value for s in statuses],
        ),
        nullable=False,
        default=AssistantLinkStatus.PENDING,
        index=True,
    )
    invited_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AssistantInvite(Base):
    """A teacher's outbound invite to an assistant's email address, tracked
    even before that email has an ASSISTANT account (self-registration for
    the assistant role is allowed — see auth/schemas.py). Resolved into a
    TeacherAssistantLink either immediately (email already registered) or
    later at registration time (see the hook in auth/service.py)."""

    __tablename__ = "assistant_invites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    invited_email: Mapped[str] = mapped_column(String(320), nullable=False)
    status: Mapped[AssistantInviteStatus] = mapped_column(
        Enum(
            AssistantInviteStatus,
            name="assistant_invite_status_enum",
            values_callable=lambda statuses: [s.value for s in statuses],
        ),
        nullable=False,
        default=AssistantInviteStatus.PENDING,
        index=True,
    )
    resolved_link_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teacher_assistant_links.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AssistantPermission(Base):
    """A single granted (resource, action) pair on a TeacherAssistantLink.
    Individual grants only — no reusable named role templates."""

    __tablename__ = "assistant_permissions"
    __table_args__ = (
        UniqueConstraint("link_id", "resource", "action", name="uq_assistant_permissions_link_resource_action"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    link_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teacher_assistant_links.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resource: Mapped[AssistantResource] = mapped_column(
        Enum(
            AssistantResource,
            name="assistant_resource_enum",
            values_callable=lambda resources: [r.value for r in resources],
        ),
        nullable=False,
        index=True,
    )
    action: Mapped[AssistantAction] = mapped_column(
        Enum(
            AssistantAction,
            name="assistant_action_enum",
            values_callable=lambda actions: [a.value for a in actions],
        ),
        nullable=False,
    )
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
