"""
Iteration 6 — Tests for REACT_APP_BACKEND_URL fallback fix.
Covers:
  - POST /api/admin/login returns JWT token (not a /undefined/api/... URL)
  - GET /api/config returns 200 and loads site config
  - GET /api/admin/verify validates a fresh token
  - Token is a proper JWT string (3 dot-separated segments)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestAdminLoginFallback:
    """
    Core focus: POST /api/admin/login with valid credentials returns a real JWT token.
    The original bug was that REACT_APP_BACKEND_URL was undefined in Render,
    producing /undefined/api/admin/login. This test validates the backend endpoint
    directly (env fallback fix is in frontend code).
    """

    def test_login_returns_200_and_jwt_token(self):
        """Valid credentials → 200 with JWT string."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "esenha132"},
            timeout=15,
        )
        assert resp.status_code == 200, (
            f"Expected 200, got {resp.status_code}. "
            f"URL used: {resp.url} | Body: {resp.text[:200]}"
        )
        data = resp.json()
        assert "token" in data, f"'token' key missing in response: {data}"
        token = data["token"]
        assert isinstance(token, str), "token is not a string"
        # JWT has exactly 3 dot-separated parts: header.payload.signature
        parts = token.split(".")
        assert len(parts) == 3, f"Token is not a valid JWT (expected 3 parts, got {len(parts)}): {token[:60]}"
        # Each part must be non-empty base64url
        for part in parts:
            assert len(part) > 0, "JWT segment is empty"

    def test_login_wrong_password_returns_401(self):
        """Wrong password → 401."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "wrongpassword"},
            timeout=10,
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    def test_login_wrong_username_returns_401(self):
        """Wrong username → 401."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "notadmin", "password": "esenha132"},
            timeout=10,
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    def test_login_missing_fields_returns_422(self):
        """Empty body → 422 validation error."""
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={},
            timeout=10,
        )
        assert resp.status_code == 422, f"Expected 422, got {resp.status_code}"


class TestConfigEndpoint:
    """GET /api/config should load site configuration correctly."""

    def test_get_config_returns_200(self):
        """Config endpoint returns 200."""
        resp = requests.get(f"{BASE_URL}/api/config", timeout=15)
        assert resp.status_code == 200, (
            f"Expected 200, got {resp.status_code}: {resp.text[:200]}"
        )

    def test_get_config_has_key_field(self):
        """Response has 'key' field equal to 'site'."""
        resp = requests.get(f"{BASE_URL}/api/config", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        assert "key" in data, f"'key' field missing: {data}"
        assert data["key"] == "site", f"Expected key='site', got key='{data['key']}'"

    def test_get_config_has_data_field(self):
        """Response has 'data' field (can be null if not yet saved)."""
        resp = requests.get(f"{BASE_URL}/api/config", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data, f"'data' field missing: {data}"


class TestAdminVerifyWithToken:
    """GET /api/admin/verify validates a freshly minted token."""

    @pytest.fixture
    def valid_token(self):
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "esenha132"},
            timeout=15,
        )
        if resp.status_code != 200:
            pytest.skip("Login failed — cannot test verify")
        return resp.json()["token"]

    def test_verify_valid_token_returns_200(self, valid_token):
        resp = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": f"Bearer {valid_token}"},
            timeout=10,
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        assert resp.json().get("valid") is True

    def test_verify_bad_token_returns_401(self):
        resp = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": "Bearer invalidtoken"},
            timeout=10,
        )
        assert resp.status_code == 401

    def test_verify_no_auth_header_returns_401(self):
        resp = requests.get(f"{BASE_URL}/api/admin/verify", timeout=10)
        assert resp.status_code == 401


class TestAPIRoot:
    """Health check — GET /api/ should return 200."""

    def test_api_root_returns_200(self):
        resp = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert resp.status_code == 200, f"API root not healthy: {resp.status_code}"
