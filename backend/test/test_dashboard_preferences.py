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


LAYOUTS = {
    "lg": [
        {"i": "stats", "x": 0, "y": 0, "w": 12, "h": 2},
        {"i": "quick-actions", "x": 8, "y": 2, "w": 4, "h": 4},
    ],
    "md": [{"i": "stats", "x": 0, "y": 0, "w": 10, "h": 2}],
    "sm": [{"i": "stats", "x": 0, "y": 0, "w": 6, "h": 2}],
    "xs": [{"i": "stats", "x": 0, "y": 0, "w": 4, "h": 2}],
    "xxs": [{"i": "stats", "x": 0, "y": 0, "w": 2, "h": 2}],
}


def test_get_preferences_empty_for_new_user(client, auth_headers):
    response = client.get(
        "/dashboard/preferences/",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json() == {"preferences": {}}


def test_save_preferences(client, auth_headers):
    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["preferences"]["layouts"] == LAYOUTS


def test_saved_preferences_persist(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    response = client.get(
        "/dashboard/preferences/",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["preferences"]["theme"] == "dark"
    assert data["preferences"]["layouts"] == LAYOUTS


def test_put_response_matches_get_response(client, auth_headers):
    put_response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    get_response = client.get(
        "/dashboard/preferences/",
        headers=auth_headers,
    )

    assert put_response.status_code == 200
    assert get_response.status_code == 200
    assert put_response.json() == get_response.json()


def test_saving_layouts_keeps_existing_theme(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
            },
        },
        headers=auth_headers,
    )

    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["preferences"]["theme"] == "dark"
    assert data["preferences"]["layouts"] == LAYOUTS


def test_saving_theme_keeps_existing_layouts(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "light",
            },
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["preferences"]["layouts"] == LAYOUTS
    assert data["preferences"]["theme"] == "light"


def test_saving_layouts_keeps_hidden_widgets(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "hiddenWidgets": ["quick-actions"],
            },
        },
        headers=auth_headers,
    )

    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["preferences"]["hiddenWidgets"] == [
        "quick-actions",
    ]


def test_new_value_replaces_old_value(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
            },
        },
        headers=auth_headers,
    )

    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "light",
            },
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["preferences"]["theme"] == "light"


def test_layouts_are_replaced_not_deep_merged(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    smaller_layouts = {
        "lg": [
            {"i": "stats", "x": 0, "y": 0, "w": 12, "h": 2},
        ],
    }

    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": smaller_layouts,
            },
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["preferences"]["layouts"] == smaller_layouts


def test_hidden_widgets_can_be_cleared(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "hiddenWidgets": ["stats"],
            },
        },
        headers=auth_headers,
    )

    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "hiddenWidgets": [],
            },
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["preferences"]["hiddenWidgets"] == []


def test_empty_update_keeps_existing_preferences(client, auth_headers):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {},
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["preferences"]["theme"] == "dark"
    assert data["preferences"]["layouts"] == LAYOUTS


def test_repeated_identical_saves_are_idempotent(client, auth_headers):
    first = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    second = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()


def test_user_preferences_are_isolated(
    client,
    db,
    auth_headers,
):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
                "layouts": LAYOUTS,
            },
        },
        headers=auth_headers,
    )

    headers_b = register_and_login(
        client,
        db,
        "other-dashboard-isolation@zenith.dev",
    )

    response = client.get(
        "/dashboard/preferences/",
        headers=headers_b,
    )

    assert response.status_code == 200
    assert response.json() == {"preferences": {}}


def test_saving_as_another_user_does_not_affect_first_user(
    client,
    db,
    auth_headers,
):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
            },
        },
        headers=auth_headers,
    )

    headers_b = register_and_login(
        client,
        db,
        "other-dashboard-save@zenith.dev",
    )

    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "light",
            },
        },
        headers=headers_b,
    )

    response_a = client.get(
        "/dashboard/preferences/",
        headers=auth_headers,
    )

    response_b = client.get(
        "/dashboard/preferences/",
        headers=headers_b,
    )

    assert response_a.json()["preferences"]["theme"] == "dark"
    assert response_b.json()["preferences"]["theme"] == "light"


def test_get_preferences_without_authentication(client):
    response = client.get("/dashboard/preferences/")

    assert response.status_code == 401


def test_save_preferences_without_authentication(client):
    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
            },
        },
    )

    assert response.status_code == 401


def test_save_preferences_without_body(client, auth_headers):
    response = client.put(
        "/dashboard/preferences/",
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_save_preferences_with_string_preferences(client, auth_headers):
    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": "not-an-object",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_save_preferences_with_list_preferences(client, auth_headers):
    response = client.put(
        "/dashboard/preferences/",
        json={
            "preferences": [],
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_invalid_save_does_not_change_stored_preferences(
    client,
    auth_headers,
):
    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": {
                "theme": "dark",
            },
        },
        headers=auth_headers,
    )

    client.put(
        "/dashboard/preferences/",
        json={
            "preferences": "bad",
        },
        headers=auth_headers,
    )

    response = client.get(
        "/dashboard/preferences/",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["preferences"] == {"theme": "dark"}
