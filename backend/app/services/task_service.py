from uuid import UUID
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories import task_repository
from app.schemas.task import TaskCreate, TaskUpdate


def get_tasks(
    db: Session,
    user_id: UUID,
    limit: int,
    offset: int,
    status: str | None = None,
    search: str | None = None,
    due_from: datetime | None = None,
    due_to: datetime | None = None,
    order_by_due_date: bool = False,
) -> tuple[list[Task], int]:
    return task_repository.get_tasks_by_user(
        db,
        user_id,
        limit,
        offset,
        status,
        search,
        due_from,
        due_to,
        order_by_due_date,
    )

def get_task(
    db: Session,
    task_id: UUID,
    user_id: UUID,
) -> Task | None:
    return task_repository.get_task_by_id(
        db,
        task_id,
        user_id,
    )


def create_task(
    db: Session,
    user_id: UUID,
    data: TaskCreate,
) -> Task:
    task = Task(
        user_id=user_id,
        title=data.title,
        description=data.description,
        status=data.status.value,
        priority=data.priority.value,
        start_date=data.start_date,
        due_date=data.due_date,
        estimated_minutes=data.estimated_minutes,
    )

    return task_repository.create_task(
        db,
        task,
    )


def update_task(
    db: Session,
    task: Task,
    data: TaskUpdate,
) -> Task:
    if data.title is not None:
        task.title = data.title

    if data.description is not None:
        task.description = data.description

    if data.status is not None:
        task.status = data.status.value

    if data.priority is not None:
        task.priority = data.priority.value

    if data.start_date is not None:
        task.start_date = data.start_date

    if data.due_date is not None:
        task.due_date = data.due_date

    if data.estimated_minutes is not None:
        task.estimated_minutes = data.estimated_minutes

    return task_repository.update_task(
        db,
        task,
    )


def delete_task(
    db: Session,
    task: Task,
) -> None:
    task_repository.delete_task(
        db,
        task,
    )
