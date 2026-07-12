from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_course, assert_teaches_student
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student, get_current_teacher
from app.modules.certificates import service
from app.modules.certificates.schemas import CertificateCreate, CertificateRead, CertificateUpdate

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get("/me", response_model=list[CertificateRead])
async def list_my_certificates(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> list[CertificateRead]:
    return await service.list_certificates_for_student(session, current_user.id)


@router.get("", response_model=list[CertificateRead])
async def list_certificates(
    course_id: UUID = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> list[CertificateRead]:
    await assert_owns_course(session, course_id, current_user)
    return await service.list_certificates_for_course(session, course_id)


@router.post("", response_model=CertificateRead, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    payload: CertificateCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> CertificateRead:
    await assert_owns_course(session, payload.course_id, current_user)
    await assert_teaches_student(session, payload.student_id, current_user)
    return await service.create_certificate(session, payload)


@router.patch("/{certificate_id}", response_model=CertificateRead)
async def update_certificate(
    certificate_id: UUID,
    payload: CertificateUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> CertificateRead:
    cert = await service.get_certificate(session, certificate_id)
    if cert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    await assert_owns_course(session, cert.course_id, current_user, not_found_detail="Certificate not found")
    updated = await service.update_certificate(session, certificate_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    return updated
