import os

os.environ["ENV_FILE"] = ".env.test"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app


test_engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
)

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

@pytest.fixture
def test_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "test-user@zenith.dev",
            "name": "Test User",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 201

    return response.json()


@pytest.fixture
def auth_headers(client, test_user):
    response = client.post(
        "/auth/login",
        json={
            "email": "test-user@zenith.dev",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }

@pytest.fixture(autouse=True)
def clean_database():
    yield

    with test_engine.begin() as connection:
        connection.execute(
            text("TRUNCATE TABLE tasks, notes, users RESTART IDENTITY CASCADE")
        )
