from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identity import EntityType, format_public_code
from app.models.user import User
from app.modules.certificates.models import Certificate
from app.modules.certificates.schemas import CertificateCreate, CertificateRead, CertificateUpdate
from app.modules.courses.models import Course


async def _next_certificate_public_code(session: AsyncSession) -> str:
    result = await session.execute(text("SELECT nextval('seq_certificate_code')"))
    sequence = int(result.scalar_one())
    return format_public_code(EntityType.CERTIFICATE, sequence)


def _to_read(cert: Certificate, student_name: str, course_title: str) -> CertificateRead:
    return CertificateRead(
        id=cert.id,
        public_code=cert.public_code,
        student_id=cert.student_id,
        student_name=student_name,
        course_id=cert.course_id,
        course_title=course_title,
        title=cert.title,
        status=cert.status,
        issued_at=cert.issued_at,
    )


async def list_certificates_for_course(session: AsyncSession, course_id: UUID) -> list[CertificateRead]:
    result = await session.execute(
        select(Certificate, User.full_name, Course.title)
        .join(User, User.id == Certificate.student_id)
        .join(Course, Course.id == Certificate.course_id)
        .where(Certificate.course_id == course_id)
        .order_by(Certificate.issued_at.desc())
    )
    return [_to_read(cert, full_name, course_title) for cert, full_name, course_title in result.all()]


async def ensure_certificate_for_course_completion(
    session: AsyncSession,
    student_id: UUID,
    course_id: UUID,
) -> Certificate | None:
    """Auto-issues a completion certificate the first time a student finishes
    every published session in a course. No-op if a certificate already
    exists for this student+course (including a previously revoked one —
    completion doesn't override a teacher's revocation)."""
    existing = await session.execute(
        select(Certificate.id).where(
            Certificate.student_id == student_id,
            Certificate.course_id == course_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        return None

    course = await session.get(Course, course_id)
    if course is None:
        return None

    public_code = await _next_certificate_public_code(session)
    cert = Certificate(
        public_code=public_code,
        student_id=student_id,
        course_id=course_id,
        title=f"{course.title} Completion",
    )
    session.add(cert)
    await session.commit()
    await session.refresh(cert)
    return cert


async def list_certificates_for_student(session: AsyncSession, student_id: UUID) -> list[CertificateRead]:
    result = await session.execute(
        select(Certificate, User.full_name, Course.title)
        .join(User, User.id == Certificate.student_id)
        .join(Course, Course.id == Certificate.course_id)
        .where(Certificate.student_id == student_id)
        .order_by(Certificate.issued_at.desc())
    )
    return [_to_read(cert, full_name, course_title) for cert, full_name, course_title in result.all()]


async def get_certificate(session: AsyncSession, certificate_id: UUID) -> Certificate | None:
    return await session.get(Certificate, certificate_id)


async def create_certificate(session: AsyncSession, payload: CertificateCreate) -> CertificateRead:
    public_code = await _next_certificate_public_code(session)
    cert = Certificate(
        public_code=public_code,
        student_id=payload.student_id,
        course_id=payload.course_id,
        title=payload.title,
    )
    session.add(cert)
    await session.commit()
    await session.refresh(cert)
    student = await session.get(User, payload.student_id)
    course = await session.get(Course, payload.course_id)
    return _to_read(cert, student.full_name if student else "", course.title if course else "")


async def update_certificate(session: AsyncSession, certificate_id: UUID, payload: CertificateUpdate) -> CertificateRead | None:
    cert = await get_certificate(session, certificate_id)
    if cert is None:
        return None
    if payload.status is not None:
        cert.status = payload.status
    if payload.title is not None:
        cert.title = payload.title
    await session.commit()
    await session.refresh(cert)
    student = await session.get(User, cert.student_id)
    course = await session.get(Course, cert.course_id)
    return _to_read(cert, student.full_name if student else "", course.title if course else "")
