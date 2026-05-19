from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.enums import UserRole
from app.schemas.auth import RegisterRequest
from app.services.auth_service import create_user, get_user_by_email


def ensure_default_admin(db: Session) -> None:
    settings = get_settings()
    if get_user_by_email(db, settings.default_admin_email):
        return
    create_user(
        db,
        RegisterRequest(
            email=settings.default_admin_email,
            full_name="Platform Administrator",
            password=settings.default_admin_password,
            department="Platform",
            access_group="admin",
        ),
        role=UserRole.ADMIN,
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    db = SessionLocal()
    try:
        ensure_default_admin(db)
    finally:
        db.close()
    yield


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Phase 1 API for an enterprise-ready RAG governance platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.backend_cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
