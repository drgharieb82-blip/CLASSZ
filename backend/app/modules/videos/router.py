from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ownership import (
    assert_owns_session_block,
    assert_owns_video,
    assert_student_enrolled_in_video,
)
from app.db.session import get_db_session
from app.models.user import Role, User
from app.modules.assistants.models import AssistantAction
from app.modules.auth.dependencies import get_current_teacher, get_current_user
from app.modules.videos import service
from app.modules.videos.schemas import VideoCreate, VideoRead

router = APIRouter(prefix="/videos", tags=["videos"])


async def _scope_video(session: AsyncSession, video_id: UUID, current_user: User) -> None:
    if current_user.role in (Role.TEACHER, Role.ASSISTANT):
        await assert_owns_video(session, video_id, current_user)
    elif current_user.role == Role.STUDENT:
        await assert_student_enrolled_in_video(session, video_id, current_user)


@router.get("", response_model=list[VideoRead])
async def list_videos(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[VideoRead]:
    videos = await service.list_videos(session)
    scoped: list[VideoRead] = []
    for video in videos:
        try:
            await _scope_video(session, video.id, current_user)
        except HTTPException:
            continue
        scoped.append(video)
    return scoped


@router.get("/{video_id}", response_model=VideoRead)
async def get_video(
    video_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> VideoRead:
    video = await service.get_video(session, video_id)
    if video is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")

    await _scope_video(session, video_id, current_user)
    return video


@router.post("", response_model=VideoRead, status_code=status.HTTP_201_CREATED)
async def create_video(
    payload: VideoCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_teacher),
) -> VideoRead:
    await assert_owns_session_block(session, payload.session_block_id, current_user, action=AssistantAction.CREATE)
    return await service.create_video(session, payload)
