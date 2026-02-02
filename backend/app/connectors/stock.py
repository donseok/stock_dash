"""Stock data connector.

Provides domestic (KR) and foreign (US) stock quotes.
Uses Yahoo Finance as a free data source fallback when KIS OpenAPI
is not configured.
"""

import asyncio
import logging

import httpx
from app.core.cache import cache
from app.core.config import settings
from app.schemas.market import StockQuote, StockDetail, OHLCData
from app.utils.time import utcnow_iso, utcfromtimestamp

logger = logging.getLogger(__name__)

# PRD target stocks (FR-003, FR-004)
DOMESTIC_STOCKS = [
    ("058610.KQ", "058610", "에스피지"),  # KOSDAQ 종목
    ("247540.KQ", "247540", "에코프로"),
    ("068270.KS", "068270", "셀트리온"),
]

FOREIGN_STOCKS = [
    ("GOOG", "GOOG", "Alphabet C"),
    ("NVDA", "NVDA", "Nvidia"),
    ("BMNR", "BMNR", "Bitmine Immersion"),
    ("FIG", "FIG", "Figma"),
]


async def _fetch_yahoo_quote(
    symbol: str, display_symbol: str, name: str, market: str
) -> StockQuote | None:
    """Fetch a single stock quote from Yahoo Finance."""
    now = utcnow_iso()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
                params={"interval": "1d", "range": "5d"},
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if resp.status_code != 200:
                return None

            result = resp.json()["chart"]["result"][0]
            meta = result["meta"]
            price = meta["regularMarketPrice"]

            # Extract data from chart history for fallback values
            indicators = result.get("indicators", {})
            ohlc = indicators.get("quote", [{}])[0]
            closes = [c for c in ohlc.get("close", []) if c is not None]
            volumes = [v for v in ohlc.get("volume", []) if v is not None]
            highs = [h for h in ohlc.get("high", []) if h is not None]
            lows = [lo for lo in ohlc.get("low", []) if lo is not None]
            opens = [o for o in ohlc.get("open", []) if o is not None]

            # Get previousClose: prefer meta, fallback to chart close
            # Detect stock splits: if chart close >> market price, adjust
            prev = meta.get("previousClose")
            if not prev and len(closes) >= 2:
                last_close = closes[-1]
                ratio = last_close / price if price else 1
                if ratio > 1.5:
                    # Likely a stock split; adjust historical close
                    prev = closes[-2] / ratio
                else:
                    prev = closes[-2]
            elif not prev and len(closes) == 1:
                prev = closes[0]
            elif not prev:
                prev = price

            vol = meta.get("regularMarketVolume")
            if not vol and volumes:
                vol = volumes[-1]

            day_high = meta.get("regularMarketDayHigh")
            if not day_high and highs:
                day_high = highs[-1]

            day_low = meta.get("regularMarketDayLow")
            if not day_low and lows:
                day_low = lows[-1]

            day_open = meta.get("regularMarketOpen")
            if not day_open and opens:
                day_open = opens[-1]

            change = round(price - prev, 2)
            pct = round((change / prev) * 100, 2) if prev else 0

            return StockQuote(
                symbol=display_symbol,
                name=name,
                price=price,
                change=change,
                changePercent=pct,
                volume=int(vol or 0),
                high=day_high or price,
                low=day_low or price,
                open=day_open or price,
                prevClose=prev,
                timestamp=now,
                market=market,
            )
    except Exception as e:
        logger.warning("Failed to fetch quote for %s: %s", symbol, e)
        return None


