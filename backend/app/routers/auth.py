from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
)
from app.models.user import User
from app.schemas.user import ForgotPasswordRequest, LoginRequest, ResetPasswordRequest, UserCreate, UserResponse, ResendVerificationRequest
from app.services import auth_service, email_service


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


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

    return {
        "message": "Email verified successfully",
    }

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

    access_token = create_access_token(
        str(user.id),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
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
        return {
            "message": "Your email is already verified.",
        }

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

    return {
        "message": "A new verification email has been sent.",
    }

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

    # Always return the same response.
    # This prevents revealing whether an email is registered.
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

    return {
        "message": "Your password has been reset successfully.",
    }
