import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
)
from app.models.user import User
from app.models.widget_link_code import WidgetLinkCode
from app.schemas.user import ForgotPasswordRequest, LoginRequest, ResetPasswordRequest, UserCreate, UserResponse, ResendVerificationRequest
from app.services import auth_service, email_service


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


class WidgetLinkExchangeRequest(BaseModel):
    code: str = Field(min_length=20, max_length=200)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("5/minute")
def register(
    request: Request,
    data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = auth_service.get_user_by_email(
        db,
        data.email,
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user, verification_token = auth_service.create_user(
        db,
        data,
    )

    verification_url = (
        f"{settings.frontend_url}/verify-email"
        f"?token={verification_token}"
    )

    email_service.send_verification_email(
        recipient_email=user.email,
        recipient_name=user.name,
        verification_url=verification_url,
    )

    return user


@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    verified = auth_service.verify_email(
        db,
        token,
    )

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    return {"message": "Email verified successfully"}


@router.post("/login")
@limiter.limit("10/minute")
def login(
    request: Request,
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = auth_service.authenticate_user(
        db,
        data.email,
        data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(str(user.id))

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/widget-link-code")
@limiter.limit("10/minute")
def create_widget_link_code(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a short-lived, single-use code to link this signed-in PWA to Android."""
    now = datetime.now(timezone.utc)
    db.execute(delete(WidgetLinkCode).where(WidgetLinkCode.expires_at < now))

    code = secrets.token_urlsafe(32)
    code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()

    db.add(
        WidgetLinkCode(
            token_hash=code_hash,
            user_id=current_user.id,
            expires_at=now + timedelta(minutes=2),
        )
    )
    db.commit()

    return {
        "code": code,
        "expires_in": 120,
        "open_url": f"zenithwidget://link?code={code}",
    }


@router.post("/widget-link-exchange")
@limiter.limit("10/minute")
def exchange_widget_link_code(
    request: Request,
    data: WidgetLinkExchangeRequest,
    db: Session = Depends(get_db),
):
    """Redeem a one-time PWA-issued code and return a device-stored widget token."""
    code_hash = hashlib.sha256(data.code.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)

    record = db.scalar(
        select(WidgetLinkCode)
        .where(
            WidgetLinkCode.token_hash == code_hash,
            WidgetLinkCode.expires_at > now,
        )
        .with_for_update()
    )

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This linking code is invalid or expired. Generate a new code from Zenith Settings.",
        )

    user = db.scalar(select(User).where(User.id == record.user_id))
    if user is None:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The account for this linking code no longer exists.",
        )

    db.delete(record)
    db.commit()

    # Widget tokens last 14 days; the short-lived code itself is single-use.
    access_token = create_access_token(str(user.id), expires_minutes=14 * 24 * 60)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 14 * 24 * 60 * 60,
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/resend-verification")
@limiter.limit("3/minute")
def resend_verification(
    request: Request,
    data: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    user = auth_service.get_user_by_email(db, data.email)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    if user.is_email_verified:
        return {"message": "Your email is already verified."}

    verification_token = auth_service.create_email_verification_token(
        db,
        user,
    )

    verification_url = (
        f"{settings.frontend_url}/verify-email"
        f"?token={verification_token}"
    )

    email_service.send_verification_email(
        recipient_email=user.email,
        recipient_name=user.name,
        verification_url=verification_url,
    )

    return {"message": "A new verification email has been sent."}


@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = auth_service.get_user_by_email(
        db,
        data.email,
    )

    # Always return the same response to avoid revealing registered emails.
    if user is None:
        return {
            "message": "If an account exists with that email, a password reset link has been sent.",
        }

    reset_token = auth_service.create_password_reset_token(
        db,
        user,
    )

    reset_url = (
        f"{settings.frontend_url}/reset-password"
        f"?token={reset_token}"
    )

    email_service.send_password_reset_email(
        recipient_email=user.email,
        recipient_name=user.name,
        reset_url=reset_url,
    )

    return {
        "message": "If an account exists with that email, a password reset link has been sent.",
    }


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    success = auth_service.reset_password(
        db=db,
        token=data.token,
        new_password=data.new_password,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    return {"message": "Your password has been reset successfully."}
