from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.teacher_dashboard import service
from app.modules.teacher_dashboard.schemas import (
    TeacherDashboardSummary,
    TeacherPendingTasksResponse,
    TeacherRecentActivity,
)

router = APIRouter(prefix="/teacher-dashboard", tags=["teacher_dashboard"])


@router.get("/summary", response_model=TeacherDashboardSummary)
async def get_summary(session: AsyncSession = Depends(get_db_session)) -> TeacherDashboardSummary:
    return await service.get_summary(session)


@router.get("/pending-tasks", response_model=TeacherPendingTasksResponse)
async def get_pending_tasks(session: AsyncSession = Depends(get_db_session)) -> TeacherPendingTasksResponse:
    return await service.get_pending_tasks(session)


@router.get("/recent-activity", response_model=TeacherRecentActivity)
async def get_recent_activity(session: AsyncSession = Depends(get_db_session)) -> TeacherRecentActivity:
    return await service.get_recent_activity(session)
