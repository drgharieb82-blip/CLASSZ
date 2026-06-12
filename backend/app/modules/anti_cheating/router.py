from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.anti_cheating import service
from app.modules.anti_cheating.schemas import AntiCheatingEventCreate, AntiCheatingEventRead, AutoSubmitRead

router = APIRouter(prefix="/anti-cheating", tags=["anti_cheating"])


@router.post("/events", response_model=AntiCheatingEventRead, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: AntiCheatingEventCreate,
    session: AsyncSession = Depends(get_db_session),
) -> AntiCheatingEventRead:
    event = await service.create_event(session, payload)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return event


@router.get("/attempts/{attempt_id}/events", response_model=list[AntiCheatingEventRead])
async def list_attempt_events(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[AntiCheatingEventRead]:
    return await service.list_attempt_events(session, attempt_id)


@router.post("/attempts/{attempt_id}/auto-submit", response_model=AutoSubmitRead)
async def auto_submit_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> AutoSubmitRead:
    result = await service.auto_submit_attempt(session, attempt_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    event, attempt = result
    return AutoSubmitRead(event=event, attempt=attempt)
