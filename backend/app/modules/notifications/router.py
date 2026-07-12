from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student_or_parent
from app.modules.notifications import service
from app.modules.notifications.schemas import NotificationListRead, NotificationRead, NotificationSummaryRead, NotificationUpdate

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/me", response_model=NotificationListRead)
async def list_my_notifications(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student_or_parent),
) -> NotificationListRead:
    summary = await service.get_notification_summary(session, current_user.id)
    items = await service.list_notifications(session, current_user.id, limit=limit, offset=offset)
    return NotificationListRead(summary=summary, items=items)


@router.get("/me/summary", response_model=NotificationSummaryRead)
async def get_my_notification_summary(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student_or_parent),
) -> NotificationSummaryRead:
    return await service.get_notification_summary(session, current_user.id)


@router.patch("/me/{notification_id}", response_model=NotificationRead)
async def update_my_notification(
    notification_id: UUID,
    payload: NotificationUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student_or_parent),
) -> NotificationRead:
    updated = await service.mark_notification(
        session,
        current_user.id,
        notification_id,
        payload.model_dump(exclude_none=True),
    )
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return updated


@router.post("/me/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student_or_parent),
) -> None:
    await service.mark_all_read(session, current_user.id)
