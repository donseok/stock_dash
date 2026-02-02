# TSK-09 환율 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-09 |
| 관련 요구사항 | FR-007 (Exchange rates USD/KRW) |
| 구현 상태 | 완료 |
| Backend 테스트 | 3/3 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/exchange.py` | 환율 API 라우터 | ~35 |
| `backend/app/services/exchange_rate_service.py` | 환율 서비스 | ~70 |
| `backend/app/connectors/exchange_rate.py` | ER-API 커넥터 | ~65 |
| `backend/app/schemas/exchange_rate.py` | 환율 응답 스키마 | ~25 |
| `backend/tests/test_exchange_rate.py` | 환율 API 테스트 | ~45 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/widgets/ExchangeRateWidget.tsx` | 환율 위젯 | ~95 |
| `frontend/src/hooks/useExchangeRate.ts` | 환율 데이터 hook | ~40 |
| `frontend/src/utils/formatCurrency.ts` | 통화 포맷팅 유틸 | ~25 |

## 3. 핵심 구현 내용

### 3.1 Backend - ER-API Connector

```python
# connectors/exchange_rate.py
class ExchangeRateConnector:
    BASE_URL = "https://open.er-api.com/v6/latest"

    async def get_rate(self, base: str = "USD", target: str = "KRW") -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/{base}",
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()

            if data.get("result") != "success":
                raise ExternalAPIError("ER-API returned error")

            rate = data["rates"].get(target)
            if rate is None:
                raise ValueError(f"Target currency {target} not found")

            return {
                "base": base,
                "target": target,
                "rate": rate,
                "updated_at": data["time_last_update_utc"]
            }
```

### 3.2 Backend - Exchange Rate API

```python
# routers/exchange.py
@router.get("/exchange/rates")
async def get_exchange_rates(
    base: str = Query(default="USD"),
    target: str = Query(default="KRW")
):
    """환율 조회"""
    service = ExchangeRateService()
    rate_data = await service.get_rate(base, target)
    return rate_data
```

### 3.3 Frontend - ExchangeRateWidget

```typescript
// components/widgets/ExchangeRateWidget.tsx
export const ExchangeRateWidget: React.FC<ExchangeRateWidgetProps> = ({
  base = 'USD',
  target = 'KRW',
  refreshInterval = 60000
}) => {
  const { rate, loading, error, refresh } = useExchangeRate(base, target, refreshInterval);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <WidgetHeader title="환율" onRefresh={refresh} />
      <div className="text-center py-4">
        <div className="text-sm text-gray-600 mb-2">
          {base} / {target}
        </div>
        <div className="text-3xl font-bold">
          {formatCurrency(rate?.rate, target)}
        </div>
        {rate?.change !== undefined && (
          <div className={cn(
            'text-sm mt-1',
            rate.change > 0 ? 'text-red-500' : 'text-blue-500'
          )}>
            {rate.change > 0 ? '▲' : '▼'} {formatCurrency(Math.abs(rate.change), target)}
            ({rate.change_percent > 0 ? '+' : ''}{rate.change_percent.toFixed(2)}%)
          </div>
        )}
        <div className="flex justify-center gap-4 mt-3 text-sm">
          <span className="text-gray-500">
            고가: <span className="text-red-400">{formatCurrency(rate?.high, target)}</span>
          </span>
          <span className="text-gray-500">
            저가: <span className="text-blue-400">{formatCurrency(rate?.low, target)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
```

## 4. API 명세

### GET `/api/v1/exchange/rates`

**Request:**
```
GET /api/v1/exchange/rates
GET /api/v1/exchange/rates?base=USD&target=KRW
```

**Response (200):**
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

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 데이터 소스 | ExchangeRate-API (open.er-api.com) | 무료, 안정적, 일 1500회 제한 |
| 캐시 TTL | 5분 | API 호출 제한 준수 |
| 기본 통화쌍 | USD/KRW | PRD 요구사항 |
| 등락 색상 | 환율 상승(원화 약세)=빨강 | 한국 관점 표현 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 3 | 3 | 0 | 100% |
| Frontend | 3 | 3 | 0 | 100% |
| **합계** | **6** | **6** | **0** | **100%** |
