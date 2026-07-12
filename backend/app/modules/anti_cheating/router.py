from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_owns_quiz
from app.core.permissions import require_roles
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_student
from app.modules.anti_cheating import service
from app.modules.anti_cheating.schemas import AntiCheatingEventCreate, AntiCheatingEventRead, AutoSubmitRead
from app.modules.quiz_attempts.service import get_attempt as get_quiz_attempt

router = APIRouter(prefix="/anti-cheating", tags=["anti_cheating"])


@router.post("/events", response_model=AntiCheatingEventRead, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: AntiCheatingEventCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> AntiCheatingEventRead:
    event = await service.create_event(session, payload, current_user.id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    return event


@router.get("/attempts/{attempt_id}/events", response_model=list[AntiCheatingEventRead])
async def list_attempt_events(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = require_roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN, Role.ASSISTANT),
) -> list[AntiCheatingEventRead]:
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        attempt = await get_quiz_attempt(session, attempt_id)
        if attempt is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")
        await assert_owns_quiz(
            session, attempt.quiz_id, current_user, resource=AssistantResource.ANTI_CHEATING, action=AssistantAction.VIEW
        )
    return await service.list_attempt_events(session, attempt_id)


@router.post("/attempts/{attempt_id}/auto-submit", response_model=AutoSubmitRead)
async def auto_submit_attempt(
    attempt_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> AutoSubmitRead:
    result = await service.auto_submit_attempt(session, attempt_id, current_user.id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found")

    event, attempt = result
    return AutoSubmitRead(event=event, attempt=attempt)
