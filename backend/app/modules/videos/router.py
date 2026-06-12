from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.modules.videos import service
from app.modules.videos.schemas import VideoCreate, VideoRead

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("", response_model=list[VideoRead])
async def list_videos(session: AsyncSession = Depends(get_db_session)) -> list[VideoRead]:
    return await service.list_videos(session)


@router.get("/{video_id}", response_model=VideoRead)
async def get_video(
    video_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> VideoRead:
    video = await service.get_video(session, video_id)
    if video is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")

    return video


@router.post("", response_model=VideoRead, status_code=status.HTTP_201_CREATED)
async def create_video(
    payload: VideoCreate,
    session: AsyncSession = Depends(get_db_session),
) -> VideoRead:
    return await service.create_video(session, payload)
