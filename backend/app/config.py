from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENV: str = "dev"
    APP_NAME: str = "tgappdemo"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/tgappdemo"
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    BOT_TOKEN: str = Field(default="0:dev-token")
    BOT_USERNAME: str = "APIShowcaseBot"
    BOT_WEBHOOK_SECRET: str = "dev-webhook-secret"
    MINI_APP_URL: str = "https://demo.dupa.online"
    PUBLIC_BASE_URL: str = "https://demo.dupa.online"

    JWT_SECRET: str = "change-me-in-prod"
    JWT_ALG: str = "HS256"
    JWT_TTL_SECONDS: int = 900

    VAULT_FERNET_KEY: str = "GdohzuDcrP-VE1vRa1WwN5moRir1szoiW2ZsJSUTExs="

    SHOW_FAKE_PRESENCE: bool = True

    S3_ENDPOINT: str = "http://minio:9000"
    S3_PUBLIC_BASE: str = "https://demo.dupa.online/cdn"
    S3_ACCESS_KEY: str = "minio"
    S3_SECRET_KEY: str = "minio12345"
    S3_BUCKET: str = "showcase-stories"
    S3_REGION: str = "us-east-1"

    CORS_ORIGINS: str = "https://web.telegram.org,https://demo.dupa.online,http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    return Settings()