async def fetch_domestic_stocks() -> list[StockQuote]:
    """Fetch domestic (Korean) stock quotes."""
    cached = cache.get("domestic_stocks")
    if cached is not None:
        return cached

    tasks = [
        _fetch_yahoo_quote(yf_sym, display_sym, name, "KR")
        for yf_sym, display_sym, name in DOMESTIC_STOCKS
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    quotes = [r for r in results if isinstance(r, StockQuote)]
    cache.set("domestic_stocks", quotes, settings.CACHE_TTL_STOCK)
    return quotes


async def fetch_foreign_stocks() -> list[StockQuote]:
    """Fetch foreign stock quotes."""
    cached = cache.get("foreign_stocks")
    if cached is not None:
        return cached

    tasks = [
        _fetch_yahoo_quote(yf_sym, display_sym, name, "US")
        for yf_sym, display_sym, name in FOREIGN_STOCKS
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    quotes = [r for r in results if isinstance(r, StockQuote)]
    cache.set("foreign_stocks", quotes, settings.CACHE_TTL_STOCK)
    return quotes


async def fetch_stock_detail(symbol: str) -> StockDetail | None:
    """Fetch detailed stock information including 52-week high/low."""
    cache_key = f"stock_detail:{symbol}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    now = utcnow_iso()

    # Resolve Yahoo Finance symbol
    yf_symbol = symbol
    name = symbol
    market = "US"
    for yf_sym, display_sym, stock_name in DOMESTIC_STOCKS:
        if display_sym == symbol:
            yf_symbol = yf_sym
            name = stock_name
            market = "KR"
            break
    else:
        for yf_sym, display_sym, stock_name in FOREIGN_STOCKS:
            if display_sym == symbol:
                yf_symbol = yf_sym
                name = stock_name
                market = "US"
                break

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_symbol}",
                params={"interval": "1d", "range": "1y"},
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if resp.status_code != 200:
                return None

            result = resp.json()["chart"]["result"][0]
            meta = result["meta"]
            price = meta["regularMarketPrice"]

            # Extract data from chart history
            indicators = result.get("indicators", {})
            ohlc = indicators.get("quote", [{}])[0]
            closes = [c for c in ohlc.get("close", []) if c is not None]
            highs = [h for h in ohlc.get("high", []) if h is not None]
            lows = [lo for lo in ohlc.get("low", []) if lo is not None]
            opens = [o for o in ohlc.get("open", []) if o is not None]
            volumes = [v for v in ohlc.get("volume", []) if v is not None]

            prev = meta.get("previousClose")
            if not prev and len(closes) >= 2:
                prev = closes[-2]
            elif not prev and len(closes) == 1:
                prev = closes[0]
            elif not prev:
                prev = price

            change = round(price - prev, 2)
            pct = round((change / prev) * 100, 2) if prev else 0

            week52_high = max(highs) if highs else price
            week52_low = min(lows) if lows else price

            vol = meta.get("regularMarketVolume")
            if not vol and volumes:
                vol = volumes[-1]

            detail = StockDetail(
                symbol=symbol,
                name=name,
                price=price,
                change=change,
                changePercent=pct,
                volume=int(vol or 0),
                high=meta.get("regularMarketDayHigh") or (highs[-1] if highs else price),
                low=meta.get("regularMarketDayLow") or (lows[-1] if lows else price),
                open=meta.get("regularMarketOpen") or (opens[-1] if opens else price),
                prevClose=prev,
                week52High=round(week52_high, 2),
                week52Low=round(week52_low, 2),
                marketCap=meta.get("marketCap"),
                market=market,
                timestamp=now,
            )
            cache.set(cache_key, detail, settings.CACHE_TTL_STOCK)
            return detail
    except Exception as e:
        logger.warning("Failed to fetch stock detail for %s: %s", symbol, e)
        return None


async def _fetch_chart_raw(
    yf_symbol: str, interval: str, yf_range: str
) -> list[OHLCData]:
    """Fetch raw OHLC data from Yahoo Finance for a given interval/range."""
    is_intraday = interval in ("1m", "2m", "5m", "15m", "30m", "60m", "90m")

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_symbol}",
            params={"interval": interval, "range": yf_range},
            headers={"User-Agent": "Mozilla/5.0"},
        )
        resp.raise_for_status()
        result = resp.json()["chart"]["result"][0]

        timestamps = result.get("timestamp", [])
        indicators = result.get("indicators", {})
        ohlc = indicators.get("quote", [{}])[0]

        open_list = ohlc.get("open", [])
        high_list = ohlc.get("high", [])
        low_list = ohlc.get("low", [])
        close_list = ohlc.get("close", [])
        vol_list = ohlc.get("volume", [])

        chart_data = []
        for i, ts in enumerate(timestamps):
            if i >= len(close_list):
                break
            o = open_list[i] if i < len(open_list) else None
            h = high_list[i] if i < len(high_list) else None
            l_ = low_list[i] if i < len(low_list) else None
            c = close_list[i] if i < len(close_list) else None
            v = vol_list[i] if i < len(vol_list) else None

            if all(x is not None for x in [o, h, l_, c]):
                dt = utcfromtimestamp(ts)
                time_str = (
                    dt.strftime("%Y-%m-%dT%H:%M")
                    if is_intraday
                    else dt.strftime("%Y-%m-%d")
                )
                chart_data.append(
                    OHLCData(
                        time=time_str,
                        open=round(o, 2),
                        high=round(h, 2),
                        low=round(l_, 2),
                        close=round(c, 2),
                        volume=v,
                    )
                )
        return chart_data


async def fetch_stock_chart(symbol: str, period: str = "1M") -> list[OHLCData]:
    """Fetch OHLC chart data for a given stock symbol.

    For short periods (1D, 1W), tries intraday intervals first. If no data is
    returned (e.g. weekend/holiday or Yahoo doesn't provide intraday for the
    market), falls back to daily candles over a wider range.
    """
    cache_key = f"stock_chart:{symbol}:{period}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    period_map = {
        "1D": ("5m", "1d"),
        "1W": ("30m", "5d"),
        "1M": ("1d", "1mo"),
        "3M": ("1d", "3mo"),
        "1Y": ("1wk", "1y"),
    }
    # Fallback configs: try a wider range, then daily interval
    fallback_map = {
        "1D": [("5m", "5d"), ("1d", "5d")],
        "1W": [("30m", "10d"), ("1d", "1mo")],
    }

    interval, yf_range = period_map.get(period, ("1d", "1mo"))

    # Map KR symbol to Yahoo Finance symbol
    yf_symbol = symbol
    for yf_sym, display_sym, _ in DOMESTIC_STOCKS:
        if display_sym == symbol:
            yf_symbol = yf_sym
            break
    else:
        for yf_sym, display_sym, _ in FOREIGN_STOCKS:
            if display_sym == symbol:
                yf_symbol = yf_sym
                break

    # Build list of attempts: primary + fallbacks
    attempts = [(interval, yf_range)]
    if period in fallback_map:
        attempts.extend(fallback_map[period])

    for attempt_interval, attempt_range in attempts:
        try:
            chart_data = await _fetch_chart_raw(
                yf_symbol, attempt_interval, attempt_range
            )
            if chart_data:
                cache.set(cache_key, chart_data, settings.CACHE_TTL_STOCK)
                return chart_data
        except Exception as e:
            logger.warning("Chart fetch failed for %s (%s/%s): %s", yf_symbol, attempt_interval, attempt_range, e)
            continue

    return []
