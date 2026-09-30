from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class NoteResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
