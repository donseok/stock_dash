"""Stock data connector.

Provides domestic (KR) and foreign (US) stock quotes.
Uses Yahoo Finance as a free data source fallback when KIS OpenAPI
is not configured.
"""

import httpx
from app.schemas.market import StockQuote, StockDetail, OHLCData
from app.utils.time import utcnow_iso, utcfromtimestamp

# PRD target stocks (FR-003, FR-004)
DOMESTIC_STOCKS = [
    ("058610.KS", "058610", "에스피지"),
    ("247540.KQ", "247540", "에코프로"),
    ("068270.KS", "068270", "셀트리온"),
]

FOREIGN_STOCKS = [
    ("GOOG", "GOOG", "Alphabet C"),
    ("NVDA", "NVDA", "Nvidia"),
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
    except Exception:
        return None


async def fetch_domestic_stocks() -> list[StockQuote]:
    """Fetch domestic (Korean) stock quotes."""
    quotes = []
    for yf_sym, display_sym, name in DOMESTIC_STOCKS:
        q = await _fetch_yahoo_quote(yf_sym, display_sym, name, "KR")
        if q:
            quotes.append(q)
    return quotes


async def fetch_foreign_stocks() -> list[StockQuote]:
    """Fetch foreign stock quotes."""
    quotes = []
    for yf_sym, display_sym, name in FOREIGN_STOCKS:
        q = await _fetch_yahoo_quote(yf_sym, display_sym, name, "US")
        if q:
            quotes.append(q)
    return quotes


async def fetch_stock_detail(symbol: str) -> StockDetail | None:
    """Fetch detailed stock information including 52-week high/low."""
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

            return StockDetail(
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
    except Exception:
        return None


async def fetch_stock_chart(symbol: str, period: str = "1M") -> list[OHLCData]:
    """Fetch OHLC chart data for a given stock symbol."""
    period_map = {
        "1D": ("5m", "1d"),
        "1W": ("30m", "5d"),
        "1M": ("1d", "1mo"),
        "3M": ("1d", "3mo"),
        "1Y": ("1wk", "1y"),
    }
    interval, yf_range = period_map.get(period, ("1d", "1mo"))

    # Map KR symbol to Yahoo Finance symbol
    yf_symbol = symbol
    for yf_sym, display_sym, _ in DOMESTIC_STOCKS:
        if display_sym == symbol:
            yf_symbol = yf_sym
            break

    try:
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

            chart_data = []
            for i, ts in enumerate(timestamps):
                o = ohlc.get("open", [None])[i]
                h = ohlc.get("high", [None])[i]
                l_ = ohlc.get("low", [None])[i]
                c = ohlc.get("close", [None])[i]
                v = ohlc.get("volume", [None])[i]

                if all(x is not None for x in [o, h, l_, c]):
                    dt = utcfromtimestamp(ts)
                    chart_data.append(
                        OHLCData(
                            time=dt.strftime("%Y-%m-%d"),
                            open=round(o, 2),
                            high=round(h, 2),
                            low=round(l_, 2),
                            close=round(c, 2),
                            volume=v,
                        )
                    )
            return chart_data
    except Exception:
        return []
