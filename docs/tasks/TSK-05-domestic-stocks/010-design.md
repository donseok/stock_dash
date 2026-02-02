# TSK-05 국내 주식 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-05 |
| 태스크명 | Domestic Stocks (국내 주식) |
| 관련 요구사항 | FR-003 (Domestic stocks) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

국내 주요 주식 종목(삼성전자, 에코프로, 셀트리온)의 실시간 시세 정보를 대시보드 위젯 형태로 제공한다. Yahoo Finance API를 통해 데이터를 조회하고, 가격/등락/거래량 정보를 표시한다.

## 3. 대상 종목

| 종목명 | 종목 코드 | Yahoo Symbol | 시장 |
|--------|----------|-------------|------|
| 삼성전자 | 005930 | 005930.KS | KOSPI |
| 에코프로 | 247540 | 247540.KQ | KOSDAQ |
| 셀트리온 | 068270 | 068270.KS | KOSPI |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend]                          [Backend]
DomesticStockWidget.tsx  ──HTTP──>  /api/v1/stocks/domestic
  ├─ StockCard (삼성전자)               │
  ├─ StockCard (에코프로)               ├─ DomesticStockService
  └─ StockCard (셀트리온)               ├─ Yahoo Finance Connector
                                        └─ Cache Layer
```

### 4.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/stocks/domestic` | 국내 주식 시세 조회 |

#### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| symbols | string | (전체) | 콤마 구분 종목 코드 필터 |

#### Response Schema

```json
{
  "stocks": [
    {
      "symbol": "005930",
      "name": "삼성전자",
      "price": 79000,
      "change": 1200,
      "change_percent": 1.54,
      "volume": 15234567,
      "market_cap": 471234567890000,
      "high": 79500,
      "low": 77500,
      "open": 78000,
      "prev_close": 77800,
      "currency": "KRW",
      "exchange": "KRX",
      "updated_at": "2026-02-02T09:30:00Z"
    }
  ],
  "count": 3
}
```

#### Yahoo Finance Connector

```python
class YahooFinanceConnector:
    DOMESTIC_SYMBOLS = {
        "005930": "005930.KS",
        "247540": "247540.KQ",
        "068270": "068270.KS"
    }

    async def get_quotes(self, symbols: list[str]) -> list[StockQuote]:
        """여러 종목의 시세를 일괄 조회"""
        yahoo_symbols = [self.DOMESTIC_SYMBOLS[s] for s in symbols]
        # yfinance download로 일괄 조회
        ...
```

### 4.3 Frontend 설계

#### 컴포넌트 구조

```
DomesticStockWidget
├── WidgetHeader ("국내 주식")
├── StockCard (삼성전자)
│   ├── StockName + Symbol
│   ├── CurrentPrice
│   ├── ChangeInfo (금액/퍼센트)
│   └── VolumeInfo
├── StockCard (에코프로)
└── StockCard (셀트리온)
```

#### 주요 Props

```typescript
interface DomesticStockWidgetProps {
  symbols?: string[];
  refreshInterval?: number;  // ms, default: 30000
  onStockClick?: (symbol: string) => void;
}
```

## 5. 데이터 흐름

1. DomesticStockWidget 마운트 시 `/api/v1/stocks/domestic` API 호출
2. Backend에서 Yahoo Finance로 3개 종목 시세 일괄 조회
3. 응답 데이터를 StockCard 컴포넌트에 매핑하여 렌더링
4. `refreshInterval` (기본 30초)마다 자동 갱신
5. StockCard 클릭 시 상세 페이지 또는 차트 위젯으로 연동

## 6. 캐시 전략

| 데이터 | TTL | 사유 |
|--------|-----|------|
| 장중 시세 | 30초 | 실시간성 유지 |
| 장 마감 후 시세 | 1시간 | 변동 없음 |
| 종목 메타데이터 | 24시간 | 거의 변동 없음 |

## 7. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| Yahoo Finance 장애 | 503 | 캐시 데이터 반환, stale 표시 |
| 종목 코드 불일치 | 400 | 유효하지 않은 종목 필터 |
| 장외 시간 | 200 | 마지막 종가 표시 + "장 마감" 표시 |
