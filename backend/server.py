from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os
import shutil
import logging
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Uploads directory (served statically)
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXT = {".mp4", ".webm", ".mov", ".ogg", ".jpg", ".jpeg", ".png", ".webp", ".gif"}

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="NB Locações API")

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
    name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / name
    try:
        with dest.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()
    return {"url": f"/api/uploads/{name}", "filename": name}


# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files (ingress routes /api/* to this backend)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
