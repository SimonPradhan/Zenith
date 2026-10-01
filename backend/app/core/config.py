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

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
