# TSK-04 주식 차트 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-04 |
| 태스크명 | Stock Chart (주식 차트) |
| 관련 요구사항 | FR-002 (Real-time stock charts) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

사용자가 주식 종목의 가격 변동을 시각적으로 확인할 수 있는 차트 위젯을 제공한다. TradingView Lightweight Charts 라이브러리를 활용하여 캔들스틱 차트 및 라인 차트를 렌더링하며, 기간 선택 및 심볼 전환 기능을 지원한다.

## 3. 아키텍처

### 3.1 시스템 구성도

```
[Frontend]                          [Backend]
StockChartWidget.tsx  ──HTTP──>  /api/v1/stocks/{symbol}/chart
  ├─ CandlestickChart                  │
  ├─ LineChart                         ├─ ChartService
  ├─ PeriodSelector                    ├─ Yahoo Finance Connector
  └─ SymbolSwitcher                    └─ Cache Layer (Redis)
```

### 3.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/stocks/{symbol}/chart` | 차트 데이터 조회 |

#### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| period | string | `1M` | 조회 기간 (1D, 1W, 1M, 3M, 6M, 1Y, 5Y) |
| interval | string | `1d` | 데이터 간격 (1m, 5m, 15m, 1h, 1d, 1wk) |
| chart_type | string | `candlestick` | 차트 유형 (candlestick, line) |

#### Response Schema

```json
{
  "symbol": "005930",
  "name": "삼성전자",
  "period": "1M",
  "interval": "1d",
  "data": [
    {
      "timestamp": "2026-01-02T00:00:00Z",
      "open": 78000,
      "high": 79500,
      "low": 77500,
      "close": 79000,
      "volume": 15234567
    }
  ],
  "metadata": {
    "currency": "KRW",
    "exchange": "KRX",
    "total_count": 30
  }
}
```

#### 서비스 레이어

- `ChartService`: 차트 데이터 조회 및 가공 로직
- 캐시 전략: 일봉 데이터는 15분, 분봉 데이터는 1분 TTL

### 3.3 Frontend 설계

#### 컴포넌트 구조

```
StockChartWidget
├── ChartHeader (종목명, 현재가 표시)
├── ChartCanvas (TradingView Lightweight Charts)
│   ├── CandlestickSeries
│   └── LineSeries
├── PeriodSelector (1D | 1W | 1M | 3M | 6M | 1Y | 5Y)
└── SymbolSwitcher (종목 전환 드롭다운)
```

#### 주요 Props

```typescript
interface StockChartWidgetProps {
  symbol: string;
  chartType?: 'candlestick' | 'line';
  defaultPeriod?: string;
  height?: number;
  width?: number;
  onSymbolChange?: (symbol: string) => void;
}
```

## 4. 데이터 흐름

1. 사용자가 종목/기간을 선택한다.
2. Frontend에서 `/api/v1/stocks/{symbol}/chart?period={period}` API를 호출한다.
3. Backend는 캐시를 확인하고, 없으면 Yahoo Finance API에서 데이터를 조회한다.
4. 응답 데이터를 TradingView Lightweight Charts 형식으로 변환하여 렌더링한다.
5. 기간 변경 시 자동으로 적절한 interval이 설정된다 (1D -> 1m, 1M -> 1d 등).

## 5. 의존성

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| lightweight-charts | ^4.x | TradingView 차트 렌더링 |
| React | ^18.x | UI 프레임워크 |
| FastAPI | ^0.100+ | Backend API 프레임워크 |
| yfinance | ^0.2.x | Yahoo Finance 데이터 조회 |

## 6. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| 유효하지 않은 심볼 | 404 | "종목을 찾을 수 없습니다" 메시지 |
| 외부 API 장애 | 503 | 캐시된 데이터 사용, 없으면 에러 표시 |
| 잘못된 기간 파라미터 | 400 | 기본값(1M)으로 대체 |
| 데이터 없음 | 200 | 빈 차트 + "데이터 없음" 안내 |
