from datetime import datetime
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.task import Task


def get_tasks_by_user(
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

    query = select(Task).where(
        Task.user_id == user_id,
    )

    count_query = (
        select(func.count())
        .select_from(Task)
        .where(Task.user_id == user_id)
    )

    if status is not None:
        query = query.where(Task.status == status)
        count_query = count_query.where(Task.status == status)

    if search is not None:
        search_pattern = f"%{search}%"

        search_filter = or_(
            Task.title.ilike(search_pattern),
            Task.description.ilike(search_pattern),
        )

        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if due_from is not None:
        query = query.where(Task.due_date >= due_from)
        count_query = count_query.where(Task.due_date >= due_from)

    if due_to is not None:
        query = query.where(Task.due_date <= due_to)
        count_query = count_query.where(Task.due_date <= due_to)

    if order_by_due_date:
        query = query.order_by(
            Task.due_date.asc(),
            Task.created_at.desc(),
        )
    else:
        query = query.order_by(
            Task.created_at.desc(),
        )

    tasks = db.scalars(
        query
        .limit(limit)
        .offset(offset)
    ).all()

    total = db.scalar(count_query)

    return list(tasks), total or 0


def get_task_by_id(
    db: Session,
    task_id: UUID,
    user_id: UUID,
) -> Task | None:
    return db.scalar(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id,
        )
    )


def create_task(
    db: Session,
    task: Task,
) -> Task:
    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def update_task(
    db: Session,
    task: Task,
) -> Task:
    db.commit()
    db.refresh(task)

    return task


def delete_task(
    db: Session,
    task: Task,
) -> None:
    db.delete(task)
    db.commit()
