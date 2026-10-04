from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=255,
    )

    description: str | None = None

    status: TaskStatus = TaskStatus.PENDING

    priority: TaskPriority = TaskPriority.MEDIUM

    start_date: datetime | None = None

    due_date: datetime | None = None

    estimated_minutes: int | None = Field(
        default=None,
        ge=1,
        le=10080,
    )

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date is not None
            and self.due_date is not None
            and self.due_date < self.start_date
        ):
            raise ValueError(
                "Due date cannot be earlier than start date"
            )

        return self


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = None

    status: TaskStatus | None = None

    priority: TaskPriority | None = None

    start_date: datetime | None = None

    due_date: datetime | None = None

    estimated_minutes: int | None = Field(
        default=None,
        ge=1,
        le=10080,
    )

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date is not None
            and self.due_date is not None
            and self.due_date < self.start_date
        ):
            raise ValueError(
                "Due date cannot be earlier than start date"
            )

        return self


class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID

    title: str
    description: str | None

    status: str
    priority: str

    start_date: datetime | None
    due_date: datetime | None

    estimated_minutes: int | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    limit: int
    offset: int
