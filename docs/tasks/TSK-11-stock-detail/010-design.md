# TSK-11 종목 상세정보 패널 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-11 |
| 태스크명 | Stock Detail Information Panel (종목 상세정보 패널) |
| 관련 요구사항 | FR-011 (Stock Detail) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

개별 종목(국내주식 3종, 해외주식 2종)의 상세 시세 정보를 대시보드 패널 형태로 제공한다. 기본 시세 정보(가격, 등락, 거래량) 외에 52주 최고/최저, 시가총액 등 심층 정보를 표시하여 투자 판단에 필요한 데이터를 한눈에 확인할 수 있도록 한다.

## 3. 대상 종목

| 종목명 | 종목 코드 | Yahoo Symbol | 시장 |
|--------|----------|-------------|------|
| 에스피지 | 058610 | 058610.KS | KOSPI |
| 에코프로 | 247540 | 247540.KQ | KOSDAQ |
| 셀트리온 | 068270 | 068270.KS | KOSPI |
| Alphabet C | GOOG | GOOG | NASDAQ |
| Figma | FIGM | FIGM | NYSE |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend]                              [Backend]
StockDetailPanel.tsx  ──HTTP──>  /api/v1/stocks/{symbol}/detail
  ├─ 종목 선택 버튼 그룹                      │
  ├─ 현재가/등락 표시                         ├─ fetch_stock_detail()
  ├─ DetailRow (시가/고가/저가/...)           ├─ Yahoo Finance API (1y range)
  └─ 52주 최고/최저/시가총액                   └─ StockDetail Schema
```

### 4.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/stocks/{symbol}/detail` | 종목 상세 정보 조회 |

#### Path Parameters

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| symbol | string | 종목 코드 (예: 058610, GOOG) |

#### Response Schema (`StockDetail`)

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

#### StockDetail Pydantic Schema

```python
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

#### Yahoo Finance Connector - `fetch_stock_detail()`

```python
async def fetch_stock_detail(symbol: str) -> StockDetail | None:
    """Fetch detailed stock information including 52-week high/low."""
    # 1. symbol을 Yahoo Finance 심볼로 변환 (KR: .KS/.KQ 접미사)
    # 2. range=1y, interval=1d로 1년치 데이터 조회
    # 3. indicators.quote에서 high/low 배열 추출
    # 4. 52주 최고 = max(highs), 52주 최저 = min(lows)
    # 5. meta에서 현재가, 거래량, 시가총액 등 추출
    # 6. StockDetail 객체 반환
```

### 4.3 Frontend 설계

#### 컴포넌트 구조

```
StockDetailPanel
├── Card ("종목 상세정보")
├── SymbolSelector (버튼 그룹)
│   ├─ 에스피지 / 에코프로 / 셀트리온
│   └─ Alphabet C / Figma
├── PriceSection
│   ├── CurrentPrice (현재가)
│   └── PriceChange (등락금액/등락률)
└── DetailRows
    ├── DetailRow ("시가", value)
    ├── DetailRow ("고가", value)
    ├── DetailRow ("저가", value)
    ├── DetailRow ("전일종가", value)
    ├── DetailRow ("거래량", value)
    ├── DetailRow ("52주 최고", value)
    ├── DetailRow ("52주 최저", value)
    └── DetailRow ("시가총액", value) [조건부]
```

#### 주요 타입 및 Hook

```typescript
// types/market.ts
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

// hooks/useMarketData.ts
export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ["stock", "detail", symbol],
    queryFn: () => marketApi.getStockDetail(symbol),
    select: (res) => res.data,
    enabled: !!symbol,
  });
}
```

## 5. 데이터 흐름

1. StockDetailPanel 마운트 시 기본 종목(에스피지)으로 `/api/v1/stocks/058610/detail` 호출
2. Backend에서 Yahoo Finance API로 해당 종목의 1년치 데이터 조회 (`range=1y`)
3. 1년치 high/low 데이터에서 52주 최고/최저 계산
4. meta 정보에서 현재가, 거래량, 시가총액 등 추출하여 `StockDetail` 반환
5. Frontend에서 응답 데이터를 DetailRow 컴포넌트에 매핑하여 렌더링
6. 사용자가 다른 종목 버튼 클릭 시 해당 종목으로 재조회
7. React Query 캐싱을 통해 이미 조회한 종목은 캐시에서 즉시 표시

## 6. 캐시 전략

| 데이터 | TTL | 사유 |
|--------|-----|------|
| 종목 상세 (장중) | React Query 기본 | staleTime 기본값 활용 |
| 52주 최고/최저 | 1일 | 일 단위 변동 |
| 시가총액 | 1시간 | 거래 중 변동 가능 |

## 7. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| Yahoo Finance 장애 | 200 (data: null) | `status: "error"`, 에러 메시지 반환 |
| 존재하지 않는 종목 | 200 (data: null) | "Stock not found or data unavailable" |
| 네트워크 타임아웃 | - | 10초 타임아웃, None 반환 |
| Frontend 에러 | - | ErrorMessage 컴포넌트 + 재시도 버튼 |
