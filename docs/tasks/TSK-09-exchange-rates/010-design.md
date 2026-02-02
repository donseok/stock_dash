# TSK-09 환율 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-09 |
| 태스크명 | Exchange Rates (환율) |
| 관련 요구사항 | FR-007 (Exchange rates USD/KRW) |
| 우선순위 | 높음 |
| 상태 | 완료 |

## 2. 목적

USD/KRW 환율 정보를 대시보드 위젯으로 제공한다. er-api(ExchangeRate-API)를 데이터 소스로 활용하며, 다른 위젯(TSK-08 귀금속 등)에서 KRW 환산에 활용할 수 있도록 API를 제공한다.

## 3. 대상 환율

| 통화쌍 | 설명 | 소스 |
|--------|------|------|
| USD/KRW | 미국 달러 / 한국 원 | ExchangeRate-API |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend]                              [Backend]
ExchangeRateWidget.tsx  ──HTTP──>    /api/v1/exchange/rates
                                        │
                                        ├─ ExchangeRateService
                                        ├─ ER-API Connector
                                        │   (connectors/exchange_rate.py)
                                        └─ Cache Layer
```

### 4.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/exchange/rates` | 환율 조회 |

#### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| base | string | `USD` | 기준 통화 |
| target | string | `KRW` | 대상 통화 |

#### Response Schema

```json
{
  "base": "USD",
  "target": "KRW",
  "rate": 1318.50,
  "change": 2.30,
  "change_percent": 0.17,
  "high": 1322.00,
  "low": 1315.80,
  "updated_at": "2026-02-02T09:00:00Z",
  "source": "ExchangeRate-API"
}
```

#### ER-API Connector

```python
# connectors/exchange_rate.py
class ExchangeRateConnector:
    BASE_URL = "https://open.er-api.com/v6/latest"

    async def get_rate(self, base: str = "USD", target: str = "KRW") -> dict:
        """ExchangeRate-API에서 환율 조회"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.BASE_URL}/{base}")
            data = response.json()
            rate = data["rates"].get(target)
            return {
                "base": base,
                "target": target,
                "rate": rate,
                "updated_at": data["time_last_update_utc"]
            }
```

### 4.3 Frontend 설계

#### 컴포넌트 구조

```
ExchangeRateWidget
├── WidgetHeader ("환율")
├── RateDisplay
│   ├── CurrencyPair (USD/KRW)
│   ├── CurrentRate (₩1,318.50)
│   ├── ChangeInfo (▲ +₩2.30, +0.17%)
│   └── HighLow (고: ₩1,322.00 / 저: ₩1,315.80)
└── UpdatedTime
```

#### 주요 Props

```typescript
interface ExchangeRateWidgetProps {
  base?: string;      // default: 'USD'
  target?: string;    // default: 'KRW'
  refreshInterval?: number;  // ms, default: 60000
}
```

## 5. 데이터 흐름

1. ExchangeRateWidget 마운트 시 `/api/v1/exchange/rates` 호출
2. Backend에서 ER-API로 USD/KRW 환율 조회
3. 전일 대비 등락 계산 (전일 종가 캐시 활용)
4. 위젯에 환율 정보 렌더링
5. 60초 간격 자동 갱신

## 6. 캐시 전략

| 데이터 | TTL | 사유 |
|--------|-----|------|
| 환율 데이터 | 300초 (5분) | ER-API 무료 플랜 제한 |
| 전일 종가 | 24시간 | 등락 계산 기준 |

## 7. 다른 위젯 연동

ExchangeRateService는 다른 위젯에서 KRW 환산에 활용된다:

| 연동 태스크 | 활용 방식 |
|------------|----------|
| TSK-08 귀금속 | USD 가격을 KRW로 환산 |
| TSK-06 해외 시장 | USD 가격 참고 환율 |

## 8. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| ER-API 장애 | 503 | 캐시 데이터 반환 |
| 지원하지 않는 통화 | 400 | 유효하지 않은 통화 안내 |
| Rate Limit | 429 | 캐시 반환 (무료 플랜 제한) |
