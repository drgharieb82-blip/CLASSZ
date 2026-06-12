from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import migrations  # noqa: F401
from app.modules.videos.models import Video
from app.modules.videos.schemas import VideoCreate


async def list_videos(session: AsyncSession) -> list[Video]:
    result = await session.execute(select(Video).order_by(Video.created_at.desc()))
    return list(result.scalars().all())


async def get_video(session: AsyncSession, video_id: UUID) -> Video | None:
    result = await session.execute(select(Video).where(Video.id == video_id))
    return result.scalar_one_or_none()


async def create_video(session: AsyncSession, payload: VideoCreate) -> Video:
    video = Video(**payload.model_dump())
    session.add(video)
    await session.commit()
    await session.refresh(video)
    return video
