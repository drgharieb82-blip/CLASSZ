from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import case, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.modules.notifications.models import Notification, NotificationCategory, NotificationPriority
from app.modules.notifications.schemas import NotificationCreate, NotificationRead, NotificationSummaryRead


async def _next_notification_public_code(session: AsyncSession) -> str:
    result = await session.execute(text("SELECT nextval('seq_notification_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.NOTIFICATION, sequence)


def _to_read(notification: Notification) -> NotificationRead:
    return NotificationRead.model_validate(notification)


async def create_notification(session: AsyncSession, payload: NotificationCreate) -> NotificationRead:
    notification = Notification(
        public_code=await _next_notification_public_code(session),
        user_id=payload.user_id,
        category=payload.category,
        priority=payload.priority,
        title=payload.title,
        body=payload.body,
        action_label=payload.action_label,
        action_url=payload.action_url,
        payload_json=payload.payload_json,
    )
    session.add(notification)
    await session.commit()
    await session.refresh(notification)
    return _to_read(notification)


async def list_notifications(
    session: AsyncSession,
    user_id: UUID,
    *,
    include_archived: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> list[NotificationRead]:
    query = select(Notification).where(Notification.user_id == user_id)
    if not include_archived:
        query = query.where(Notification.is_archived.is_(False))
    result = await session.execute(
        query.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
    )
    return [_to_read(notification) for notification in result.scalars().all()]


async def get_notification_summary(session: AsyncSession, user_id: UUID) -> NotificationSummaryRead:
    counts = await session.execute(
        select(
            func.count(Notification.id),
            func.sum(case((Notification.is_read.is_(False), 1), else_=0)),
            func.sum(case((Notification.priority == NotificationPriority.IMPORTANT, 1), else_=0)),
            func.sum(case((Notification.priority == NotificationPriority.URGENT, 1), else_=0)),
        ).where(Notification.user_id == user_id, Notification.is_archived.is_(False))
    )
    total_count, unread_count, important_count, urgent_count = counts.one()
    return NotificationSummaryRead(
        total_count=int(total_count or 0),
        unread_count=int(unread_count or 0),
        important_count=int(important_count or 0),
        urgent_count=int(urgent_count or 0),
    )


async def mark_notification(session: AsyncSession, user_id: UUID, notification_id: UUID, payload: dict[str, bool]) -> NotificationRead | None:
    result = await session.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
    )
    notification = result.scalar_one_or_none()
    if notification is None:
        return None

    now = datetime.now(UTC)
    if "is_read" in payload and payload["is_read"] != notification.is_read:
        notification.is_read = payload["is_read"]
        notification.read_at = now if payload["is_read"] else None
    if "is_archived" in payload and payload["is_archived"] != notification.is_archived:
        notification.is_archived = payload["is_archived"]
        notification.archived_at = now if payload["is_archived"] else None

    await session.commit()
    await session.refresh(notification)
    return _to_read(notification)


async def mark_all_read(session: AsyncSession, user_id: UUID) -> int:
    result = await session.execute(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
            Notification.is_archived.is_(False),
        )
    )
    items = list(result.scalars().all())
    now = datetime.now(UTC)
    for notification in items:
        notification.is_read = True
        notification.read_at = now
    await session.commit()
    return len(items)


def notify_enrollment_created(user_id: UUID, course_title: str, *, for_parent: bool = False) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.ENROLLMENT,
        priority=NotificationPriority.IMPORTANT,
        title=f"Enrollment confirmed: {course_title}",
        body=(
            f"Your child is now enrolled in {course_title}."
            if for_parent
            else f"You are now enrolled in {course_title}. Your course dashboard has been updated."
        ),
        action_label=None if for_parent else "Open course",
        action_url=None if for_parent else "/student/courses",
        payload_json={"course_title": course_title},
    )


