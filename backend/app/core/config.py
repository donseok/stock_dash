"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    APP_NAME: str = "Stock Dashboard API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # API Keys
    UPBIT_API_URL: str = "https://api.upbit.com/v1"
    METALS_API_URL: str = "https://metals.live/api/v1"
    EXCHANGE_RATE_API_URL: str = "https://open.er-api.com/v6/latest"
    NEWS_API_KEY: str = ""
    NEWS_API_URL: str = "https://newsapi.org/v2"

    # KIS (Korea Investment & Securities) OpenAPI
    KIS_APP_KEY: str = ""
    KIS_APP_SECRET: str = ""
    KIS_API_URL: str = "https://openapi.koreainvestment.com:9443"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/stock_dash"
    REDIS_URL: str = "redis://localhost:6379"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Cache TTL (seconds)
    CACHE_TTL_CRYPTO: int = 10
    CACHE_TTL_METALS: int = 60
    CACHE_TTL_EXCHANGE: int = 300
    CACHE_TTL_INDEX: int = 30
    CACHE_TTL_STOCK: int = 15
    CACHE_TTL_NEWS: int = 300

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
