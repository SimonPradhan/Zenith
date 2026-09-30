from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    due_date: datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    due_date: datetime | None = None


class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str | None
    status: str
    due_date: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
