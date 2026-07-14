import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ParentAlertStatus(str, enum.Enum):
    NONE = "none"
    SENT = "sent"
    URGENT = "urgent"


class ParentLinkStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REVOKED = "revoked"
    DENIED = "denied"


class LinkInitiator(str, enum.Enum):
    """Which side started a parent<->student link — the *other* side is
    always the one who must approve it (a parent-submitted code request is
    approved by the student; a student-sent invite is approved by the
    parent)."""

    PARENT_CODE = "parent_code"
    STUDENT_INVITE = "student_invite"


class ParentInviteStatus(str, enum.Enum):
    PENDING = "pending"
    MATCHED = "matched"
    CANCELLED = "cancelled"


class ParentRequestTargetType(str, enum.Enum):
    TEACHER = "teacher"
    PLATFORM = "platform"
    CHILD = "child"


class ParentRequestStatus(str, enum.Enum):
    OPEN = "open"
    REPLIED = "replied"
    CLOSED = "closed"


class ParentContact(Base):
    """A parent/guardian contact record for a student. Deliberately a plain
    contact record (name/phone/email) rather than a linked Parent `User`
    account — most students in this MVP don't have a registered parent
    account, and teachers need to record contact info regardless."""

    __tablename__ = "parent_contacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    relation: Mapped[str] = mapped_column(String(60), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    last_contact_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    alert_status: Mapped[ParentAlertStatus] = mapped_column(
        Enum(
            ParentAlertStatus,
            name="parent_alert_status_enum",
            values_callable=lambda statuses: [s.value for s in statuses],
        ),
        nullable=False,
        default=ParentAlertStatus.NONE,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class ParentStudentLink(Base):
    """A verified link between a PARENT user and a STUDENT user. Either side
    can initiate (see `LinkInitiator`); the *other* side must approve before
    the link becomes ACTIVE. This is the only structural connection between
    a parent account and their child(ren)."""

    __tablename__ = "parent_student_links"
    __table_args__ = (
        UniqueConstraint("parent_id", "student_id", name="uq_parent_student_links_parent_student"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[ParentLinkStatus] = mapped_column(
        Enum(
            ParentLinkStatus,
            name="parent_link_status_enum",
            values_callable=lambda statuses: [s.value for s in statuses],
        ),
        nullable=False,
        default=ParentLinkStatus.PENDING,
        index=True,
    )
    initiated_by: Mapped[LinkInitiator] = mapped_column(
        Enum(
            LinkInitiator,
            name="link_initiator_enum",
            values_callable=lambda initiators: [i.value for i in initiators],
        ),
        nullable=False,
    )
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ParentInvite(Base):
    """A student's outbound invite to a parent's email address. Tracks the
    invite even before a matching parent account exists — resolved into a
    `ParentStudentLink` either immediately (if the email already belongs to
    a PARENT user) or later, when a PARENT user registers with this email
    (see the registration hook in `auth/service.py`)."""

    __tablename__ = "parent_invites"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    invited_email: Mapped[str] = mapped_column(String(320), nullable=False)
    status: Mapped[ParentInviteStatus] = mapped_column(
        Enum(
            ParentInviteStatus,
            name="parent_invite_status_enum",
            values_callable=lambda statuses: [s.value for s in statuses],
        ),
        nullable=False,
        default=ParentInviteStatus.PENDING,
        index=True,
    )
    resolved_link_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("parent_student_links.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ParentRequest(Base):
    """A lightweight one-message request from a parent to a teacher, the
    platform, or their own child — with at most one reply. Not a multi-
    message chat thread by design."""

    __tablename__ = "parent_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target_type: Mapped[ParentRequestTargetType] = mapped_column(
        Enum(
            ParentRequestTargetType,
            name="parent_request_target_type_enum",
            values_callable=lambda types: [t.value for t in types],
        ),
        nullable=False,
        index=True,
    )
    teacher_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    course_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    subject: Mapped[str] = mapped_column(String(220), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ParentRequestStatus] = mapped_column(
        Enum(
            ParentRequestStatus,
            name="parent_request_status_enum",
            values_callable=lambda statuses: [s.value for s in statuses],
        ),
        nullable=False,
        default=ParentRequestStatus.OPEN,
        index=True,
    )
    reply_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    replied_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    replied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
