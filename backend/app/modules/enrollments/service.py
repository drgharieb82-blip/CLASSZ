from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.courses.models import Course
from app.modules.enrollments.models import Enrollment, EnrollmentStatus
from app.modules.finance import service as finance_service
from app.modules.notifications import service as notifications_service
from app.modules.parents import service as parents_service
from app.modules.progress import service as progress_service
from app.modules.wallets.models import TransactionStatus, TransactionType
from app.modules.wallets.schemas import WalletTransactionCreate
from app.modules.wallets.service import stage_transaction


def _enrollment_options():
    return (selectinload(Enrollment.course),)


async def get_course(session: AsyncSession, course_id: UUID) -> Course | None:
    result = await session.execute(select(Course).where(Course.id == course_id))
    return result.scalar_one_or_none()


async def get_published_course(session: AsyncSession, course_id: UUID) -> Course | None:
    result = await session.execute(
        select(Course).where(Course.id == course_id, Course.is_published.is_(True))
    )
    return result.scalar_one_or_none()


async def get_enrollment(
    session: AsyncSession,
    student_id: UUID,
    course_id: UUID,
    *,
    published_only: bool = False,
) -> Enrollment | None:
    query = (
        select(Enrollment)
        .join(Course, Course.id == Enrollment.course_id)
        .where(
            Enrollment.student_id == student_id,
            Enrollment.course_id == course_id,
        )
        .options(*_enrollment_options())
    )
    if published_only:
        query = query.where(Course.is_published.is_(True))
    result = await session.execute(query)
    enrollment = result.scalar_one_or_none()
    if enrollment is not None:
        await _attach_progress(session, student_id, enrollment)
    return enrollment


async def list_student_enrollments(
    session: AsyncSession,
    student_id: UUID,
) -> list[Enrollment]:
    result = await session.execute(
        select(Enrollment)
        .join(Course, Course.id == Enrollment.course_id)
        .where(Enrollment.student_id == student_id)
        .where(Course.is_published.is_(True))
        .options(*_enrollment_options())
        .order_by(Enrollment.enrolled_at.desc())
    )
    enrollments = list(result.scalars().all())
    await _attach_progress(session, student_id, *enrollments)
    return enrollments


async def create_enrollment(
    session: AsyncSession,
    student_id: UUID,
    course_id: UUID,
    *,
    coupon_code: str | None = None,
) -> Enrollment | None:
    course = await get_published_course(session, course_id)
    if course is None:
        return None

    existing = await get_enrollment(session, student_id, course_id, published_only=False)
    if existing is not None:
        return await get_enrollment(session, student_id, course_id, published_only=True)

    price = float(course.price or 0)
    coupon = None
    if price > 0 and coupon_code:
        coupon = await finance_service.get_valid_coupon(session, coupon_code, course_id)
        price = finance_service.apply_coupon_discount(price, coupon)

    if price > 0:
        from app.modules.wallets.service import ensure_wallet

        wallet_row = await ensure_wallet(session, student_id)
        balance = float(wallet_row.balance)
        if balance < price:
            raise ValueError("Insufficient wallet balance")
        # Re-use the wallet state machine to keep the payment path explicit.
        payment_payload = WalletTransactionCreate(
            student_id=student_id,
            course_id=course_id,
            type=TransactionType.PAYMENT,
            amount=price,
            status=TransactionStatus.PAID,
            coupon_code=coupon.code if coupon else None,
            note=f"Course purchase: {course.title}",
        )
        transaction = await stage_transaction(session, payment_payload)
        await finance_service.create_invoice_for_transaction(session, transaction, student_id)
        if coupon is not None:
            await finance_service.redeem_coupon(session, coupon)
    enrollment = Enrollment(
        student_id=student_id,
        course_id=course_id,
        status=EnrollmentStatus.ACTIVE,
    )
    session.add(enrollment)
    await session.commit()

    await notifications_service.create_notification(
        session,
        notifications_service.notify_enrollment_created(student_id, course.title),
    )
    if price > 0:
        await notifications_service.create_notification(
            session,
            notifications_service.notify_wallet_payment(student_id, course.title, price),
        )

    parent_ids = await parents_service.get_active_parent_ids_for_student(session, student_id)
    for parent_id in parent_ids:
        await notifications_service.create_notification(
            session,
            notifications_service.notify_enrollment_created(parent_id, course.title, for_parent=True),
        )
        if price > 0:
            await notifications_service.create_notification(
                session,
                notifications_service.notify_wallet_payment(parent_id, course.title, price, for_parent=True),
            )

    return await get_enrollment(session, student_id, course_id)


async def _attach_progress(session: AsyncSession, student_id: UUID, *enrollments: Enrollment) -> None:
    progress_map = await progress_service.get_student_course_progress_map(session, student_id)
    for enrollment in enrollments:
        if enrollment is None:
            continue
        enrollment.progress = progress_map.get(enrollment.course_id)
