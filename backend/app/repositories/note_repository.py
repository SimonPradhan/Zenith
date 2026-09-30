from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.note import Note


def get_notes_by_user(
    db: Session,
    user_id: UUID,
) -> list[Note]:
    result = db.scalars(
        select(Note)
        .where(Note.user_id == user_id)
        .order_by(Note.created_at.desc())
    )

    return list(result.all())


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
