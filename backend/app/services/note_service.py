from uuid import UUID

from sqlalchemy.orm import Session

from app.models.note import Note
from app.repositories import note_repository
from app.schemas.note import NoteCreate, NoteUpdate


def get_notes(
    db: Session,
    user_id: UUID,
    limit: int,
    offset: int,
    search: str | None = None,
) -> tuple[list[Note], int]:
    return note_repository.get_notes_by_user(
        db,
        user_id,
        limit,
        offset,
        search,
    )


def get_note(
    db: Session,
    note_id: UUID,
    user_id: UUID,
) -> Note | None:
    return note_repository.get_note_by_id(
        db,
        note_id,
        user_id,
    )


def create_note(
    db: Session,
    user_id: UUID,
    data: NoteCreate,
) -> Note:
    note = Note(
        user_id=user_id,
        title=data.title,
        content=data.content,
        color=data.color,
    )
    return note_repository.create_note(
        db,
        note,
    )


def update_note(
    db: Session,
    note: Note,
    data: NoteUpdate,
) -> Note:
    if data.title is not None:
        note.title = data.title

    if data.content is not None:
        note.content = data.content

    if data.color is not None:
        note.color = data.color

    return note_repository.update_note(
        db,
        note,
    )


def delete_note(
    db: Session,
    note: Note,
) -> None:
    note_repository.delete_note(
        db,
        note,
    )
