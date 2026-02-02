# TSK-10 시장 지수 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-10 |
| 태스크명 | Market Indices (시장 지수) |
| 관련 요구사항 | FR-008 (Domestic indices), FR-009 (Foreign indices) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

국내 지수(KOSPI, KOSDAQ)와 해외 지수(DOW, NASDAQ)를 대시보드 상단 인디케이터 바로 표시한다. MarketIndicesBar 컴포넌트로 모든 지수를 한 줄에 표시하며, 백엔드 market_index connector를 통해 데이터를 조회한다.

## 3. 대상 지수

### 3.1 국내 지수

| 지수명 | 심볼 | Yahoo Symbol | 설명 |
|--------|------|-------------|------|
| KOSPI | ^KS11 | ^KS11 | 코스피 종합지수 |
| KOSDAQ | ^KQ11 | ^KQ11 | 코스닥 종합지수 |

### 3.2 해외 지수

| 지수명 | 심볼 | Yahoo Symbol | 설명 |
|--------|------|-------------|------|
| DOW | ^DJI | ^DJI | 다우존스 산업평균 |
| NASDAQ | ^IXIC | ^IXIC | 나스닥 종합 |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend]                              [Backend]
MarketIndicesBar.tsx    ──HTTP──>    /api/v1/indices/quotes
  ├─ IndexBadge (KOSPI)                 │
  ├─ IndexBadge (KOSDAQ)                ├─ MarketIndexService
  ├─ IndexBadge (DOW)                   ├─ Market Index Connector
  └─ IndexBadge (NASDAQ)                │   (connectors/market_index.py)
                                        └─ Cache Layer
```

### 4.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/indices/quotes` | 시장 지수 조회 |

#### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| type | string | `all` | 지수 유형 (domestic, foreign, all) |

#### Response Schema

```json
{
  "indices": [
    {
      "symbol": "^KS11",
      "name": "KOSPI",
      "display_name": "코스피",
      "value": 2650.25,
      "change": 15.30,
      "change_percent": 0.58,
      "type": "domestic",
      "currency": "KRW",
      "updated_at": "2026-02-02T15:30:00Z"
    },
    {
      "symbol": "^KQ11",
      "name": "KOSDAQ",
      "display_name": "코스닥",
      "value": 865.40,
      "change": -3.25,
      "change_percent": -0.37,
      "type": "domestic",
      "currency": "KRW",
      "updated_at": "2026-02-02T15:30:00Z"
    },
    {
      "symbol": "^DJI",
      "name": "DOW",
      "display_name": "다우존스",
      "value": 44250.50,
      "change": 125.30,
      "change_percent": 0.28,
      "type": "foreign",
      "currency": "USD",
      "updated_at": "2026-02-01T20:00:00Z"
    },
    {
      "symbol": "^IXIC",
      "name": "NASDAQ",
      "display_name": "나스닥",
      "value": 19850.75,
      "change": -45.20,
      "change_percent": -0.23,
      "type": "foreign",
      "currency": "USD",
      "updated_at": "2026-02-01T20:00:00Z"
    }
  ],
  "count": 4
}
```

#### Market Index Connector

```python
# connectors/market_index.py
class MarketIndexConnector:
    INDICES = {
        "domestic": ["^KS11", "^KQ11"],
        "foreign": ["^DJI", "^IXIC"]
    }
    INDEX_NAMES = {
        "^KS11": {"name": "KOSPI", "display": "코스피"},
        "^KQ11": {"name": "KOSDAQ", "display": "코스닥"},
        "^DJI": {"name": "DOW", "display": "다우존스"},
        "^IXIC": {"name": "NASDAQ", "display": "나스닥"},
    }

    async def get_indices(self, type_filter: str = "all") -> list[dict]:
        """Yahoo Finance에서 지수 데이터 조회"""
        symbols = self._get_symbols(type_filter)
        tickers = yf.Tickers(" ".join(symbols))
        return [self._to_index(sym, tickers) for sym in symbols]
```

### 4.3 Frontend 설계

#### 컴포넌트 구조

```
MarketIndicesBar
├── IndexBadge (KOSPI)     [국내]
├── IndexBadge (KOSDAQ)    [국내]
├── Divider
├── IndexBadge (DOW)       [해외]
└── IndexBadge (NASDAQ)    [해외]
```

#### 주요 Props

```typescript
interface MarketIndicesBarProps {
  type?: 'domestic' | 'foreign' | 'all';
  refreshInterval?: number;  // ms, default: 30000
}
```

## 5. 데이터 흐름

1. MarketIndicesBar 마운트 시 `/api/v1/indices/quotes` 호출
2. Backend에서 Yahoo Finance로 4개 지수 데이터 일괄 조회
3. 국내/해외 구분하여 IndexBadge에 매핑
4. 30초 간격 자동 갱신

## 6. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| Yahoo Finance 장애 | 503 | 캐시 데이터 반환 |
| 일부 지수 조회 실패 | 200 | 성공한 지수만 반환, 실패 지수 캐시 활용 |
| 전체 조회 실패 | 503 | "데이터 불러오기 실패" 표시 |
