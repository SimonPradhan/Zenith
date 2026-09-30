from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.note import NoteCreate, NoteListResponse, NoteResponse, NoteUpdate
from app.services import note_service


router = APIRouter(
    prefix="/notes",
    tags=["Notes"],
)


@router.get(
    "/",
    response_model=NoteListResponse,
)
def get_notes(
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    search: str | None = Query(
        default=None,
        min_length=1,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notes, total = note_service.get_notes(
        db,
        current_user.id,
        limit,
        offset,
        search,
    )

    return {
        "items": notes,
        "total": total,
        "limit": limit,
        "offset": offset,
    }

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = note_service.get_note(
        db,
        note_id,
        current_user.id,
    )

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return note


@router.post(
    "/",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return note_service.create_note(
        db,
        current_user.id,
        data,
    )


@router.patch(
    "/{note_id}",
    response_model=NoteResponse,
)
def update_note(
    note_id: UUID,
    data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = note_service.get_note(
        db,
        note_id,
        current_user.id,
    )

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return note_service.update_note(
        db,
        note,
        data,
    )


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = note_service.get_note(
        db,
        note_id,
        current_user.id,
    )

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    note_service.delete_note(
        db,
        note,
    )
