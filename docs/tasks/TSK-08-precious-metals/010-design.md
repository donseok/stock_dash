# TSK-08 귀금속 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-08 |
| 태스크명 | Precious Metals (귀금속) |
| 관련 요구사항 | FR-006 (Gold/Silver prices) |
| 우선순위 | 중간 |
| 상태 | 완료 |

## 2. 목적

금(Gold)과 은(Silver)의 실시간 시세를 대시보드 위젯으로 제공한다. metals.live API를 데이터 소스로 활용하여 USD 및 KRW 환산 가격을 표시한다.

## 3. 대상 귀금속

| 귀금속 | 심볼 | 단위 | 설명 |
|--------|------|------|------|
| Gold | XAU | USD/oz | 금 (트로이온스 기준) |
| Silver | XAG | USD/oz | 은 (트로이온스 기준) |

## 4. 아키텍처

### 4.1 시스템 구성도

```
[Frontend]                              [Backend]
PreciousMetalWidget.tsx  ──HTTP──>   /api/v1/metals/quotes
  ├─ MetalCard (Gold)                    │
  └─ MetalCard (Silver)                  ├─ MetalService
                                         ├─ Metals.live Connector
                                         │   (connectors/metals.py)
                                         └─ Cache Layer
```

### 4.2 Backend 설계

#### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/metals/quotes` | 귀금속 시세 조회 |

#### Response Schema

```json
{
  "metals": [
    {
      "symbol": "XAU",
      "name": "Gold",
      "price_usd": 2045.50,
      "price_krw": 2698000,
      "change_usd": 12.30,
      "change_percent": 0.61,
      "unit": "oz",
      "updated_at": "2026-02-02T10:00:00Z"
    },
    {
      "symbol": "XAG",
      "name": "Silver",
      "price_usd": 23.15,
      "price_krw": 30500,
      "change_usd": -0.25,
      "change_percent": -1.07,
      "unit": "oz",
      "updated_at": "2026-02-02T10:00:00Z"
    }
  ],
  "count": 2
}
```

#### Metals.live Connector

```python
# connectors/metals.py
class MetalsConnector:
    BASE_URL = "https://api.metals.live/v1"

    async def get_spot_prices(self) -> list[dict]:
        """metals.live API에서 현물가 조회"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.BASE_URL}/spot")
            data = response.json()
            return self._parse_prices(data)

    def _parse_prices(self, data: list) -> list[dict]:
        result = []
        for item in data:
            if item.get("gold") is not None:
                result.append({"symbol": "XAU", "name": "Gold", "price": item["gold"]})
            if item.get("silver") is not None:
                result.append({"symbol": "XAG", "name": "Silver", "price": item["silver"]})
        return result
```

### 4.3 Frontend 설계

#### 컴포넌트 구조

```
PreciousMetalWidget
├── WidgetHeader ("귀금속")
├── MetalCard (Gold)
│   ├── MetalIcon + Name
│   ├── PriceUSD ($2,045.50 /oz)
│   ├── PriceKRW (₩2,698,000 /oz)
│   └── ChangeInfo
└── MetalCard (Silver)
    ├── MetalIcon + Name
    ├── PriceUSD ($23.15 /oz)
    ├── PriceKRW (₩30,500 /oz)
    └── ChangeInfo
```

#### 주요 Props

```typescript
interface PreciousMetalWidgetProps {
  refreshInterval?: number;  // ms, default: 60000
  showKRW?: boolean;         // KRW 환산 가격 표시 여부
}
```

## 5. 데이터 흐름

1. PreciousMetalWidget 마운트 시 `/api/v1/metals/quotes` 호출
2. Backend에서 metals.live API로 금/은 현물가 조회
3. KRW 환산은 TSK-09 (환율) 데이터 활용
4. MetalCard에 매핑하여 렌더링
5. 60초 간격 자동 갱신

## 6. 캐시 전략

| 데이터 | TTL | 사유 |
|--------|-----|------|
| 귀금속 현물가 | 60초 | 분 단위 변동 |
| 환율 데이터 | 300초 | TSK-09 캐시 활용 |

## 7. 에러 처리

| 에러 상황 | HTTP 코드 | 처리 방식 |
|-----------|----------|-----------|
| metals.live 장애 | 503 | 캐시 데이터 반환, stale 표시 |
| 환율 데이터 없음 | 200 | USD만 표시, KRW 숨김 |
| 데이터 파싱 실패 | 500 | 에러 로그 + 캐시 반환 |
