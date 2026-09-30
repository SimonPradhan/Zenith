from uuid import UUID


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


def test_login(client):
    client.post(
        "/auth/register",
        json={
            "email": "login@zenith.dev",
            "name": "Login User",
            "password": "TestPassword123!",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "login@zenith.dev",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_me(client):
    client.post(
        "/auth/register",
        json={
            "email": "me@zenith.dev",
            "name": "Me User",
            "password": "TestPassword123!",
        },
    )

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

    data = response.json()

    assert data["email"] == "me@zenith.dev"
    assert data["name"] == "Me User"

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
