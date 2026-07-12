from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_teacher
from app.modules.teacher_dashboard import service
from app.modules.teacher_dashboard.schemas import (
    TeacherDashboardSummary,
    TeacherPendingTasksResponse,
    TeacherRecentActivity,
)

router = APIRouter(prefix="/teacher-dashboard", tags=["teacher_dashboard"])


@router.get("/summary", response_model=TeacherDashboardSummary)
async def get_summary(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> TeacherDashboardSummary:
    return await service.get_summary(session, current_user.id)


@router.get("/pending-tasks", response_model=TeacherPendingTasksResponse)
async def get_pending_tasks(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> TeacherPendingTasksResponse:
    return await service.get_pending_tasks(session, current_user.id)


@router.get("/recent-activity", response_model=TeacherRecentActivity)
async def get_recent_activity(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> TeacherRecentActivity:
    return await service.get_recent_activity(session, current_user.id)
