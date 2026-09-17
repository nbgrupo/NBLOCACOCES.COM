"""
Iteration 8 — CORS fix verification tests
Tests: hardcoded CORS origins, middleware order, OPTIONS preflight, login with CORS headers, GET /api/config with CORS
"""

import pytest
import requests
import os
import re

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# ─── CORS origins that must be allowed ───────────────────────────────────────
ALLOWED_ORIGINS = [
    "https://www.nblocacoes.com",
    "https://nblocacoes.com",
    "https://nblocacoes-site.onrender.com",
]

# ─── CODE SOURCE VERIFICATION ────────────────────────────────────────────────

class TestCodeSourceVerification:
    """Verify hardcoded CORS config and middleware order in server.py"""

    SERVER_PY = os.path.join(os.path.dirname(__file__), "../../backend/server.py")

    def _read_server(self):
        with open(self.SERVER_PY, "r") as f:
            return f.read()

    def test_cors_origins_hardcoded(self):
        """Verify CORS_ALLOWED_ORIGINS list contains required origins without env var"""
        src = self._read_server()
        assert "https://www.nblocacoes.com" in src, "Missing hardcoded origin www.nblocacoes.com"
        assert "https://nblocacoes.com" in src, "Missing hardcoded origin nblocacoes.com"
        assert "https://nblocacoes-site.onrender.com" in src, "Missing hardcoded origin nblocacoes-site.onrender.com"
        print("PASS: All 3 required origins are hardcoded in CORS_ALLOWED_ORIGINS")

    def test_no_cors_origins_env_var(self):
        """Verify os.environ.get('CORS_ORIGINS') is NOT used anywhere"""
        src = self._read_server()
        assert "CORS_ORIGINS" not in src, (
            "Found 'CORS_ORIGINS' env var reference — origins must be hardcoded!"
        )
        print("PASS: No os.environ.get('CORS_ORIGINS') found in server.py")

    def test_middleware_before_include_router(self):
        """Verify app.add_middleware(CORSMiddleware) appears BEFORE app.include_router"""
        src = self._read_server()
        middleware_pos = src.find("app.add_middleware(")
        router_pos = src.find("app.include_router(")
        assert middleware_pos != -1, "app.add_middleware not found in server.py"
        assert router_pos != -1, "app.include_router not found in server.py"
        assert middleware_pos < router_pos, (
            f"CORS middleware (pos {middleware_pos}) must come BEFORE include_router (pos {router_pos})"
        )
        print(f"PASS: add_middleware at char {middleware_pos} < include_router at char {router_pos}")

    def test_cors_middleware_uses_hardcoded_list(self):
        """Verify CORSMiddleware uses CORS_ALLOWED_ORIGINS variable, not os.environ"""
        src = self._read_server()
        # Should reference the list variable, not env var
        assert "allow_origins=CORS_ALLOWED_ORIGINS" in src, (
            "CORSMiddleware must use 'allow_origins=CORS_ALLOWED_ORIGINS'"
        )
        print("PASS: CORSMiddleware correctly references CORS_ALLOWED_ORIGINS list")


# ─── LIVE PREFLIGHT (OPTIONS) TESTS ──────────────────────────────────────────

class TestCORSPreflightOptions:
    """Test OPTIONS preflight responses for all allowed origins"""

    def _do_preflight(self, origin: str, endpoint: str = "/api/admin/login"):
        """Send an OPTIONS preflight request and return the response"""
        headers = {
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        }
        resp = requests.options(f"{BASE_URL}{endpoint}", headers=headers, timeout=15)
        return resp

    def test_preflight_www_nblocacoes_com(self):
        """OPTIONS preflight with Origin: https://www.nblocacoes.com → 200 + correct ACAO header"""
        origin = "https://www.nblocacoes.com"
        resp = self._do_preflight(origin)
        print(f"Status: {resp.status_code}")
        print(f"Headers: {dict(resp.headers)}")
        assert resp.status_code in (200, 204), (
            f"Expected 200/204 for OPTIONS preflight, got {resp.status_code}"
        )
        acao = resp.headers.get("access-control-allow-origin", "")
        assert acao == origin, (
            f"Expected Access-Control-Allow-Origin: '{origin}', got: '{acao}'"
        )
        print(f"PASS: Preflight for {origin} → {resp.status_code}, ACAO={acao}")

    def test_preflight_nblocacoes_com_no_www(self):
        """OPTIONS preflight with Origin: https://nblocacoes.com → 200 + correct ACAO header"""
        origin = "https://nblocacoes.com"
        resp = self._do_preflight(origin)
        print(f"Status: {resp.status_code}")
        print(f"Headers: {dict(resp.headers)}")
        assert resp.status_code in (200, 204), (
            f"Expected 200/204 for OPTIONS preflight, got {resp.status_code}"
        )
        acao = resp.headers.get("access-control-allow-origin", "")
        assert acao == origin, (
            f"Expected Access-Control-Allow-Origin: '{origin}', got: '{acao}'"
        )
        print(f"PASS: Preflight for {origin} → {resp.status_code}, ACAO={acao}")

    def test_preflight_nblocacoes_site_onrender(self):
        """OPTIONS preflight with Origin: https://nblocacoes-site.onrender.com → correct ACAO header"""
        origin = "https://nblocacoes-site.onrender.com"
        resp = self._do_preflight(origin)
        print(f"Status: {resp.status_code}")
        print(f"Headers: {dict(resp.headers)}")
        assert resp.status_code in (200, 204), (
            f"Expected 200/204 for OPTIONS preflight, got {resp.status_code}"
        )
        acao = resp.headers.get("access-control-allow-origin", "")
        assert acao == origin, (
            f"Expected Access-Control-Allow-Origin: '{origin}', got: '{acao}'"
        )
        print(f"PASS: Preflight for {origin} → {resp.status_code}, ACAO={acao}")

    def test_preflight_disallowed_origin_rejected(self):
        """OPTIONS preflight with a random unknown origin must NOT get ACAO header"""
        origin = "https://evil-attacker.com"
        resp = self._do_preflight(origin)
        acao = resp.headers.get("access-control-allow-origin", "")
        assert acao != origin, (
            f"Security issue: disallowed origin '{origin}' got Access-Control-Allow-Origin: '{acao}'"
        )
        assert acao not in ("*", origin), (
            f"Wildcard or matching ACAO returned for disallowed origin — CORS misconfigured!"
        )
        print(f"PASS: Disallowed origin '{origin}' → ACAO='{acao}' (correctly excluded)")

    def test_preflight_get_config_with_allowed_origin(self):
        """OPTIONS preflight for GET /api/config with allowed origin"""
        origin = "https://www.nblocacoes.com"
        headers = {
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type",
        }
        resp = requests.options(f"{BASE_URL}/api/config", headers=headers, timeout=15)
        print(f"Status: {resp.status_code}, Headers: {dict(resp.headers)}")
        assert resp.status_code in (200, 204)
        acao = resp.headers.get("access-control-allow-origin", "")
        assert acao == origin, f"Expected ACAO='{origin}', got '{acao}'"
        print(f"PASS: Preflight /api/config → ACAO={acao}")


