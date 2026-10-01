from datetime import datetime, timedelta, timezone
import hashlib
from uuid import UUID
from app.core.security import verify_password
from sqlalchemy import select

from app.models.user import User
from app.services import auth_service

def test_register(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "register@zenith.dev",
            "name": "Register User",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert UUID(data["id"])
    assert data["email"] == "register@zenith.dev"
    assert data["name"] == "Register User"
    assert "password" not in data
    assert "password_hash" not in data


def test_login(client, db):
    client.post(
        "/auth/register",
        json={
            "email": "login@zenith.dev",
            "name": "Login User",
            "password": "TestPassword123!",
        },
    )

    user = db.scalar(
        select(User).where(
            User.email == "login@zenith.dev"
        )
    )

    assert user is not None

    user.is_email_verified = True
    db.commit()

    response = client.post(
        "/auth/login",
        json={
            "email": "login@zenith.dev",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_me(client, db):
    client.post(
        "/auth/register",
        json={
            "email": "me@zenith.dev",
            "name": "Me User",
            "password": "TestPassword123!",
        },
    )

    user = db.scalar(
        select(User).where(
            User.email == "me@zenith.dev"
        )
    )

    assert user is not None

    user.is_email_verified = True
    db.commit()

    login_response = client.post(
        "/auth/login",
        json={
            "email": "me@zenith.dev",
            "password": "TestPassword123!",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == "me@zenith.dev"

def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@zenith.dev",
        "name": "Duplicate User",
        "password": "TestPassword123!",
    }

    first_response = client.post(
        "/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/auth/register",
        json=payload,
    )

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={
            "email": "wrong-password@zenith.dev",
            "name": "Test User",
            "password": "CorrectPassword123!",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "wrong-password@zenith.dev",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_nonexistent_user(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "does-not-exist@zenith.dev",
            "password": "SomePassword123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_me_without_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_with_invalid_token(client):
    response = client.get(
        "/auth/me",
        headers={
            "Authorization": "Bearer invalid-token",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"

def test_register_with_invalid_email(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "not-an-email",
            "name": "Test User",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 422


def test_register_with_short_password(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "short-password@zenith.dev",
            "name": "Test User",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_register_with_empty_name(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "empty-name@zenith.dev",
            "name": "",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 422


def test_register_with_missing_email(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 422


def test_register_with_missing_password(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "missing-password@zenith.dev",
            "name": "Test User",
        },
    )

    assert response.status_code == 422


def test_login_with_invalid_email(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "not-an-email",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 422


def test_login_with_missing_password(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "test-user@zenith.dev",
        },
    )

    assert response.status_code == 422

def test_verify_email(db):
    user = User(
        email="verify@zenith.dev",
        name="Verify User",
        password_hash="test-hash",
        is_email_verified=False,
        email_verification_token_hash=hashlib.sha256(
            b"valid-token"
        ).hexdigest(),
        email_verification_expires_at=(
            datetime.now(timezone.utc) + timedelta(hours=1)
        ),
    )

    db.add(user)
    db.commit()

    result = auth_service.verify_email(
        db,
        "valid-token",
    )

    assert result is True

    db.refresh(user)

    assert user.is_email_verified is True
    assert user.email_verification_token_hash is None
    assert user.email_verification_expires_at is None


def test_verify_email_invalid_token(db):
    user = User(
        email="invalid-token@zenith.dev",
        name="Invalid Token User",
        password_hash="test-hash",
        is_email_verified=False,
        email_verification_token_hash=hashlib.sha256(
            b"valid-token"
        ).hexdigest(),
        email_verification_expires_at=(
            datetime.now(timezone.utc) + timedelta(hours=1)
        ),
    )

    db.add(user)
    db.commit()

    result = auth_service.verify_email(
        db,
        "wrong-token",
    )

    assert result is False

    db.refresh(user)

    assert user.is_email_verified is False


def test_verify_email_expired_token(db):
    user = User(
        email="expired@zenith.dev",
        name="Expired User",
        password_hash="test-hash",
        is_email_verified=False,
        email_verification_token_hash=hashlib.sha256(
            b"expired-token"
        ).hexdigest(),
        email_verification_expires_at=(
            datetime.now(timezone.utc) - timedelta(hours=1)
        ),
    )

    db.add(user)
    db.commit()

    result = auth_service.verify_email(
        db,
        "expired-token",
    )

    assert result is False

    db.refresh(user)

    assert user.is_email_verified is False

def test_verify_email_endpoint(client, db):
    raw_token = "endpoint-valid-token"

    user = User(
        email="endpoint@zenith.dev",
        name="Endpoint User",
        password_hash="test-hash",
        is_email_verified=False,
        email_verification_token_hash=hashlib.sha256(
            raw_token.encode()
        ).hexdigest(),
        email_verification_expires_at=(
            datetime.now(timezone.utc) + timedelta(hours=1)
        ),
    )

    db.add(user)
    db.commit()

    response = client.get(
        "/auth/verify-email",
        params={"token": raw_token},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Email verified successfully"

    db.refresh(user)

    assert user.is_email_verified is True


def test_verify_email_endpoint_invalid_token(client):
    response = client.get(
        "/auth/verify-email",
        params={"token": "definitely-invalid"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Invalid or expired verification token"
    )

def test_forgot_password_existing_user(client, db, monkeypatch):
    client.post(
        "/auth/register",
        json={
            "email": "forgot@zenith.dev",
            "name": "Forgot User",
            "password": "OldPassword123!",
        },
    )

    sent_url = {}

    def mock_send_email(
        recipient_email,
        recipient_name,
        reset_url,
    ):
        sent_url["url"] = reset_url

    monkeypatch.setattr(
        "app.routers.auth.email_service.send_password_reset_email",
        mock_send_email,
    )

    response = client.post(
        "/auth/forgot-password",
        json={
            "email": "forgot@zenith.dev",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == (
        "If an account exists with that email, "
        "a password reset link has been sent."
    )

    user = db.scalar(
        select(User).where(
            User.email == "forgot@zenith.dev"
        )
    )

    assert user is not None
    assert user.password_reset_token_hash is not None
    assert user.password_reset_expires_at is not None
    assert "token=" in sent_url["url"]


def test_forgot_password_nonexistent_user(client):
    response = client.post(
        "/auth/forgot-password",
        json={
            "email": "unknown@zenith.dev",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == (
        "If an account exists with that email, "
        "a password reset link has been sent."
    )


def test_reset_password_valid_token(client, db):
    raw_token = "valid-reset-token"

    user = User(
        email="reset@zenith.dev",
        name="Reset User",
        password_hash="old-password-hash",
        is_email_verified=True,
        password_reset_token_hash=hashlib.sha256(
            raw_token.encode()
        ).hexdigest(),
        password_reset_expires_at=(
            datetime.now(timezone.utc) + timedelta(hours=1)
        ),
    )

    db.add(user)
    db.commit()

    response = client.post(
        "/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == (
        "Your password has been reset successfully."
    )

    db.refresh(user)

    assert user.password_reset_token_hash is None
    assert user.password_reset_expires_at is None
    assert verify_password(
        "NewPassword123!",
        user.password_hash,
    )


def test_reset_password_invalid_token(client):
    response = client.post(
        "/auth/reset-password",
        json={
            "token": "invalid-reset-token",
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Invalid or expired password reset token."
    )


def test_reset_password_expired_token(client, db):
    raw_token = "expired-reset-token"

    user = User(
        email="expired-reset@zenith.dev",
        name="Expired Reset User",
        password_hash="old-password-hash",
        is_email_verified=True,
        password_reset_token_hash=hashlib.sha256(
            raw_token.encode()
        ).hexdigest(),
        password_reset_expires_at=(
            datetime.now(timezone.utc) - timedelta(hours=1)
        ),
    )

    db.add(user)
    db.commit()

    response = client.post(
        "/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Invalid or expired password reset token."
    )

    db.refresh(user)

    assert user.password_reset_token_hash is not None
    assert user.password_reset_expires_at is not None


def test_reset_password_token_cannot_be_reused(client, db):
    raw_token = "single-use-reset-token"

    user = User(
        email="single-use@zenith.dev",
        name="Single Use User",
        password_hash="old-password-hash",
        is_email_verified=True,
        password_reset_token_hash=hashlib.sha256(
            raw_token.encode()
        ).hexdigest(),
        password_reset_expires_at=(
            datetime.now(timezone.utc) + timedelta(hours=1)
        ),
    )

    db.add(user)
    db.commit()

    first_response = client.post(
        "/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewPassword123!",
        },
    )

    assert first_response.status_code == 200

    second_response = client.post(
        "/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "AnotherPassword123!",
        },
    )

    assert second_response.status_code == 400
    assert second_response.json()["detail"] == (
        "Invalid or expired password reset token."
    )


def test_reset_password_allows_login_with_new_password(client, db):
    client.post(
        "/auth/register",
        json={
            "email": "reset-login@zenith.dev",
            "name": "Reset Login User",
            "password": "OldPassword123!",
        },
    )

    user = db.scalar(
        select(User).where(
            User.email == "reset-login@zenith.dev"
        )
    )

    assert user is not None

    user.is_email_verified = True

    raw_token = "reset-login-token"

    user.password_reset_token_hash = hashlib.sha256(
        raw_token.encode()
    ).hexdigest()

    user.password_reset_expires_at = (
        datetime.now(timezone.utc) + timedelta(hours=1)
    )

    db.commit()

    reset_response = client.post(
        "/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewPassword123!",
        },
    )

    assert reset_response.status_code == 200

    old_password_response = client.post(
        "/auth/login",
        json={
            "email": "reset-login@zenith.dev",
            "password": "OldPassword123!",
        },
    )

    assert old_password_response.status_code == 401

    new_password_response = client.post(
        "/auth/login",
        json={
            "email": "reset-login@zenith.dev",
            "password": "NewPassword123!",
        },
    )

    assert new_password_response.status_code == 200
    assert "access_token" in new_password_response.json()
