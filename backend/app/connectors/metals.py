"""Precious metals price connector using metals.live API."""

import logging

import httpx
from app.core.cache import cache
from app.core.config import settings
from app.schemas.market import PreciousMetalQuote
from app.utils.time import utcnow_iso

logger = logging.getLogger(__name__)

METALS_API = "https://metals.live/api/v1"
TROY_OZ_TO_GRAM = 31.1035

# Fallback data - Updated 2026-02 with current market prices
MOCK_METALS = [
    PreciousMetalQuote(
        metal="gold",
        pricePerOz=4700.00,  # Updated from ~$2800 to current ~$4700
        pricePerGram=round(4700.00 / TROY_OZ_TO_GRAM, 2),
        change=0.0,
        changePercent=0.0,
        currency="USD",
        timestamp="",
    ),
    PreciousMetalQuote(
        metal="silver",
        pricePerOz=80.00,  # Updated from ~$31 to current ~$80
        pricePerGram=round(80.00 / TROY_OZ_TO_GRAM, 2),
        change=0.0,
        changePercent=0.0,
        currency="USD",
        timestamp="",
    ),
]


async def _fetch_yahoo_metals() -> list[PreciousMetalQuote] | None:
    """Fetch gold and silver prices from Yahoo Finance as fallback."""
    now = utcnow_iso()
    symbols = [("GC=F", "gold"), ("SI=F", "silver")]
    quotes = []

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            for symbol, metal_name in symbols:
                resp = await client.get(
                    f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
                    params={"interval": "1d", "range": "2d"},
                    headers={"User-Agent": "Mozilla/5.0"},
                )
                if resp.status_code != 200:
                    continue

                result = resp.json()["chart"]["result"][0]
                meta = result["meta"]
                price = meta.get("regularMarketPrice", 0)
                prev_close = meta.get("previousClose", price)

                if price > 0:
                    change = round(price - prev_close, 2)
                    change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

                    quotes.append(
                        PreciousMetalQuote(
                            metal=metal_name,
                            pricePerOz=round(price, 2),
                            pricePerGram=round(price / TROY_OZ_TO_GRAM, 2),
                            change=change,
                            changePercent=change_pct,
                            currency="USD",
                            timestamp=now,
                        )
                    )

        return quotes if len(quotes) == 2 else None
    except Exception as e:
        logger.warning("Yahoo metals fetch failed: %s", e)
        return None


async def fetch_precious_metals() -> list[PreciousMetalQuote]:
    """Fetch gold and silver spot prices."""
    cached = cache.get("precious_metals")
    if cached is not None:
        return cached

    now = utcnow_iso()

    # Try metals.live API first
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{METALS_API}/spot")
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "")
            if "json" not in content_type and "javascript" not in content_type:
                raise ValueError(f"Unexpected content type: {content_type}")

            data = resp.json()

        quotes = []
        for item in data:
            metal_name = item.get("name", "").lower()
            if metal_name not in ("gold", "silver"):
                continue

            price_oz = item.get("price", 0)
            price_gram = round(price_oz / TROY_OZ_TO_GRAM, 2)

            quotes.append(
                PreciousMetalQuote(
                    metal=metal_name,
                    pricePerOz=price_oz,
                    pricePerGram=price_gram,
                    change=0,
                    changePercent=0,
                    currency="USD",
                    timestamp=now,
                )
            )

        if quotes:
            cache.set("precious_metals", quotes, settings.CACHE_TTL_METALS)
            return quotes

    except Exception as e:
        logger.warning("metals.live API failed: %s", e)

    # Try Yahoo Finance as fallback
    yahoo_quotes = await _fetch_yahoo_metals()
    if yahoo_quotes:
        cache.set("precious_metals", yahoo_quotes, settings.CACHE_TTL_METALS)
        return yahoo_quotes

    # Last resort: use mock data
    logger.warning("Using fallback mock data for precious metals")
    return _fallback_metals(now)


def _fallback_metals(timestamp: str) -> list[PreciousMetalQuote]:
    """Return mock metals data as fallback."""
    return [m.model_copy(update={"timestamp": timestamp}) for m in MOCK_METALS]

