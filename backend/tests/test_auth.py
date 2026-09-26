import uuid

from app.auth import hash_password, verify_password
from app.store import store


def test_passwords_are_salted_and_verified():
    first = hash_password("correct horse battery staple")
    second = hash_password("correct horse battery staple")
    assert first != second
    assert "correct horse" not in first
    assert verify_password("correct horse battery staple", first)
    assert not verify_password("wrong", first)


def test_token_flow_and_protected_current_user(client):
    response = client.post(
        "/api/v1/auth/token",
        json={"username": "demo", "password": "voltwise-demo"},
    )
    assert response.status_code == 200
    token = response.json()["accessToken"]
    assert response.json()["tokenType"] == "bearer"

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json() == {"username": "demo"}

    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"}).status_code == 401


def test_registration_stores_only_a_hash_and_rejects_duplicates(client):
    username = f"user-{uuid.uuid4().hex[:10]}"
    payload = {"username": username, "password": "a-secure-password"}
    created = client.post("/api/v1/auth/register", json=payload)
    assert created.status_code == 201
    assert created.json() == {"username": username}

    stored = store.get_user(username)
    assert stored is not None
    assert stored.password_hash != payload["password"]
    assert client.post("/api/v1/auth/register", json=payload).status_code == 409


def test_bad_credentials_are_rejected(client):
    response = client.post(
        "/api/v1/auth/token",
        json={"username": "demo", "password": "not-the-password"},
    )
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"

