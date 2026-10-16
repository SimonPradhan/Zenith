from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.sessions import (
    REFRESH_COOKIE_NAME,
    clear_refresh_cookie,
    create_refresh_session,
    hash_refresh_token,
    set_refresh_cookie,
)
from app.models.refresh_session import RefreshSession
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


def _verify_browser_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") != settings.frontend_url.rstrip("/"):
        # Permit the known local development origins when running locally.
        local_origins = {"http://localhost:3000", "http://127.0.0.1:3000"}
        if not (
            settings.environment.lower() in {"development", "dev"}
            and origin in local_origins
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid request origin",
            )


@router.post("/refresh")
def refresh_session(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    _verify_browser_origin(request)
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw_token:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )

    now = datetime.now(timezone.utc)
    session = db.scalar(
        select(RefreshSession)
        .where(RefreshSession.token_hash == hash_refresh_token(raw_token))
        .with_for_update()
    )

    if (
        session is None
        or session.revoked_at is not None
        or session.expires_at <= now
        or session.absolute_expires_at <= now
    ):
        if session is not None and session.revoked_at is None:
            session.revoked_at = now
            db.commit()
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )

    user = db.scalar(select(User).where(User.id == session.user_id))
    if user is None:
        session.revoked_at = now
        db.commit()
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account no longer exists.",
        )

    # Rotate on every successful refresh. Reusing the old token will fail.
    session.revoked_at = now
    db.flush()
    absolute_expiry = session.absolute_expires_at
    new_token = __import__("secrets").token_urlsafe(48)
    new_expiry = min(
        now + timedelta(days=settings.refresh_token_days),
        absolute_expiry,
    )
    replacement = RefreshSession(
        user_id=session.user_id,
        token_hash=hash_refresh_token(new_token),
        expires_at=new_expiry,
        absolute_expires_at=absolute_expiry,
    )
    db.add(replacement)
    db.commit()

    set_refresh_cookie(
        response,
        new_token,
        int((new_expiry - now).total_seconds()),
    )
    return {
        "access_token": create_access_token(str(user.id)),
        "token_type": "bearer",
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    _verify_browser_origin(request)
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_token:
        session = db.scalar(
            select(RefreshSession).where(
                RefreshSession.token_hash == hash_refresh_token(raw_token),
                RefreshSession.revoked_at.is_(None),
            )
        )
        if session is not None:
            session.revoked_at = datetime.now(timezone.utc)
            db.commit()

    clear_refresh_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
