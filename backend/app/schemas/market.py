"""Market data schemas for API responses."""

from datetime import datetime, timezone
from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, field_validator

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""
    data: T
    status: str = "success"
    message: Optional[str] = None
    timestamp: str = ""

    @field_validator("timestamp", mode="before")
    @classmethod
    def set_default_timestamp(cls, v: str) -> str:
        return v or datetime.now(timezone.utc).isoformat()


class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float
    volume: int
    high: float
    low: float
    open: float
    prevClose: float
    timestamp: str
    market: str  # "KR" | "US"


class CryptoQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float
    volume24h: float
    high24h: float
    low24h: float
    timestamp: str
    currency: str = "KRW"


class PreciousMetalQuote(BaseModel):
    metal: str  # "gold" | "silver"
    pricePerOz: float
    pricePerGram: float
    change: float
    changePercent: float
    currency: str = "USD"
    timestamp: str


class ExchangeRate(BaseModel):
    baseCurrency: str
    quoteCurrency: str
    rate: float
    change: float
    changePercent: float
    timestamp: str


class MarketIndex(BaseModel):
    symbol: str
    name: str
    value: float
    change: float
    changePercent: float
    market: str  # "KR" | "US"
    isOpen: bool
    timestamp: str


class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: str
    imageUrl: Optional[str] = None
    publishedAt: str
    relatedSymbols: list[str] = []
    category: str = "general"


class StockDetail(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float
    volume: int
    high: float
    low: float
    open: float
    prevClose: float
    week52High: float
    week52Low: float
    marketCap: Optional[float] = None
    market: str  # "KR" | "US"
    timestamp: str


class OHLCData(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float] = None
