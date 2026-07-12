from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student
from app.modules.enrollments import service
from app.modules.enrollments.schemas import (
    EnrollmentCreate,
    EnrollmentListResponse,
    EnrollmentRead,
    EnrollmentStatusRead,
)

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.get("/me", response_model=EnrollmentListResponse)
async def list_my_enrollments(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> EnrollmentListResponse:
    items = await service.list_student_enrollments(session, current_user.id)
    return EnrollmentListResponse(items=items)


@router.get("/me/{course_id}", response_model=EnrollmentStatusRead)
async def get_my_enrollment_status(
    course_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> EnrollmentStatusRead:
    enrollment = await service.get_enrollment(
        session,
        current_user.id,
        course_id,
        published_only=True,
    )
    return EnrollmentStatusRead(enrolled=enrollment is not None, enrollment=enrollment)


@router.post("", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def enroll_in_course(
    payload: EnrollmentCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> EnrollmentRead:
    try:
        enrollment = await service.create_enrollment(
            session, current_user.id, payload.course_id, coupon_code=payload.coupon_code
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(exc))
    if enrollment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return enrollment
