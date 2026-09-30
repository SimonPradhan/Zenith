from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task


def get_tasks_by_user(
    db: Session,
    user_id: UUID,
) -> list[Task]:
    result = db.scalars(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )

    return list(result.all())


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