# ─── LIVE POST /api/admin/login WITH CORS HEADER ─────────────────────────────

class TestAdminLoginWithCORS:
    """Test POST /api/admin/login returns JWT + correct CORS headers"""

    def test_admin_login_returns_token_with_cors_header(self):
        """POST /api/admin/login with Origin: https://www.nblocacoes.com + valid creds → token + ACAO header"""
        origin = "https://www.nblocacoes.com"
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "esenha132"},
            headers={"Origin": origin, "Content-Type": "application/json"},
            timeout=15,
        )
        print(f"Status: {resp.status_code}")
        print(f"Response headers: {dict(resp.headers)}")
        print(f"Response body: {resp.text[:200]}")

        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "token" in data, f"Response missing 'token' field: {data}"
        assert isinstance(data["token"], str) and len(data["token"]) > 10, (
            f"Token looks invalid: {data['token']}"
        )

        acao = resp.headers.get("access-control-allow-origin", "")
        assert acao == origin, (
            f"Expected Access-Control-Allow-Origin: '{origin}', got: '{acao}'"
        )
        print(f"PASS: Login returned token, ACAO={acao}")

    def test_admin_login_invalid_credentials_returns_401(self):
        """POST /api/admin/login with wrong password → 401"""
        origin = "https://www.nblocacoes.com"
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "wrongpassword"},
            headers={"Origin": origin, "Content-Type": "application/json"},
            timeout=15,
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        print(f"PASS: Invalid creds → 401 as expected")

    def test_admin_login_cors_allow_credentials_header(self):
        """Login response should include Access-Control-Allow-Credentials: true"""
        origin = "https://www.nblocacoes.com"
        resp = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "Admin", "password": "esenha132"},
            headers={"Origin": origin, "Content-Type": "application/json"},
            timeout=15,
        )
        acac = resp.headers.get("access-control-allow-credentials", "")
        assert acac.lower() == "true", (
            f"Expected Access-Control-Allow-Credentials: true, got: '{acac}'"
        )
        print(f"PASS: Access-Control-Allow-Credentials={acac}")


# ─── GET /api/config WITH CORS HEADER ────────────────────────────────────────

class TestGetConfigWithCORS:
    """Verify GET /api/config returns CORS header for allowed origin"""

    def test_get_config_with_cors_header(self):
        """GET /api/config with Origin: https://www.nblocacoes.com → 200 + ACAO header"""
        origin = "https://www.nblocacoes.com"
        resp = requests.get(
            f"{BASE_URL}/api/config",
            headers={"Origin": origin},
            timeout=15,
        )
        print(f"Status: {resp.status_code}")
        print(f"Response headers: {dict(resp.headers)}")

        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        acao = resp.headers.get("access-control-allow-origin", "")
        assert acao == origin, (
            f"Expected Access-Control-Allow-Origin: '{origin}', got: '{acao}'"
        )
        print(f"PASS: GET /api/config → 200, ACAO={acao}")

    def test_get_config_response_structure(self):
        """GET /api/config returns valid JSON with 'key' field"""
        resp = requests.get(f"{BASE_URL}/api/config", timeout=15)
        assert resp.status_code == 200
        data = resp.json()
        assert "key" in data, f"Response missing 'key' field: {data}"
        print(f"PASS: /api/config returns valid structure: {list(data.keys())}")
