import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]

ENV_FILE = os.getenv("ENV_FILE", ".env")


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    resend_api_key: str
    frontend_url: str
    environment: str = "development"
    refresh_token_days: int = 30
    refresh_token_absolute_days: int = 90
    refresh_cookie_secure: bool = False
    refresh_cookie_samesite: str = "lax"
    refresh_cookie_domain: str | None = None

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
