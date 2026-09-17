from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import requests as http_requests
import logging
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

ALLOWED_EXT = {".mp4", ".webm", ".mov", ".ogg", ".jpg", ".jpeg", ".png", ".webp", ".gif"}
MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp",
    "mp4": "video/mp4", "webm": "video/webm", "mov": "video/quicktime",
    "ogg": "video/ogg",
}

# ---------- Object Storage (Emergent) ----------
_STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = _STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = "nb-locacoes"
_storage_key: Optional[str] = None

def _init_storage(force: bool = False) -> str:
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = http_requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": EMERGENT_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def _put_object(path: str, data: bytes, content_type: str) -> dict:
    key = _init_storage()
    resp = http_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 404:
        key = _init_storage(force=True)
        resp = http_requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()

def _get_object(path: str) -> tuple:
    key = _init_storage()
    resp = http_requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    if resp.status_code == 404:
        key = _init_storage(force=True)
        resp = http_requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="NB Locações API")

# ── CORS deve ser registrado ANTES das rotas ──────────────────────────────
# Origens fixas no código — sem depender de variável de ambiente
CORS_ALLOWED_ORIGINS = [
    "https://www.nblocacoes.com",
    "https://nblocacoes.com",
    "https://nblocacoes-site.onrender.com",
    "https://carousel-frota-demo.preview.emergentagent.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─────────────────────────────────────────────────────────────────────────

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

CONFIG_KEY = "site"


# ---------------- Models ----------------
class SiteConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    key: str = CONFIG_KEY
    data: Dict[str, Any]
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SiteConfigUpdate(BaseModel):
    data: Dict[str, Any]


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    bike: Optional[str] = None
    plan: Optional[str] = None
    price: Optional[float] = None
    message: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    bike: Optional[str] = None
    plan: Optional[str] = None
    price: Optional[float] = None
    message: Optional[str] = None


class AdminLoginPayload(BaseModel):
    username: str
    password: str


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "NB Locações API online"}


@api_router.post("/admin/login")
async def admin_login(payload: AdminLoginPayload):
    """Verify admin credentials and return a JWT token."""
    expected_user = os.environ.get("ADMIN_USERNAME", "Admin")
    expected_pass = os.environ.get("ADMIN_PASSWORD", "")
    if payload.username != expected_user or payload.password != expected_pass:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos.")
    secret = os.environ.get("JWT_SECRET", "fallback-secret")
    token_data = {
        "sub": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    token = pyjwt.encode(token_data, secret, algorithm="HS256")
    return {"token": token}


@api_router.get("/admin/verify")
async def admin_verify(request: Request):
    """Check if the provided Bearer token is still valid."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não fornecido.")
    token = auth_header[7:]
    secret = os.environ.get("JWT_SECRET", "fallback-secret")
    try:
        pyjwt.decode(token, secret, algorithms=["HS256"])
        return {"valid": True}
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado.")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido.")



@api_router.get("/config")
async def get_config():
    """Return the persisted site configuration. Returns null data if not set yet."""
    doc = await db.site_config.find_one({"key": CONFIG_KEY}, {"_id": 0})
    if not doc:
        return {"key": CONFIG_KEY, "data": None}
    return doc


@api_router.put("/config")
async def save_config(payload: SiteConfigUpdate):
    """Persist the full site configuration (upsert)."""
    config = SiteConfig(data=payload.data)
    doc = config.model_dump()
    await db.site_config.update_one(
        {"key": CONFIG_KEY},
        {"$set": doc},
        upsert=True,
    )
    return doc


@api_router.delete("/config")
async def reset_config():
    """Reset the site configuration to defaults (remove persisted override)."""
    await db.site_config.delete_one({"key": CONFIG_KEY})
    return {"status": "reset"}


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(lead.model_dump())
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads():
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return leads


@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Tipo de arquivo não suportado: {ext}")
    content_type = MIME_TYPES.get(ext.lstrip("."), "application/octet-stream")
    path = f"{APP_NAME}/uploads/{uuid.uuid4().hex}{ext}"
    data = await file.read()
    try:
        result = _put_object(path, data, content_type)
    except Exception as e:
        logger.error(f"Object storage upload failed: {e}")
        raise HTTPException(status_code=500, detail="Falha ao enviar o arquivo.")
    return {"url": f"/api/files/{result['path']}", "filename": file.filename}


@api_router.get("/files/{file_path:path}")
async def serve_file(file_path: str):
    """Proxy files from object storage — allows <img src> without auth headers."""
    try:
        data, content_type = _get_object(file_path)
    except http_requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
        raise HTTPException(status_code=502, detail="Erro ao recuperar o arquivo.")
    return Response(content=data, media_type=content_type)


# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    try:
        _init_storage()
        logger.info("Object storage initialized successfully.")
    except Exception as e:
        logger.warning(f"Object storage init failed at startup (will retry on first upload): {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
