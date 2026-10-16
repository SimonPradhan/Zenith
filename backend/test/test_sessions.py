from sqlalchemy import select

from app.models.refresh_session import RefreshSession
from app.models.user import User


def _create_verified_user(client, db, email="session@zenith.dev"):
    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "name": "Session User",
            "password": "TestPassword123!",
        },
    )
    assert response.status_code == 201
    user = db.scalar(select(User).where(User.email == email))
    assert user is not None
    user.is_email_verified = True
    db.commit()
    return user


def test_login_creates_http_only_refresh_cookie(client, db):
    _create_verified_user(client, db)

    response = client.post(
        "/auth/login",
        json={
            "email": "session@zenith.dev",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200
    assert response.json()["access_token"]
    cookie = response.headers.get("set-cookie", "")
    assert "zenith_refresh_token=" in cookie
    assert "httponly" in cookie.lower()
    assert "max-age=" in cookie.lower()

    session = db.scalar(select(RefreshSession))
    assert session is not None
    assert session.token_hash != client.cookies.get("zenith_refresh_token")


def test_refresh_rotates_cookie_and_access_token(client, db):
    _create_verified_user(client, db, "rotate@zenith.dev")

    login = client.post(
        "/auth/login",
        json={
            "email": "rotate@zenith.dev",
            "password": "TestPassword123!",
        },
    )
    assert login.status_code == 200
    old_cookie = client.cookies.get("zenith_refresh_token")
    old_token = login.json()["access_token"]

    refreshed = client.post("/auth/refresh")

    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"] != old_token
    new_cookie = client.cookies.get("zenith_refresh_token")
    assert new_cookie and new_cookie != old_cookie

    sessions = db.scalars(select(RefreshSession)).all()
    assert len(sessions) == 2
    assert sum(session.revoked_at is not None for session in sessions) == 1


def test_logout_revokes_session_and_clears_cookie(client, db):
    _create_verified_user(client, db, "logout@zenith.dev")

    login = client.post(
        "/auth/login",
        json={
            "email": "logout@zenith.dev",
            "password": "TestPassword123!",
        },
    )
    assert login.status_code == 200

    logout = client.post("/auth/logout")
    assert logout.status_code == 204
    assert "zenith_refresh_token=" in logout.headers.get("set-cookie", "")

    session = db.scalar(select(RefreshSession))
    assert session is not None
    assert session.revoked_at is not None

    refresh = client.post("/auth/refresh")
    assert refresh.status_code == 401
