from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.modules.session_blocks.models import BlockType

SUPPORTED_PHASE_TWO_A_BLOCK_TYPES = {
    BlockType.TEXT,
    BlockType.PDF,
    BlockType.IMAGE,
    BlockType.ATTACHMENT,
}


class TextBlockData(BaseModel):
    content: str = ""


class PdfBlockData(BaseModel):
    file_url: str = ""
    title: str = ""


class ImageBlockData(BaseModel):
    image_url: str = ""
    caption: str = ""


class AttachmentBlockData(BaseModel):
    file_url: str = ""
    filename: str = ""


BLOCK_DATA_SCHEMAS: dict[BlockType, type[BaseModel]] = {
    BlockType.TEXT: TextBlockData,
    BlockType.PDF: PdfBlockData,
    BlockType.IMAGE: ImageBlockData,
    BlockType.ATTACHMENT: AttachmentBlockData,
}


class SessionBlockBase(BaseModel):
    session_id: UUID
    block_type: BlockType
    position: int = Field(ge=0)
    data_json: dict[str, Any] = Field(default_factory=dict)

    @field_validator("block_type")
    @classmethod
    def validate_phase_two_a_block_type(cls, block_type: BlockType) -> BlockType:
        if block_type not in SUPPORTED_PHASE_TWO_A_BLOCK_TYPES:
            raise ValueError("VIDEO blocks are reserved for a future phase")

        return block_type

    @model_validator(mode="after")
    def validate_data_json_for_block_type(self) -> "SessionBlockBase":
        data_schema = BLOCK_DATA_SCHEMAS[self.block_type]
        self.data_json = data_schema.model_validate(self.data_json).model_dump()
        return self


class SessionBlockCreate(SessionBlockBase):
    pass


class SessionBlockRead(SessionBlockBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
