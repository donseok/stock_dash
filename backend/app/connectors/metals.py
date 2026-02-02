"""Precious metals price connector using metals.live API."""

import httpx
from app.schemas.market import PreciousMetalQuote
from app.utils.time import utcnow_iso

METALS_API = "https://metals.live/api/v1"
TROY_OZ_TO_GRAM = 31.1035

# Fallback data
MOCK_METALS = [
    PreciousMetalQuote(
        metal="gold",
        pricePerOz=2815.50,
        pricePerGram=round(2815.50 / TROY_OZ_TO_GRAM, 2),
        change=12.30,
        changePercent=0.44,
        currency="USD",
        timestamp="",
    ),
    PreciousMetalQuote(
        metal="silver",
        pricePerOz=31.25,
        pricePerGram=round(31.25 / TROY_OZ_TO_GRAM, 2),
        change=-0.15,
        changePercent=-0.48,
        currency="USD",
        timestamp="",
    ),
]


async def fetch_precious_metals() -> list[PreciousMetalQuote]:
    """Fetch gold and silver spot prices."""
    now = utcnow_iso()

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

        return quotes if quotes else _fallback_metals(now)

    except Exception:
        return _fallback_metals(now)


def _fallback_metals(timestamp: str) -> list[PreciousMetalQuote]:
    """Return mock metals data as fallback."""
    for m in MOCK_METALS:
        m.timestamp = timestamp
    return MOCK_METALS
