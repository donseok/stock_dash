# TSK-06 해외 시장 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-06 |
| 태스크명 | Foreign Markets (해외 시장) |
| 관련 요구사항 | FR-004 (Foreign stocks), FR-009 (Foreign indices) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

해외 주식(Alphabet C)과 해외 지수(DOW, NASDAQ)의 시세 정보를 대시보드에 제공한다. ForeignStockWidget으로 개별 해외 종목 시세를, MarketIndicesBar로 해외 지수를 표시한다.

## 3. 대상 종목/지수

### 3.1 해외 주식

| 종목명 | 심볼 | 거래소 |
|--------|------|--------|
| Alphabet C | GOOG | NASDAQ |

### 3.2 해외 지수

| 지수명 | 심볼 | 설명 |
|--------|------|------|
| DOW Jones | ^DJI | 다우존스 산업평균지수 |
| NASDAQ Composite | ^IXIC | 나스닥 종합지수 |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend]                              [Backend]
ForeignStockWidget.tsx  ──HTTP──>    /api/v1/stocks/foreign
MarketIndicesBar.tsx    ──HTTP──>    /api/v1/indices/quotes
                                        │
                                        ├─ ForeignMarketService
                                        ├─ Yahoo Finance Connector
                                        └─ Cache Layer
```

### 4.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/stocks/foreign` | 해외 주식 시세 조회 |
| GET | `/api/v1/indices/quotes` | 시장 지수 조회 |

#### `/api/v1/stocks/foreign` Response

```json
{
  "stocks": [
    {
      "symbol": "GOOG",
      "name": "Alphabet Inc. (Class C)",
      "price": 178.25,
      "change": 2.15,
      "change_percent": 1.22,
      "volume": 23456789,
      "market_cap": 2200000000000,
      "currency": "USD",
      "exchange": "NASDAQ",
      "updated_at": "2026-02-01T20:00:00Z"
    }
  ],
  "count": 1
}
```

#### `/api/v1/indices/quotes` Response

```json
{
  "indices": [
    {
      "symbol": "^DJI",
      "name": "DOW Jones Industrial Average",
      "value": 44250.50,
      "change": 125.30,
      "change_percent": 0.28,
      "updated_at": "2026-02-01T20:00:00Z"
    },
    {
      "symbol": "^IXIC",
      "name": "NASDAQ Composite",
      "value": 19850.75,
      "change": -45.20,
      "change_percent": -0.23,
      "updated_at": "2026-02-01T20:00:00Z"
    }
  ],
  "count": 2
}
```

### 4.3 Frontend 설계

#### ForeignStockWidget 구조

```
ForeignStockWidget
├── WidgetHeader ("해외 주식")
└── StockCard (Alphabet C)
    ├── StockName + Symbol
    ├── CurrentPrice (USD)
    ├── ChangeInfo
    └── VolumeInfo
```

#### MarketIndicesBar 구조 (해외 지수 부분)

```
MarketIndicesBar
├── IndexBadge (DOW)
│   ├── IndexName
│   ├── IndexValue
│   └── ChangeInfo
└── IndexBadge (NASDAQ)
    ├── IndexName
    ├── IndexValue
    └── ChangeInfo
```

#### Props

```typescript
interface ForeignStockWidgetProps {
  refreshInterval?: number;
  onStockClick?: (symbol: string) => void;
}

interface MarketIndicesBarProps {
  type?: 'domestic' | 'foreign' | 'all';
  refreshInterval?: number;
}
```

## 5. 데이터 흐름

1. ForeignStockWidget 마운트 시 `/api/v1/stocks/foreign` 호출
2. MarketIndicesBar 마운트 시 `/api/v1/indices/quotes?type=foreign` 호출
3. Backend에서 Yahoo Finance로 해외 종목/지수 데이터 조회
4. USD 가격 표시, 환율 정보는 TSK-09와 연동 가능
5. 30초 간격 자동 갱신

## 6. 시간대 처리

| 시장 | 거래 시간 (현지) | 한국 시간 |
|------|----------------|----------|
| NYSE/NASDAQ | 09:30-16:00 ET | 23:30-06:00 KST (다음날) |

- 장외 시간에는 마지막 종가 표시 + "장 마감" 레이블
- Pre/After market 데이터는 별도 표시하지 않음

## 7. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| Yahoo Finance 장애 | 503 | 캐시 데이터 반환 |
| 잘못된 심볼 | 400 | 유효하지 않은 심볼 안내 |
| 네트워크 타임아웃 | 504 | 재시도 후 캐시 반환 |
