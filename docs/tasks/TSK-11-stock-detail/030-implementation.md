# TSK-11 종목 상세정보 패널 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-11 |
| 관련 요구사항 | FR-011 (Stock Detail Information Panel) |
| 구현 상태 | 완료 |
| Backend 테스트 | 28/28 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | 변경 유형 |
|-----------|------|-----------|
| `backend/app/schemas/market.py` | StockDetail Pydantic 스키마 추가 | 수정 |
| `backend/app/connectors/stock.py` | `fetch_stock_detail()` 함수 추가 | 수정 |
| `backend/app/api/v1/stocks.py` | `GET /api/v1/stocks/{symbol}/detail` 엔드포인트 추가 | 수정 |
| `backend/tests/test_api.py` | `test_stock_detail` 테스트 추가 | 수정 |
| `backend/tests/test_connectors.py` | `test_stock_detail_connector` 테스트 추가 | 수정 |
| `backend/tests/test_schemas.py` | `test_stock_detail_schema` 테스트 추가 | 수정 |

### 2.2 Frontend

| 파일 경로 | 설명 | 변경 유형 |
|-----------|------|-----------|
| `frontend/src/types/market.ts` | `StockDetail` 인터페이스 추가 | 수정 |
| `frontend/src/services/api.ts` | `getStockDetail()` API 함수 추가 | 수정 |
| `frontend/src/hooks/useMarketData.ts` | `useStockDetail()` Hook 추가 | 수정 |
| `frontend/src/components/widgets/StockDetailPanel.tsx` | StockDetailPanel 컴포넌트 생성 | 신규 |
| `frontend/src/components/dashboard/Dashboard.tsx` | StockDetailPanel 대시보드 통합 | 수정 |

## 3. 핵심 구현 내용

### 3.1 Backend - StockDetail Schema

```python
# backend/app/schemas/market.py
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
```

### 3.2 Backend - fetch_stock_detail() Connector

```python
# backend/app/connectors/stock.py
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
            prev = meta.get("previousClose", price)
            change = round(price - prev, 2)
            pct = round((change / prev) * 100, 2) if prev else 0

            # Calculate 52-week high/low from historical data
            indicators = result.get("indicators", {})
            ohlc = indicators.get("quote", [{}])[0]
            highs = [h for h in ohlc.get("high", []) if h is not None]
            lows = [lo for lo in ohlc.get("low", []) if lo is not None]

            week52_high = max(highs) if highs else price
            week52_low = min(lows) if lows else price

            return StockDetail(
                symbol=symbol,
                name=name,
                price=price,
                change=change,
                changePercent=pct,
                volume=int(meta.get("regularMarketVolume", 0)),
                high=meta.get("regularMarketDayHigh", price),
                low=meta.get("regularMarketDayLow", price),
                open=meta.get("regularMarketOpen", price),
                prevClose=prev,
                week52High=round(week52_high, 2),
                week52Low=round(week52_low, 2),
                marketCap=meta.get("marketCap"),
                market=market,
                timestamp=now,
            )
    except Exception:
        return None
```

### 3.3 Backend - API Endpoint

```python
# backend/app/api/v1/stocks.py
@router.get("/{symbol}/detail")
async def get_stock_detail(symbol: str):
    """Get detailed stock information including 52-week high/low."""
    detail = await fetch_stock_detail(symbol)
    if detail is None:
        return {
            "data": None,
            "status": "error",
            "message": "Stock not found or data unavailable",
            "timestamp": utcnow_iso(),
        }
    return {
        "data": detail.model_dump(),
        "status": "success",
        "timestamp": utcnow_iso(),
    }
```

### 3.4 Frontend - StockDetail Interface

```typescript
// frontend/src/types/market.ts
export interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  week52High: number;
  week52Low: number;
  marketCap?: number;
  market: "KR" | "US";
  timestamp: string;
}
```

### 3.5 Frontend - API Service

```typescript
// frontend/src/services/api.ts
getStockDetail: (symbol: string) =>
  fetchApi<{ data: import("@/types/market").StockDetail }>(
    `/api/v1/stocks/${symbol}/detail`
  ),
```

### 3.6 Frontend - useStockDetail Hook

```typescript
// frontend/src/hooks/useMarketData.ts
export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ["stock", "detail", symbol],
    queryFn: () => marketApi.getStockDetail(symbol),
    select: (res) => res.data,
    enabled: !!symbol,
  });
}
```

### 3.7 Frontend - StockDetailPanel 컴포넌트

```typescript
// frontend/src/components/widgets/StockDetailPanel.tsx
const SYMBOLS = [
  { symbol: "058610", name: "에스피지", market: "KR" as const },
  { symbol: "247540", name: "에코프로", market: "KR" as const },
  { symbol: "068270", name: "셀트리온", market: "KR" as const },
  { symbol: "GOOG", name: "Alphabet C", market: "US" as const },
  { symbol: "FIGM", name: "Figma", market: "US" as const },
];

export function StockDetailPanel() {
  const [selected, setSelected] = useState(SYMBOLS[0]);
  const { data: detail, isLoading, error, refetch } = useStockDetail(selected.symbol);
  const currency = selected.market === "KR" ? "KRW" : "USD";

  return (
    <Card title="종목 상세정보">
      {/* 종목 선택 버튼 그룹 */}
      {/* 현재가 및 등락 표시 */}
      {/* DetailRow 목록: 시가/고가/저가/전일종가/거래량/52주 최고/52주 최저/시가총액 */}
    </Card>
  );
}
```

### 3.8 Dashboard 통합

```typescript
// frontend/src/components/dashboard/Dashboard.tsx
import { StockDetailPanel } from "@/components/widgets/StockDetailPanel";

// 12컬럼 그리드에서 4컬럼 차지
<div className="lg:col-span-4">
  <StockDetailPanel />
</div>
```

## 4. API 명세

### GET `/api/v1/stocks/{symbol}/detail`

**Request:**
```
GET /api/v1/stocks/058610/detail
GET /api/v1/stocks/GOOG/detail
```

**Response (200 - Success):**
```json
{
  "data": {
    "symbol": "058610",
    "name": "에스피지",
    "price": 35000,
    "change": 500,
    "changePercent": 1.45,
    "volume": 123456,
    "high": 35500,
    "low": 34500,
    "open": 34800,
    "prevClose": 34500,
    "week52High": 42000,
    "week52Low": 28000,
    "marketCap": 500000000000,
    "market": "KR",
    "timestamp": "2026-02-02T09:30:00Z"
  },
  "status": "success",
  "timestamp": "2026-02-02T09:30:00Z"
}
```

**Response (200 - Error):**
```json
{
  "data": null,
  "status": "error",
  "message": "Stock not found or data unavailable",
  "timestamp": "2026-02-02T09:30:00Z"
}
```

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 52주 계산 방식 | Yahoo Finance 1년치 OHLC 데이터에서 직접 계산 | meta 필드에 52주 데이터 없음 |
| API range 파라미터 | `1y` (1년) | 52주 = 약 1년 |
| 타임아웃 | 10초 | 1년치 데이터 조회로 일반 시세보다 오래 걸림 |
| 에러 응답 | HTTP 200 + status "error" | 프론트엔드 일관성 유지 |
| 통화 분기 | market 필드 기반 KRW/USD | 국내/해외 자동 구분 |
| marketCap | Optional 필드 | Yahoo Finance에서 제공하지 않는 경우 존재 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend (전체) | 28 | 28 | 0 | 100% |
| Frontend 빌드 | - | 성공 | - | - |
| **합계** | **28** | **28 PASS + 빌드 성공** | **0** | **100%** |
