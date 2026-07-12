from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student
from app.modules.student_portal import service
from app.modules.student_portal.schemas import (
    StudentDashboardSummaryRead,
    StudentProfileRead,
    StudentProfileUpdate,
    StudentSettingsUpdate,
)

router = APIRouter(prefix="/student", tags=["student_portal"])


@router.get("/me/profile", response_model=StudentProfileRead)
async def get_my_profile(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentProfileRead:
    return await service.get_student_profile(session, current_user.id)


@router.patch("/me/profile", response_model=StudentProfileRead)
async def update_my_profile(
    payload: StudentProfileUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentProfileRead:
    try:
        return await service.update_student_profile(session, current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/me/settings", response_model=StudentProfileRead)
async def get_my_settings(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentProfileRead:
    return await service.get_student_profile(session, current_user.id)


@router.patch("/me/settings", response_model=StudentProfileRead)
async def update_my_settings(
    payload: StudentSettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentProfileRead:
    try:
        return await service.update_student_settings(session, current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/me/dashboard", response_model=StudentDashboardSummaryRead)
async def get_my_dashboard_summary(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentDashboardSummaryRead:
    try:
        return await service.get_student_dashboard_summary(session, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
