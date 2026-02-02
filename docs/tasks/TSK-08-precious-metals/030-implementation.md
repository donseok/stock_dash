# TSK-08 귀금속 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-08 |
| 관련 요구사항 | FR-006 (Gold/Silver prices) |
| 구현 상태 | 완료 |
| Backend 테스트 | 3/3 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/metals.py` | 귀금속 API 라우터 | ~35 |
| `backend/app/services/metal_service.py` | 귀금속 서비스 | ~65 |
| `backend/app/connectors/metals.py` | metals.live 커넥터 | ~75 |
| `backend/app/schemas/metal.py` | 귀금속 응답 스키마 | ~30 |
| `backend/tests/test_metals.py` | 귀금속 API 테스트 | ~50 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/widgets/PreciousMetalWidget.tsx` | 귀금속 위젯 | ~85 |
| `frontend/src/components/widgets/MetalCard.tsx` | 개별 귀금속 카드 | ~55 |
| `frontend/src/hooks/useMetalQuotes.ts` | 귀금속 데이터 hook | ~40 |

## 3. 핵심 구현 내용

### 3.1 Backend - Metals Connector

```python
# connectors/metals.py
class MetalsConnector:
    BASE_URL = "https://api.metals.live/v1"

    async def get_spot_prices(self) -> list[dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/spot",
                timeout=10.0
            )
            response.raise_for_status()
            return self._parse_prices(response.json())

    def _parse_prices(self, data: list) -> list[dict]:
        metals = {}
        for item in data:
            if "gold" in item:
                metals["XAU"] = {"symbol": "XAU", "name": "Gold", "price": item["gold"]}
            if "silver" in item:
                metals["XAG"] = {"symbol": "XAG", "name": "Silver", "price": item["silver"]}
        return list(metals.values())
```

### 3.2 Backend - Metals API

```python
# routers/metals.py
@router.get("/metals/quotes")
async def get_metals_quotes():
    """귀금속 시세 조회"""
    service = MetalService()
    metals = await service.get_quotes()
    return {"metals": metals, "count": len(metals)}
```

### 3.3 Frontend - PreciousMetalWidget

```typescript
// components/widgets/PreciousMetalWidget.tsx
export const PreciousMetalWidget: React.FC<PreciousMetalWidgetProps> = ({
  refreshInterval = 60000,
  showKRW = true
}) => {
  const { metals, loading, refresh } = useMetalQuotes(refreshInterval);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <WidgetHeader title="귀금속" onRefresh={refresh} />
      {metals.map(metal => (
        <MetalCard
          key={metal.symbol}
          metal={metal}
          showKRW={showKRW}
        />
      ))}
    </div>
  );
};
```

## 4. API 명세

### GET `/api/v1/metals/quotes`

**Response (200):**
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

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 데이터 소스 | metals.live API | 무료, 실시간 현물가 제공 |
| 가격 단위 | 트로이온스 (oz) | 귀금속 국제 표준 단위 |
| KRW 환산 | TSK-09 환율 연동 | 실시간 환율 반영 |
| 갱신 주기 | 60초 | 귀금속 변동성 대비 적정 주기 |
| 색상 체계 | 국제 표준 | USD 시장 기준 (상승=초록, 하락=빨강) |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 3 | 3 | 0 | 100% |
| Frontend | 3 | 3 | 0 | 100% |
| **합계** | **6** | **6** | **0** | **100%** |
