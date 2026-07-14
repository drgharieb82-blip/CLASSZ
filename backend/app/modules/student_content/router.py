from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import assert_student_enrolled_in_session
from app.db.session import get_db_session
from app.models.user import User
from app.modules.auth.dependencies import get_current_student
from app.modules.student_content.schemas import StudentSessionDetailRead
from app.modules.student_content.service import get_student_session_detail

router = APIRouter(prefix="/student", tags=["student_content"])


@router.get("/session-detail/{session_id}", response_model=StudentSessionDetailRead)
async def get_session_detail(
    session_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_student),
) -> StudentSessionDetailRead:
    await assert_student_enrolled_in_session(session, session_id, current_user)
    detail = await get_student_session_detail(session, session_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return detail
