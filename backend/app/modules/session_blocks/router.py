from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import (
    assert_owns_session,
    assert_owns_session_block,
    assert_student_enrolled_in_session,
    assert_student_enrolled_in_session_block,
)
from app.models.user import Role
from app.db.session import get_db_session
from app.models.user import User
from app.modules.assistants.models import AssistantAction
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.session_blocks import service
from app.modules.session_blocks.schemas import SessionBlockCreate, SessionBlockRead

router = APIRouter(prefix="/session-blocks", tags=["session_blocks"])


@router.get("", response_model=list[SessionBlockRead])
async def list_session_blocks(
    session_id: UUID | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[SessionBlockRead]:
    if current_user.role == Role.STUDENT:
        if session_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="session_id is required for student access",
            )
        await assert_student_enrolled_in_session(session, session_id, current_user)
    elif current_user.role in (Role.TEACHER, Role.ASSISTANT) and session_id is not None:
        await assert_owns_session(session, session_id, current_user, action=AssistantAction.VIEW)

    blocks = await service.list_session_blocks(session, session_id)

    if current_user.role in (Role.TEACHER, Role.ASSISTANT) and session_id is None:
        # No session filter — scope the platform-wide list down to blocks
        # under this teacher's own courses (ADMIN/SUPER_ADMIN stay unscoped).
        scoped: list[SessionBlockRead] = []
        for block in blocks:
            try:
                await assert_owns_session_block(session, block.id, current_user, action=AssistantAction.VIEW)
            except HTTPException:
                continue
            scoped.append(block)
        return scoped

    return blocks


@router.get("/{block_id}", response_model=SessionBlockRead)
async def get_session_block(
    block_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> SessionBlockRead:
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_owns_session_block(session, block_id, current_user, action=AssistantAction.VIEW)
    else:
        await assert_student_enrolled_in_session_block(session, block_id, current_user)
    block = await service.get_session_block(session, block_id)
    if block is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session block not found")

    return block


@router.post("", response_model=SessionBlockRead, status_code=status.HTTP_201_CREATED)
async def create_session_block(
    payload: SessionBlockCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> SessionBlockRead:
    await assert_owns_session(session, payload.session_id, current_user, action=AssistantAction.CREATE)
    return await service.create_session_block(session, payload)
