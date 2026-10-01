from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    return db.scalar(
        select(User).where(User.email == email)
    )


def create_user(
    db: Session,
    data: UserCreate,
) -> tuple[User, str]:
    verification_token = secrets.token_urlsafe(32)

    verification_token_hash = hashlib.sha256(
        verification_token.encode()
    ).hexdigest()

    verification_expires_at = (
        datetime.now(timezone.utc) + timedelta(hours=24)
    )

    user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        is_email_verified=False,
        email_verification_token_hash=verification_token_hash,
        email_verification_expires_at=verification_expires_at,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user, verification_token

def verify_email(
    db: Session,
    token: str,
) -> bool:
    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    user = db.scalar(
        select(User).where(
            User.email_verification_token_hash == token_hash
        )
    )

    if user is None:
        return False

    if (
        user.email_verification_expires_at is None
        or user.email_verification_expires_at < datetime.now(timezone.utc)
    ):
        return False

    user.is_email_verified = True
    user.email_verification_token_hash = None
    user.email_verification_expires_at = None

    db.commit()

    return True

def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(
        db,
        email,
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    if not user.is_email_verified:
        return None

    return user

def create_email_verification_token(
    db: Session,
    user: User,
) -> str:
    verification_token = secrets.token_urlsafe(32)

    verification_token_hash = hashlib.sha256(
        verification_token.encode()
    ).hexdigest()

    verification_expires_at = (
        datetime.now(timezone.utc) + timedelta(hours=24)
    )

    user.email_verification_token_hash = verification_token_hash
    user.email_verification_expires_at = verification_expires_at

    db.commit()
    db.refresh(user)

    return verification_token

def create_password_reset_token(
    db: Session,
    user: User,
) -> str:
    reset_token = secrets.token_urlsafe(32)

    reset_token_hash = hashlib.sha256(
        reset_token.encode()
    ).hexdigest()

    reset_expires_at = (
        datetime.now(timezone.utc) + timedelta(hours=1)
    )

    user.password_reset_token_hash = reset_token_hash
    user.password_reset_expires_at = reset_expires_at

    db.commit()
    db.refresh(user)

    return reset_token

def reset_password(
    db: Session,
    token: str,
    new_password: str,
) -> bool:
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    user = db.scalar(
        select(User).where(
            User.password_reset_token_hash == token_hash
        )
    )

    if user is None:
        return False

    if (
        user.password_reset_expires_at is None
        or user.password_reset_expires_at < datetime.now(timezone.utc)
    ):
        return False

    user.password_hash = hash_password(new_password)

    # Invalidate the reset token immediately after successful use.
    user.password_reset_token_hash = None
    user.password_reset_expires_at = None

    db.commit()
    db.refresh(user)

    return True
