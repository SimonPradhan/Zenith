import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.refresh_session import RefreshSession


REFRESH_COOKIE_NAME = "zenith_refresh_token"


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def cookie_settings() -> dict:
    secure = settings.refresh_cookie_secure or settings.environment.lower() in {"production", "prod"}
    same_site = settings.refresh_cookie_samesite.lower()
    if same_site not in {"lax", "strict", "none"}:
        same_site = "lax"
    if same_site == "none":
        secure = True

    return {
        "httponly": True,
        "secure": secure,
        "samesite": same_site,
        "path": "/auth",
        "domain": settings.refresh_cookie_domain or None,
    }


def set_refresh_cookie(response: Response, token: str, max_age: int) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        max_age=max_age,
        **cookie_settings(),
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        **cookie_settings(),
    )


def create_refresh_session(db: Session, user_id, response: Response) -> None:
    now = datetime.now(timezone.utc)
    absolute_expiry = now + timedelta(days=settings.refresh_token_absolute_days)
    expiry = min(
        now + timedelta(days=settings.refresh_token_days),
        absolute_expiry,
    )
    token = secrets.token_urlsafe(48)
    session = RefreshSession(
        user_id=user_id,
        token_hash=hash_refresh_token(token),
        expires_at=expiry,
        absolute_expires_at=absolute_expiry,
    )
    db.add(session)
    db.commit()
    set_refresh_cookie(response, token, int((expiry - now).total_seconds()))