def notify_wallet_recharge(user_id: UUID, amount: float, *, for_parent: bool = False) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.WALLET,
        priority=NotificationPriority.IMPORTANT,
        title="Wallet recharge successful",
        body=(
            f"Your child's wallet has been recharged with ${amount:.2f}."
            if for_parent
            else f"Your wallet has been recharged with ${amount:.2f}."
        ),
        action_label=None if for_parent else "Open wallet",
        action_url=None if for_parent else "/student/wallet",
        payload_json={"amount": amount},
    )


def notify_wallet_payment(
    user_id: UUID, course_title: str, amount: float, *, for_parent: bool = False
) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.WALLET,
        priority=NotificationPriority.NORMAL,
        title=f"Payment recorded for {course_title}",
        body=(
            f"${amount:.2f} was debited from your child's wallet for {course_title}."
            if for_parent
            else f"${amount:.2f} was debited from your wallet for {course_title}."
        ),
        action_label=None if for_parent else "View wallet",
        action_url=None if for_parent else "/student/wallet",
        payload_json={"course_title": course_title, "amount": amount},
    )


def notify_link_requested(user_id: UUID, parent_name: str) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.SYSTEM,
        priority=NotificationPriority.IMPORTANT,
        title="Parent link request",
        body=f"{parent_name} wants to link to your account as a parent/guardian. Review it in Settings.",
        action_label="Review request",
        action_url="/student/settings",
        payload_json={"parent_name": parent_name},
    )


def notify_invite_received(user_id: UUID, student_name: str) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.SYSTEM,
        priority=NotificationPriority.IMPORTANT,
        title="Parent link invitation",
        body=f"{student_name} invited you to link as their parent/guardian. Review it in Link a Child.",
        action_label="Review invitation",
        action_url="/parent/link-child",
        payload_json={"student_name": student_name},
    )


def notify_link_decided(user_id: UUID, other_party_name: str, approved: bool) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.SYSTEM,
        priority=NotificationPriority.IMPORTANT if approved else NotificationPriority.NORMAL,
        title=f"Link request {'approved' if approved else 'denied'}",
        body=f"{other_party_name} {'approved' if approved else 'denied'} your parent link request.",
        action_label="Open dashboard" if approved else None,
        action_url="/parent" if approved else None,
        payload_json={"other_party_name": other_party_name, "approved": approved},
    )


def notify_assistant_invited(user_id: UUID, teacher_name: str) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.SYSTEM,
        priority=NotificationPriority.IMPORTANT,
        title="Assistant invitation",
        body=f"{teacher_name} invited you to be their teaching assistant. Review it in your invitations.",
        action_label="Review invitation",
        action_url="/assistant/invitations",
        payload_json={"teacher_name": teacher_name},
    )


def notify_assistant_link_decided(user_id: UUID, assistant_name: str, accepted: bool) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.SYSTEM,
        priority=NotificationPriority.IMPORTANT if accepted else NotificationPriority.NORMAL,
        title=f"Assistant invitation {'accepted' if accepted else 'declined'}",
        body=f"{assistant_name} {'accepted' if accepted else 'declined'} your assistant invitation.",
        action_label="Manage team" if accepted else None,
        action_url="/teacher/team/members" if accepted else None,
        payload_json={"assistant_name": assistant_name, "accepted": accepted},
    )


def notify_request_created(user_id: UUID, subject: str, *, viewer_url: str | None = None) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.SYSTEM,
        priority=NotificationPriority.NORMAL,
        title="New message request",
        body=f"You have a new request: {subject}",
        action_label="View request" if viewer_url else None,
        action_url=viewer_url,
        payload_json={"subject": subject},
    )


def notify_request_replied(user_id: UUID, subject: str) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        category=NotificationCategory.SYSTEM,
        priority=NotificationPriority.NORMAL,
        title="Reply received",
        body=f"You received a reply to: {subject}",
        action_label="View reply",
        action_url="/parent/messages",
        payload_json={"subject": subject},
    )
