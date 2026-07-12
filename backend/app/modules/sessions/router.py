from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import (
    assert_can,
    assert_owns_session,
    assert_student_enrolled_in_course,
)
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction, AssistantResource
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.sessions import service
from app.modules.sessions.schemas import SessionCreate, SessionRead, SessionUpdate

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionRead])
async def list_sessions(
    course_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[SessionRead]:
    try:
        parsed_id = UUID(course_id)
    except ValueError:
        return []
    await assert_student_enrolled_in_course(session, parsed_id, current_user)
    return await service.list_sessions(
        session,
        course_id=parsed_id,
        published_only=current_user.role == Role.STUDENT,
    )


@router.post("", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> SessionRead:
    await assert_can(session, current_user, payload.course_id, AssistantResource.SESSIONS, AssistantAction.CREATE)
    return await service.create_session(session, payload)


@router.patch("/{session_id}", response_model=SessionRead)
async def update_session(
    session_id: UUID,
    payload: SessionUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> SessionRead:
    await assert_owns_session(session, session_id, current_user)
    db_session = await service.update_session(session, session_id, payload)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return db_session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> None:
    await assert_owns_session(session, session_id, current_user, action=AssistantAction.DELETE)
    deleted = await service.delete_session(session, session_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
