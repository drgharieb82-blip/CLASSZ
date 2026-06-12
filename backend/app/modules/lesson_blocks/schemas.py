from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.modules.lesson_blocks.models import BlockType

SUPPORTED_PHASE_ONE_BLOCK_TYPES = {BlockType.TEXT, BlockType.PDF, BlockType.IMAGE}


class LessonBlockBase(BaseModel):
    lesson_id: UUID
    block_type: BlockType
    position: int = Field(ge=0)
    data_json: dict[str, Any] = Field(default_factory=dict)

    @field_validator("block_type")
    @classmethod
    def validate_phase_one_block_type(cls, block_type: BlockType) -> BlockType:
        if block_type not in SUPPORTED_PHASE_ONE_BLOCK_TYPES:
            raise ValueError("VIDEO and ATTACHMENT blocks are reserved for future phases")

        return block_type


class LessonBlockCreate(LessonBlockBase):
    pass


class LessonBlockRead(LessonBlockBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
