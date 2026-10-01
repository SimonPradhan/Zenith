from uuid import UUID
from sqlalchemy import select

from app.models.user import User


def register_and_login(
    client,
    db,
    email,
    name="Other User",
):
    password = "TestPassword123!"

    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "name": name,
            "password": password,
        },
    )

    assert response.status_code == 201

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    assert user is not None

    user.is_email_verified = True
    db.commit()

    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    return {
        "Authorization": f"Bearer {response.json()['access_token']}",
    }


def test_create_note(client, auth_headers):
    response = client.post(
        "/notes/",
        json={
            "title": "My first note",
            "content": "This is a test note.",
        },
        headers=auth_headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert UUID(data["id"])
    assert UUID(data["user_id"])
    assert data["title"] == "My first note"
    assert data["content"] == "This is a test note."


def test_get_notes(client, auth_headers):
    client.post(
        "/notes/",
        json={
            "title": "Note One",
            "content": "Content One",
        },
        headers=auth_headers,
    )

    client.post(
        "/notes/",
        json={
            "title": "Note Two",
            "content": "Content Two",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/notes/",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2

    assert data["items"][0]["title"] == "Note Two"
    assert data["items"][1]["title"] == "Note One"

    assert data["total"] == 2
    assert data["limit"] == 10
    assert data["offset"] == 0

def test_get_notes_pagination(client, auth_headers):
    for i in range(5):
        response = client.post(
            "/notes/",
            json={
                "title": f"Note {i}",
                "content": f"Content {i}",
            },
            headers=auth_headers,
        )

        assert response.status_code == 201

    response = client.get(
        "/notes/?limit=2&offset=0",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["limit"] == 2
    assert data["offset"] == 0

    assert data["items"][0]["title"] == "Note 4"
    assert data["items"][1]["title"] == "Note 3"

    response = client.get(
        "/notes/?limit=2&offset=2",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["limit"] == 2
    assert data["offset"] == 2

    assert data["items"][0]["title"] == "Note 2"
    assert data["items"][1]["title"] == "Note 1"

def test_get_note(client, auth_headers):
    create_response = client.post(
        "/notes/",
        json={
            "title": "Specific Note",
            "content": "Specific content",
        },
        headers=auth_headers,
    )

    note_id = create_response.json()["id"]

    response = client.get(
        f"/notes/{note_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == note_id
    assert data["title"] == "Specific Note"
    assert data["content"] == "Specific content"


def test_update_note(client, auth_headers):
    create_response = client.post(
        "/notes/",
        json={
            "title": "Original title",
            "content": "Original content",
        },
        headers=auth_headers,
    )

    note_id = create_response.json()["id"]

    response = client.patch(
        f"/notes/{note_id}",
        json={
            "title": "Updated title",
            "content": "Updated content",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Updated title"
    assert data["content"] == "Updated content"


def test_delete_note(client, auth_headers):
    create_response = client.post(
        "/notes/",
        json={
            "title": "Delete me",
            "content": "This note should be deleted.",
        },
        headers=auth_headers,
    )

    note_id = create_response.json()["id"]

    response = client.delete(
        f"/notes/{note_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    response = client.get(
        f"/notes/{note_id}",
        headers=auth_headers,
    )

    assert response.status_code == 404


def test_user_cannot_read_another_users_note(
    client,
    db,
    auth_headers,
):
    note_response = client.post(
        "/notes/",
        json={
            "title": "Private note",
            "content": "User A private content",
        },
        headers=auth_headers,
    )

    note_id = note_response.json()["id"]

    headers_b = register_and_login(
        client,
        db,
        "other-notes-read@zenith.dev",
    )

    response = client.get(
        f"/notes/{note_id}",
        headers=headers_b,
    )

    assert response.status_code == 404


def test_user_cannot_update_another_users_note(
    client,
    db,
    auth_headers,
):
    note_response = client.post(
        "/notes/",
        json={
            "title": "Original",
            "content": "Original content",
        },
        headers=auth_headers,
    )

    note_id = note_response.json()["id"]

    headers_b = register_and_login(
        client,
        db,
        "other-notes-read@zenith.dev",
    )

    response = client.patch(
        f"/notes/{note_id}",
        json={
            "title": "Hacked title",
        },
        headers=headers_b,
    )

    assert response.status_code == 404


def test_user_cannot_delete_another_users_note(
    client,
    db,
    auth_headers,
):
    note_response = client.post(
        "/notes/",
        json={
            "title": "Protected note",
            "content": "User A content",
        },
        headers=auth_headers,
    )

    note_id = note_response.json()["id"]

    headers_b = register_and_login(
        client,
        db,
        "other-notes-read@zenith.dev",
    )

    response = client.delete(
        f"/notes/{note_id}",
        headers=headers_b,
    )

    assert response.status_code == 404

    response = client.get(
        f"/notes/{note_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Protected note"


def test_get_nonexistent_note(client, auth_headers):
    response = client.get(
        "/notes/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Note not found"


def test_update_nonexistent_note(client, auth_headers):
    response = client.patch(
        "/notes/00000000-0000-0000-0000-000000000000",
        json={
            "title": "Updated",
        },
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Note not found"


def test_delete_nonexistent_note(client, auth_headers):
    response = client.delete(
        "/notes/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Note not found"


def test_create_note_without_authentication(client):
    response = client.post(
        "/notes/",
        json={
            "title": "Unauthorized",
            "content": "This should fail.",
        },
    )

    assert response.status_code == 401


def test_get_notes_without_authentication(client):
    response = client.get("/notes/")

    assert response.status_code == 401

def test_create_note_with_empty_title(client, auth_headers):
    response = client.post(
        "/notes/",
        json={
            "title": "",
            "content": "Valid content",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_create_note_with_empty_content(client, auth_headers):
    response = client.post(
        "/notes/",
        json={
            "title": "Valid title",
            "content": "",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_create_note_with_missing_title(client, auth_headers):
    response = client.post(
        "/notes/",
        json={
            "content": "Valid content",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_create_note_with_missing_content(client, auth_headers):
    response = client.post(
        "/notes/",
        json={
            "title": "Valid title",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_update_note_with_empty_title(client, auth_headers):
    create_response = client.post(
        "/notes/",
        json={
            "title": "Original title",
            "content": "Original content",
        },
        headers=auth_headers,
    )

    note_id = create_response.json()["id"]

    response = client.patch(
        f"/notes/{note_id}",
        json={
            "title": "",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_update_note_with_empty_content(client, auth_headers):
    create_response = client.post(
        "/notes/",
        json={
            "title": "Original title",
            "content": "Original content",
        },
        headers=auth_headers,
    )

    note_id = create_response.json()["id"]

    response = client.patch(
        f"/notes/{note_id}",
        json={
            "content": "",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422

def test_get_notes_invalid_limit_zero(client, auth_headers):
    response = client.get(
        "/notes/?limit=0",
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_get_notes_invalid_limit_too_large(client, auth_headers):
    response = client.get(
        "/notes/?limit=101",
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_get_notes_invalid_negative_offset(client, auth_headers):
    response = client.get(
        "/notes/?offset=-1",
        headers=auth_headers,
    )

    assert response.status_code == 422

def test_get_notes_search_by_title(client, auth_headers):
    client.post(
        "/notes/",
        json={
            "title": "Python Backend",
            "content": "Working on the API",
        },
        headers=auth_headers,
    )

    client.post(
        "/notes/",
        json={
            "title": "Frontend Design",
            "content": "Working on the UI",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/notes/?search=python",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Python Backend"

def test_get_notes_search_by_content(client, auth_headers):
    client.post(
        "/notes/",
        json={
            "title": "Note One",
            "content": "Learning FastAPI today",
        },
        headers=auth_headers,
    )

    client.post(
        "/notes/",
        json={
            "title": "Note Two",
            "content": "Learning React today",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/notes/?search=fastapi",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Note One"

def test_get_notes_search_is_case_insensitive(client, auth_headers):
    client.post(
        "/notes/",
        json={
            "title": "Python Notes",
            "content": "Important backend information",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/notes/?search=PYTHON",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Python Notes"

def test_get_notes_search_and_pagination(client, auth_headers):
    for i in range(5):
        response = client.post(
            "/notes/",
            json={
                "title": f"Backend Note {i}",
                "content": "Backend development",
            },
            headers=auth_headers,
        )

        assert response.status_code == 201

    client.post(
        "/notes/",
        json={
            "title": "Frontend Note",
            "content": "Frontend development",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/notes/?search=backend&limit=2&offset=0",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["limit"] == 2
    assert data["offset"] == 0

    assert data["items"][0]["title"] == "Backend Note 4"
    assert data["items"][1]["title"] == "Backend Note 3"

    response = client.get(
        "/notes/?search=backend&limit=2&offset=2",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["offset"] == 2

    assert data["items"][0]["title"] == "Backend Note 2"
    assert data["items"][1]["title"] == "Backend Note 1"

def test_get_notes_invalid_empty_search(client, auth_headers):
    response = client.get(
        "/notes/?search=",
        headers=auth_headers,
    )

    assert response.status_code == 422
