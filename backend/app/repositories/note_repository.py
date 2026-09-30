from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.note import Note

def get_notes_by_user(
    db: Session,
    user_id: UUID,
    limit: int,
    offset: int,
    search: str | None = None,
) -> tuple[list[Note], int]:

    query = select(Note).where(
        Note.user_id == user_id,
    )

    count_query = (
        select(func.count())
        .select_from(Note)
        .where(Note.user_id == user_id)
    )

    if search is not None:
        search_pattern = f"%{search}%"

        search_filter = or_(
            Note.title.ilike(search_pattern),
            Note.content.ilike(search_pattern),
        )

        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    notes = db.scalars(
        query
        .order_by(Note.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    total = db.scalar(count_query)

    return list(notes), total or 0


def get_note_by_id(
    db: Session,
    note_id: UUID,
    user_id: UUID,
) -> Note | None:
    return db.scalar(
        select(Note).where(
            Note.id == note_id,
            Note.user_id == user_id,
        )
    )


def create_note(
    db: Session,
    note: Note,
) -> Note:
    db.add(note)
    db.commit()
    db.refresh(note)

    return note


def delete_note(
    db: Session,
    note: Note,
) -> None:
    db.delete(note)
    db.commit()


def update_note(
    db: Session,
    note: Note,
) -> Note:
    db.commit()
    db.refresh(note)

    return note
