from uuid import UUID


def register_and_login(client, email, name="Other User"):
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

    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


# ============================================================
# CREATE
# ============================================================


def test_create_task(client, auth_headers):
    response = client.post(
        "/tasks/",
        json={
            "title": "Complete backend",
            "description": "Finish the Zenith API",
            "due_date": "2026-10-15T18:00:00Z",
        },
        headers=auth_headers,
    )

    assert response.status_code == 201

    data = response.json()

    assert UUID(data["id"])
    assert UUID(data["user_id"])
    assert data["title"] == "Complete backend"
    assert data["description"] == "Finish the Zenith API"
    assert data["status"] == "pending"
    assert data["due_date"] is not None


# ============================================================
# GET TASKS
# ============================================================


def test_get_tasks(client, auth_headers):
    client.post(
        "/tasks/",
        json={
            "title": "Task One",
            "description": "First task",
        },
        headers=auth_headers,
    )

    client.post(
        "/tasks/",
        json={
            "title": "Task Two",
            "description": "Second task",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/tasks/",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2

    assert data["items"][0]["title"] == "Task Two"
    assert data["items"][1]["title"] == "Task One"

    assert data["total"] == 2
    assert data["limit"] == 10
    assert data["offset"] == 0


def test_get_tasks_pagination(client, auth_headers):
    for i in range(5):
        response = client.post(
            "/tasks/",
            json={
                "title": f"Task {i}",
                "description": f"Description {i}",
            },
            headers=auth_headers,
        )

        assert response.status_code == 201

    # First page
    response = client.get(
        "/tasks/?limit=2&offset=0",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["limit"] == 2
    assert data["offset"] == 0

    assert data["items"][0]["title"] == "Task 4"
    assert data["items"][1]["title"] == "Task 3"

    # Second page
    response = client.get(
        "/tasks/?limit=2&offset=2",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2
    assert data["total"] == 5
    assert data["limit"] == 2
    assert data["offset"] == 2

    assert data["items"][0]["title"] == "Task 2"
    assert data["items"][1]["title"] == "Task 1"


def test_get_tasks_invalid_limit_zero(client, auth_headers):
    response = client.get(
        "/tasks/?limit=0",
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_get_tasks_invalid_limit_too_large(client, auth_headers):
    response = client.get(
        "/tasks/?limit=101",
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_get_tasks_invalid_negative_offset(client, auth_headers):
    response = client.get(
        "/tasks/?offset=-1",
        headers=auth_headers,
    )

    assert response.status_code == 422


# ============================================================
# GET SINGLE TASK
# ============================================================


def test_get_task(client, auth_headers):
    create_response = client.post(
        "/tasks/",
        json={
            "title": "Specific Task",
            "description": "Specific description",
        },
        headers=auth_headers,
    )

    task_id = create_response.json()["id"]

    response = client.get(
        f"/tasks/{task_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == task_id
    assert data["title"] == "Specific Task"
    assert data["description"] == "Specific description"
    assert data["status"] == "pending"


# ============================================================
# UPDATE
# ============================================================


def test_update_task(client, auth_headers):
    create_response = client.post(
        "/tasks/",
        json={
            "title": "Original task",
            "description": "Original description",
        },
        headers=auth_headers,
    )

    task_id = create_response.json()["id"]

    response = client.patch(
        f"/tasks/{task_id}",
        json={
            "title": "Updated task",
            "description": "Updated description",
            "status": "completed",
            "due_date": "2026-10-20T12:00:00Z",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Updated task"
    assert data["description"] == "Updated description"
    assert data["status"] == "completed"
    assert data["due_date"] is not None


# ============================================================
# DELETE
# ============================================================


def test_delete_task(client, auth_headers):
    create_response = client.post(
        "/tasks/",
        json={
            "title": "Delete me",
            "description": "This task should be deleted.",
        },
        headers=auth_headers,
    )

    task_id = create_response.json()["id"]

    response = client.delete(
        f"/tasks/{task_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    response = client.get(
        f"/tasks/{task_id}",
        headers=auth_headers,
    )

    assert response.status_code == 404


# ============================================================
# USER ISOLATION
# ============================================================


def test_user_cannot_read_another_users_task(
    client,
    auth_headers,
):
    task_response = client.post(
        "/tasks/",
        json={
            "title": "Private task",
            "description": "User A private task",
        },
        headers=auth_headers,
    )

    task_id = task_response.json()["id"]

    headers_b = register_and_login(
        client,
        "other-task-read@zenith.dev",
    )

    response = client.get(
        f"/tasks/{task_id}",
        headers=headers_b,
    )

    assert response.status_code == 404


def test_user_cannot_update_another_users_task(
    client,
    auth_headers,
):
    task_response = client.post(
        "/tasks/",
        json={
            "title": "Original task",
            "description": "Original description",
        },
        headers=auth_headers,
    )

    task_id = task_response.json()["id"]

    headers_b = register_and_login(
        client,
        "other-task-update@zenith.dev",
    )

    response = client.patch(
        f"/tasks/{task_id}",
        json={
            "title": "Hacked task",
            "status": "completed",
        },
        headers=headers_b,
    )

    assert response.status_code == 404


def test_user_cannot_delete_another_users_task(
    client,
    auth_headers,
):
    task_response = client.post(
        "/tasks/",
        json={
            "title": "Protected task",
            "description": "User A task",
        },
        headers=auth_headers,
    )

    task_id = task_response.json()["id"]

    headers_b = register_and_login(
        client,
        "other-task-delete@zenith.dev",
    )

    response = client.delete(
        f"/tasks/{task_id}",
        headers=headers_b,
    )

    assert response.status_code == 404

    response = client.get(
        f"/tasks/{task_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Protected task"


# ============================================================
# NOT FOUND
# ============================================================


def test_get_nonexistent_task(client, auth_headers):
    response = client.get(
        "/tasks/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_update_nonexistent_task(client, auth_headers):
    response = client.patch(
        "/tasks/00000000-0000-0000-0000-000000000000",
        json={
            "title": "Updated task",
        },
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_delete_nonexistent_task(client, auth_headers):
    response = client.delete(
        "/tasks/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


# ============================================================
# AUTHENTICATION
# ============================================================


def test_create_task_without_authentication(client):
    response = client.post(
        "/tasks/",
        json={
            "title": "Unauthorized task",
            "description": "This should fail.",
        },
    )

    assert response.status_code == 401


def test_get_tasks_without_authentication(client):
    response = client.get("/tasks/")

    assert response.status_code == 401


# ============================================================
# VALIDATION
# ============================================================


def test_create_task_with_empty_title(client, auth_headers):
    response = client.post(
        "/tasks/",
        json={
            "title": "",
            "description": "Valid description",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_create_task_with_missing_title(client, auth_headers):
    response = client.post(
        "/tasks/",
        json={
            "description": "Valid description",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_create_task_with_invalid_due_date(client, auth_headers):
    response = client.post(
        "/tasks/",
        json={
            "title": "Valid task",
            "description": "Valid description",
            "due_date": "not-a-date",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_update_task_with_empty_title(client, auth_headers):
    create_response = client.post(
        "/tasks/",
        json={
            "title": "Original task",
            "description": "Original description",
        },
        headers=auth_headers,
    )

    task_id = create_response.json()["id"]

    response = client.patch(
        f"/tasks/{task_id}",
        json={
            "title": "",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_update_task_with_invalid_status(client, auth_headers):
    create_response = client.post(
        "/tasks/",
        json={
            "title": "Original task",
            "description": "Original description",
        },
        headers=auth_headers,
    )

    task_id = create_response.json()["id"]

    response = client.patch(
        f"/tasks/{task_id}",
        json={
            "status": "invalid-status",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_update_task_with_invalid_due_date(client, auth_headers):
    create_response = client.post(
        "/tasks/",
        json={
            "title": "Original task",
            "description": "Original description",
        },
        headers=auth_headers,
    )

    task_id = create_response.json()["id"]

    response = client.patch(
        f"/tasks/{task_id}",
        json={
            "due_date": "not-a-date",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422

def test_get_tasks_filter_by_status_pending(client, auth_headers):
    client.post(
        "/tasks/",
        json={
            "title": "Pending Task",
        },
        headers=auth_headers,
    )

    create_response = client.post(
        "/tasks/",
        json={
            "title": "Completed Task",
        },
        headers=auth_headers,
    )

    task_id = create_response.json()["id"]

    response = client.patch(
        f"/tasks/{task_id}",
        json={
            "status": "completed",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    response = client.get(
        "/tasks/?status=pending",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Pending Task"

def test_get_tasks_filter_by_status_completed(client, auth_headers):
        create_response = client.post(
            "/tasks/",
            json={
                "title": "Complete Me",
            },
            headers=auth_headers,
        )

        task_id = create_response.json()["id"]

        response = client.patch(
            f"/tasks/{task_id}",
            json={
                "status": "completed",
            },
            headers=auth_headers,
        )

        assert response.status_code == 200

        client.post(
            "/tasks/",
            json={
                "title": "Still Pending",
            },
            headers=auth_headers,
        )

        response = client.get(
            "/tasks/?status=completed",
            headers=auth_headers,
        )

        assert response.status_code == 200

        data = response.json()

        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["title"] == "Complete Me"

def test_get_tasks_search_by_title(client, auth_headers):
            client.post(
                "/tasks/",
                json={
                    "title": "Complete backend API",
                    "description": "Zenith backend work",
                },
                headers=auth_headers,
            )

            client.post(
                "/tasks/",
                json={
                    "title": "Design homepage",
                    "description": "Frontend work",
                },
                headers=auth_headers,
            )

            response = client.get(
                "/tasks/?search=backend",
                headers=auth_headers,
            )

            assert response.status_code == 200

            data = response.json()

            assert data["total"] == 1
            assert len(data["items"]) == 1
            assert data["items"][0]["title"] == "Complete backend API"

def test_get_tasks_search_by_description(client, auth_headers):
    client.post(
        "/tasks/",
        json={
            "title": "Task One",
            "description": "Learn FastAPI",
        },
        headers=auth_headers,
    )

    client.post(
        "/tasks/",
        json={
            "title": "Task Two",
            "description": "Learn React",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/tasks/?search=fastapi",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Task One"

def test_get_tasks_filter_and_pagination(client, auth_headers):
    for i in range(5):
        response = client.post(
            "/tasks/",
            json={
                "title": f"Backend Task {i}",
                "description": "Backend development",
            },
            headers=auth_headers,
        )

        assert response.status_code == 201

    client.post(
        "/tasks/",
        json={
            "title": "Frontend Task",
            "description": "Frontend development",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/tasks/?search=backend&limit=2&offset=0",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["limit"] == 2
    assert data["offset"] == 0

    assert data["items"][0]["title"] == "Backend Task 4"
    assert data["items"][1]["title"] == "Backend Task 3"

    response = client.get(
        "/tasks/?search=backend&limit=2&offset=2",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["offset"] == 2

    assert data["items"][0]["title"] == "Backend Task 2"
    assert data["items"][1]["title"] == "Backend Task 1"
