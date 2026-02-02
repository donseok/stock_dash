"""Exchange rate connector."""

import httpx
from app.schemas.market import ExchangeRate
from app.utils.time import utcnow_iso

EXCHANGE_API = "https://open.er-api.com/v6/latest"


async def fetch_exchange_rates() -> list[ExchangeRate]:
    """Fetch USD/KRW and other key exchange rates."""
    now = utcnow_iso()

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{EXCHANGE_API}/USD")
        resp.raise_for_status()
        data = resp.json()

    rates_data = data.get("rates", {})
    target_pairs = [
        ("USD", "KRW"),
        ("USD", "JPY"),
        ("USD", "EUR"),
        ("USD", "CNY"),
    ]

    result = []
    for base, quote in target_pairs:
        rate = rates_data.get(quote, 0)
        result.append(
            ExchangeRate(
                baseCurrency=base,
                quoteCurrency=quote,
                rate=round(rate, 2),
                change=0,
                changePercent=0,
                timestamp=now,
            )
        )
    return result
