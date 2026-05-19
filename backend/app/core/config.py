from functools import lru_cache
from pathlib import Path
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Enterprise RAG Governance Platform"
    environment: str = "local"
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(
        default="postgresql+psycopg://rag:rag@postgres:5432/rag_governance"
    )
    redis_url: str = "redis://redis:6379/0"

    jwt_secret_key: str = "change-me-in-local-env"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    backend_cors_origins: list[AnyHttpUrl] | list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    upload_dir: Path = Path("/app/uploads")
    max_upload_size_mb: int = 20
    allowed_upload_extensions: set[str] = {".pdf", ".txt", ".md", ".docx"}

    default_admin_email: str = "admin@example.com"
    default_admin_password: str = "AdminPass123!"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
