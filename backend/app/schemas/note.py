from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NoteColor(str, Enum):
    YELLOW = "yellow"
    PURPLE = "purple"
    BLUE = "blue"
    GREEN = "green"
    PINK = "pink"


# Board coordinates are in CSS pixels on a fixed-size canvas.
BOARD_MAX = 10_000


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    color: NoteColor = NoteColor.YELLOW
    pos_x: int | None = Field(default=None, ge=0, le=BOARD_MAX)
    pos_y: int | None = Field(default=None, ge=0, le=BOARD_MAX)
    rotation: float = Field(default=0.0, ge=-45, le=45)
    z_index: int = Field(default=0, ge=0, le=1_000_000)


class NoteUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    content: str | None = Field(
        default=None,
        min_length=1,
    )
    color: NoteColor | None = None
    pos_x: int | None = Field(default=None, ge=0, le=BOARD_MAX)
    pos_y: int | None = Field(default=None, ge=0, le=BOARD_MAX)
    rotation: float | None = Field(default=None, ge=-45, le=45)
    z_index: int | None = Field(default=None, ge=0, le=1_000_000)


class NoteResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    content: str
    color: str
    pos_x: int | None
    pos_y: int | None
    rotation: float
    z_index: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteListResponse(BaseModel):
    items: list[NoteResponse]
    total: int
    limit: int
    offset: int
