from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.modules.videos.models import VideoProvider


class VideoBase(BaseModel):
    session_block_id: UUID
    title: str = Field(min_length=1, max_length=200)
    provider: VideoProvider
    provider_video_id: str = Field(min_length=1, max_length=255)
    duration_seconds: int = Field(ge=0)
    thumbnail_url: HttpUrl | None = None

    @field_validator("thumbnail_url")
    @classmethod
    def normalize_thumbnail_url(cls, thumbnail_url: HttpUrl | None) -> str | None:
        if thumbnail_url is None:
            return None

        return str(thumbnail_url)


class VideoCreate(VideoBase):
    pass


class VideoRead(VideoBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    thumbnail_url: str | None = None
    created_at: datetime
