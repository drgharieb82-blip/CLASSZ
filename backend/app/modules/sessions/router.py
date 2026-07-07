from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.sessions import service
from app.modules.sessions.schemas import SessionCreate, SessionRead

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionRead])
async def list_sessions(
    course_id: str = Query(...),
    session: AsyncSession = Depends(get_db_session),
) -> list[SessionRead]:
    try:
        parsed_id = UUID(course_id)
    except ValueError:
        return []
    return await service.list_sessions(session, course_id=parsed_id)


@router.post("", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreate,
    session: AsyncSession = Depends(get_db_session),
) -> SessionRead:
    return await service.create_session(session, payload)
