# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stock Dashboard (주식 웹 포털 대시보드) — a full-stack web portal integrating real-time Korean/US stocks, crypto, precious metals, exchange rates, market indices, and news into a single dashboard. View-only (no trading).

## Commands

### Backend (FastAPI)

```bash
# Start dev server
cd backend && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run all tests (28 tests)
cd backend && ./venv/bin/python -m pytest tests/ -v

# Run a single test file
cd backend && ./venv/bin/python -m pytest tests/test_api.py -v

# Run a specific test
cd backend && ./venv/bin/python -m pytest tests/test_connectors.py::test_news_connector -v
```

### Frontend (Next.js 14)

```bash
# Install dependencies (uses pnpm)
cd frontend && pnpm install

# Start dev server
cd frontend && pnpm dev

# Production build
cd frontend && pnpm build

# Lint
cd frontend && pnpm lint
```

### Docker (full stack)

```bash
cd infrastructure/docker && docker-compose up -d
```

## Architecture

**Monorepo** with `frontend/` (Next.js 14 + TypeScript) and `backend/` (Python FastAPI).

### Data Flow

```
Frontend (TanStack Query hooks) → REST API → Backend (FastAPI routers)
                                                  ↓
                                          Connectors (httpx async)
                                                  ↓
                                    External APIs (Yahoo Finance, Upbit,
                                    metals.live, er-api, Google News RSS)
```

There is no database or Redis required for development — all connectors fetch directly from external APIs with in-memory fallbacks.

### Backend Structure

- `app/main.py` — FastAPI app with CORS (localhost:3000)
- `app/api/v1/` — Route handlers, each file maps to one market type
- `app/connectors/` — **Data source integrations** (the core logic). Each connector fetches from an external API and returns Pydantic schema objects:
  - `stock.py` — Yahoo Finance for KR stocks (058610.KS, 247540.KQ, 068270.KS) and US stocks (GOOG, NVDA). Has fallback chain for intraday data.
  - `upbit.py` — Upbit REST API for 7 crypto pairs (BTC, ETH, SOL, XRP, LINK, SUI, ONDO)
  - `news.py` — NewsAPI (if key set) → Google News RSS → mock fallback
  - `metals.py`, `exchange_rate.py`, `market_index.py`
- `app/schemas/market.py` — Pydantic models, all API responses use `ApiResponse[T]` wrapper (`{"data": T, "status": "success"}`)
- `app/core/config.py` — Settings via pydantic-settings, reads `.env`

### Frontend Structure

- `src/app/` — Next.js App Router. Single page app: `page.tsx` renders `<Dashboard />`, `providers.tsx` sets up TanStack QueryClient.
- `src/components/dashboard/Dashboard.tsx` — Main layout composing all widgets in a 12-column grid
- `src/components/widgets/` — One widget per market type, each uses a hook from `useMarketData.ts`
- `src/hooks/useMarketData.ts` — TanStack Query hooks wrapping `marketApi` calls, with `refetchInterval` (30s for stocks/crypto, 60s for metals/exchange/news)
- `src/hooks/useTickerSettings.ts` — localStorage-persisted ticker enable/disable per category (domestic/foreign/crypto)
- `src/services/api.ts` — Thin fetch wrapper, all endpoints defined in `marketApi` object. Base URL from `NEXT_PUBLIC_API_URL` env var (default `http://localhost:8000`)
- `src/types/market.ts` — TypeScript interfaces mirroring backend Pydantic schemas
- `src/components/common/Card.tsx` — Shared card component with optional `accent` prop for colored left border
- `src/components/charts/StockChartWidget.tsx` — TradingView Lightweight Charts, handles both intraday (Unix timestamps) and daily (date strings)

### API Endpoints

All under `/api/v1`:

| Endpoint | Description |
|---|---|
| `GET /stocks/domestic` | Korean stock quotes |
| `GET /stocks/foreign` | US stock quotes |
| `GET /stocks/{symbol}/detail` | Detailed info + 52-week range |
| `GET /stocks/{symbol}/chart?period=` | OHLC data (1D/1W/1M/3M/1Y) |
| `GET /crypto/quotes` | 7 crypto pairs from Upbit |
| `GET /metals/quotes` | Gold/silver prices |
| `GET /exchange/rates` | USD/KRW, JPY, EUR, CNY |
| `GET /indices/quotes` | KOSPI, KOSDAQ, Dow, Nasdaq |
| `GET /news?limit=` | Financial news articles |

## Key Conventions

- **Korean market colors**: red (상승/up `#ef4444`) for price increase, blue (하락/down `#3b82f6`) for decrease — opposite of US convention
- **Currency display**: Korean stocks in KRW (no decimals), US stocks in USD (2 decimals)
- **Yahoo Finance symbols**: Korean stocks need suffix mapping (058610 → 058610.KS, 247540 → 247540.KQ)
- **Intraday chart data**: Backend returns ISO datetime strings with `T` (e.g. `2026-01-30T14:30`) for intraday intervals; frontend detects `T` and converts to Unix timestamps for lightweight-charts
- **Tests use real API calls**: Backend tests in `test_connectors.py` hit live external APIs (Yahoo Finance, Upbit, etc.) — they may be slow or flaky depending on network
