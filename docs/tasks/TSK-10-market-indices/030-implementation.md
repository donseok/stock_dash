# TSK-10 시장 지수 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-10 |
| 관련 요구사항 | FR-008 (Domestic indices), FR-009 (Foreign indices) |
| 구현 상태 | 완료 |
| Backend 테스트 | 4/4 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/indices.py` | 지수 API 라우터 (TSK-06과 공유) | ~50 |
| `backend/app/services/market_index_service.py` | 시장 지수 서비스 | ~80 |
| `backend/app/connectors/market_index.py` | 시장 지수 커넥터 | ~95 |
| `backend/app/schemas/index.py` | 지수 응답 스키마 | ~35 |
| `backend/tests/test_market_indices.py` | 시장 지수 API 테스트 | ~60 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/widgets/MarketIndicesBar.tsx` | 지수 인디케이터 바 | ~95 |
| `frontend/src/components/widgets/IndexBadge.tsx` | 개별 지수 배지 | ~55 |
| `frontend/src/hooks/useIndices.ts` | 지수 데이터 hook | ~40 |

## 3. 핵심 구현 내용

### 3.1 Backend - Market Index Connector

```python
# connectors/market_index.py
class MarketIndexConnector:
    INDICES = {
        "domestic": [
            {"symbol": "^KS11", "name": "KOSPI", "display": "코스피"},
            {"symbol": "^KQ11", "name": "KOSDAQ", "display": "코스닥"},
        ],
        "foreign": [
            {"symbol": "^DJI", "name": "DOW", "display": "다우존스"},
            {"symbol": "^IXIC", "name": "NASDAQ", "display": "나스닥"},
        ]
    }

    async def get_indices(self, type_filter: str = "all") -> list[dict]:
        targets = []
        if type_filter in ("all", "domestic"):
            targets.extend(self.INDICES["domestic"])
        if type_filter in ("all", "foreign"):
            targets.extend(self.INDICES["foreign"])

        symbols = [t["symbol"] for t in targets]
        tickers = yf.Tickers(" ".join(symbols))
        results = []
        for target in targets:
            info = tickers.tickers[target["symbol"]].info
            results.append({
                "symbol": target["symbol"],
                "name": target["name"],
                "display_name": target["display"],
                "value": info.get("regularMarketPrice", 0),
                "change": info.get("regularMarketChange", 0),
                "change_percent": info.get("regularMarketChangePercent", 0),
                "type": "domestic" if target in self.INDICES["domestic"] else "foreign",
            })
        return results
```

### 3.2 Backend - Indices API

```python
# routers/indices.py
@router.get("/indices/quotes")
async def get_indices_quotes(
    type: Optional[str] = Query(default="all", regex="^(domestic|foreign|all)$")
):
    """시장 지수 조회"""
    service = MarketIndexService()
    indices = await service.get_indices(type_filter=type)
    return {"indices": indices, "count": len(indices)}
```

### 3.3 Frontend - MarketIndicesBar

```typescript
// components/widgets/MarketIndicesBar.tsx
export const MarketIndicesBar: React.FC<MarketIndicesBarProps> = ({
  type = 'all',
  refreshInterval = 30000
}) => {
  const { indices, loading } = useIndices(type, refreshInterval);

  const domesticIndices = indices.filter(i => i.type === 'domestic');
  const foreignIndices = indices.filter(i => i.type === 'foreign');

  return (
    <div className="flex items-center gap-4 bg-white border-b px-4 py-2 overflow-x-auto">
      {domesticIndices.map(idx => (
        <IndexBadge key={idx.symbol} index={idx} colorScheme="korean" />
      ))}
      {domesticIndices.length > 0 && foreignIndices.length > 0 && (
        <div className="border-l border-gray-300 h-8 mx-2" />
      )}
      {foreignIndices.map(idx => (
        <IndexBadge key={idx.symbol} index={idx} colorScheme="international" />
      ))}
    </div>
  );
};
```

## 4. API 명세

### GET `/api/v1/indices/quotes`

**Request:**
```
GET /api/v1/indices/quotes
GET /api/v1/indices/quotes?type=domestic
GET /api/v1/indices/quotes?type=foreign
```

**Response (200):**
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
      "updated_at": "2026-02-01T20:00:00Z"
    }
  ],
  "count": 4
}
```

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| API 공유 | TSK-06과 indices API 공유 | 중복 방지, type 필터로 구분 |
| 색상 체계 | 국내/해외 별도 | 시장별 관습 존중 |
| 배치 | 대시보드 상단 바 | 한눈에 주요 지수 확인 |
| 데이터 소스 | Yahoo Finance | 국내/해외 지수 모두 지원 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 4 | 4 | 0 | 100% |
| Frontend | 4 | 4 | 0 | 100% |
| **합계** | **8** | **8** | **0** | **100%** |
