"""
Backend tests for NB Locações Admin Authentication endpoints.
Iteration 3 — Tests POST /api/admin/login and GET /api/admin/verify
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


# ---------------------------------------------------------------------------
# POST /api/admin/login
# ---------------------------------------------------------------------------

class TestAdminLogin:
    """Tests for POST /api/admin/login"""

    def test_login_success_returns_200_and_token(self):
        """Valid credentials should return HTTP 200 with a JWT token."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "esenha132"},
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "token" in data, f"'token' key missing in response: {data}"
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 20, "Token too short to be a valid JWT"

    def test_login_wrong_password_returns_401(self):
        """Wrong password must return HTTP 401."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "wrongpassword"},
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "detail" in data, f"'detail' key missing in 401 response: {data}"

    def test_login_wrong_username_returns_401(self):
        """Wrong username must return HTTP 401."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "wronguser", "password": "esenha132"},
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}: {resp.text}"

    def test_login_empty_credentials_returns_401(self):
        """Empty credentials should return 401 or 422 (validation)."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "", "password": ""},
        )
        assert resp.status_code in [401, 422], f"Expected 401 or 422, got {resp.status_code}: {resp.text}"

    def test_login_missing_fields_returns_422(self):
        """Missing required fields should return HTTP 422."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={},
        )
        assert resp.status_code == 422, f"Expected 422, got {resp.status_code}: {resp.text}"


# ---------------------------------------------------------------------------
# GET /api/admin/verify
# ---------------------------------------------------------------------------

class TestAdminVerify:
    """Tests for GET /api/admin/verify"""

    @pytest.fixture
    def valid_token(self):
        """Obtain a fresh valid JWT token."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "esenha132"},
        )
        if resp.status_code != 200:
            pytest.skip("Cannot obtain valid token — login failed")
        return resp.json()["token"]

    def test_verify_valid_token_returns_200_and_valid_true(self, valid_token):
        """A freshly minted token should verify as valid."""
        resp = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("valid") is True, f"Expected {{valid: true}}, got: {data}"

    def test_verify_invalid_token_returns_401(self):
        """An invalid/garbage token should return 401."""
        resp = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": "Bearer thisisnotavalidtoken"},
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}: {resp.text}"

    def test_verify_no_token_returns_401(self):
        """Request without Authorization header should return 401."""
        resp = requests.get(f"{BASE_URL}/api/admin/verify")
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}: {resp.text}"

    def test_verify_malformed_bearer_returns_401(self):
        """Malformed Bearer (no token part) should return 401."""
        resp = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": "Bearer "},
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}: {resp.text}"
