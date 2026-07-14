from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.modules.certificates import service as certificates_service
from app.modules.notifications import service as notifications_service
from app.modules.progress import service as progress_service
from app.modules.student_portal.models import StudentProfile
from app.modules.student_portal.schemas import (
    StudentDashboardSummaryRead,
    StudentProfileRead,
    StudentProfileUpdate,
    StudentSettingsUpdate,
)
from app.modules.wallets import service as wallets_service


async def ensure_student_profile(session: AsyncSession, student_id: UUID) -> StudentProfile:
    result = await session.execute(select(StudentProfile).where(StudentProfile.student_id == student_id))
    profile = result.scalar_one_or_none()
    if profile is not None:
        return profile
    profile = StudentProfile(student_id=student_id)
    session.add(profile)
    await session.flush()
    return profile


async def get_student_profile(session: AsyncSession, student_id: UUID) -> StudentProfileRead:
    profile = await ensure_student_profile(session, student_id)
    user = await session.get(User, student_id)
    return _to_profile_read(user, profile)


async def update_student_profile(
    session: AsyncSession,
    student_id: UUID,
    payload: StudentProfileUpdate,
) -> StudentProfileRead:
    profile = await ensure_student_profile(session, student_id)
    user = await session.get(User, student_id)
    if user is None:
        raise ValueError("Student not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.headline is not None:
        profile.headline = payload.headline
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.avatar_url is not None:
        profile.avatar_url = payload.avatar_url

    await session.commit()
    await session.refresh(profile)
    await session.refresh(user)
    return _to_profile_read(user, profile)


async def update_student_settings(
    session: AsyncSession,
    student_id: UUID,
    payload: StudentSettingsUpdate,
) -> StudentProfileRead:
    profile = await ensure_student_profile(session, student_id)
    user = await session.get(User, student_id)
    if user is None:
        raise ValueError("Student not found")

    for field_name in payload.model_fields_set:
        value = getattr(payload, field_name)
        setattr(profile, field_name, value)

    await session.commit()
    await session.refresh(profile)
    await session.refresh(user)
    return _to_profile_read(user, profile)


async def get_student_dashboard_summary(session: AsyncSession, student_id: UUID) -> StudentDashboardSummaryRead:
    profile = await ensure_student_profile(session, student_id)
    user = await session.get(User, student_id)
    if user is None:
        raise ValueError("Student not found")

    progress = await progress_service.get_student_progress_summary(session, student_id)
    wallet_balance = await wallets_service.get_wallet_balance(session, student_id)
    notifications_summary = await notifications_service.get_notification_summary(session, student_id)
    recent_notifications = await notifications_service.list_notifications(session, student_id, limit=5)
    recent_certificates = await certificates_service.list_certificates_for_student(session, student_id)

    featured_courses = sorted(
        progress.courses,
        key=lambda course: (course.progress_percent, course.sessions_completed, course.total_time_minutes),
        reverse=True,
    )[:4]

    return StudentDashboardSummaryRead(
        student_id=student_id,
        full_name=user.full_name,
        headline=profile.headline,
        avatar_url=profile.avatar_url,
        wallet_balance=wallet_balance,
        notifications=notifications_summary,
        progress=progress,
        featured_courses=featured_courses,
        recent_notifications=recent_notifications,
        recent_certificates=recent_certificates[:4],
    )


def _to_profile_read(user: User | None, profile: StudentProfile) -> StudentProfileRead:
    return StudentProfileRead(
        student_id=profile.student_id,
        full_name=user.full_name if user else "",
        email=user.email if user else "",
        public_code=user.public_code if user else "",
        headline=profile.headline,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        timezone=profile.timezone,
        language=profile.language,
        theme=profile.theme,
        notifications_enabled=profile.notifications_enabled,
        email_notifications=profile.email_notifications,
        push_notifications=profile.push_notifications,
        weekly_digest_enabled=profile.weekly_digest_enabled,
        study_reminder_enabled=profile.study_reminder_enabled,
        study_goal_minutes=profile.study_goal_minutes,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )
