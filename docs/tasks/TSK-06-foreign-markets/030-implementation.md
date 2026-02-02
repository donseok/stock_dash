# TSK-06 해외 시장 구현 보고서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-06 |
| 관련 요구사항 | FR-004 (Foreign stocks), FR-009 (Foreign indices) |
| 구현 상태 | 완료 |
| Backend 테스트 | 4/4 PASS |
| Frontend 빌드 | 성공 |

## 2. 구현 파일 목록

### 2.1 Backend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `backend/app/routers/stocks.py` | 해외 주식 API 라우터 (기존 확장) | ~40 |
| `backend/app/routers/indices.py` | 시장 지수 API 라우터 | ~50 |
| `backend/app/services/foreign_market_service.py` | 해외 시장 서비스 | ~70 |
| `backend/app/schemas/index.py` | 지수 응답 스키마 | ~30 |
| `backend/tests/test_foreign_markets.py` | 해외 주식 API 테스트 | ~40 |
| `backend/tests/test_indices.py` | 지수 API 테스트 | ~45 |

### 2.2 Frontend

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `frontend/src/components/widgets/ForeignStockWidget.tsx` | 해외 주식 위젯 | ~90 |
| `frontend/src/components/widgets/MarketIndicesBar.tsx` | 시장 지수 바 | ~110 |
| `frontend/src/components/widgets/IndexBadge.tsx` | 지수 배지 컴포넌트 | ~45 |
| `frontend/src/hooks/useForeignStocks.ts` | 해외 주식 데이터 hook | ~40 |
| `frontend/src/hooks/useIndices.ts` | 지수 데이터 hook | ~40 |

## 3. 핵심 구현 내용

### 3.1 Backend - Foreign Stocks API

```python
# routers/stocks.py
@router.get("/stocks/foreign")
async def get_foreign_stocks():
    """해외 주식 시세 조회"""
    service = ForeignMarketService()
    stocks = await service.get_foreign_quotes()
    return {"stocks": stocks, "count": len(stocks)}
```

### 3.2 Backend - Indices API

```python
# routers/indices.py
@router.get("/indices/quotes")
async def get_indices_quotes(
    type: Optional[str] = Query(default=None, regex="^(domestic|foreign|all)?$")
):
    """시장 지수 조회 (국내/해외 필터 지원)"""
    service = ForeignMarketService()
    indices = await service.get_indices(type_filter=type)
    return {"indices": indices, "count": len(indices)}
```

### 3.3 Frontend - ForeignStockWidget

```typescript
// components/widgets/ForeignStockWidget.tsx
export const ForeignStockWidget: React.FC<ForeignStockWidgetProps> = ({
  refreshInterval = 30000,
  onStockClick
}) => {
  const { stocks, loading, refresh } = useForeignStocks(refreshInterval);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <WidgetHeader title="해외 주식" onRefresh={refresh} />
      {stocks.map(stock => (
        <StockCard
          key={stock.symbol}
          stock={stock}
          colorScheme="international"
          onClick={() => onStockClick?.(stock.symbol)}
        />
      ))}
    </div>
  );
};
```

### 3.4 Frontend - MarketIndicesBar

```typescript
// components/widgets/MarketIndicesBar.tsx
export const MarketIndicesBar: React.FC<MarketIndicesBarProps> = ({
  type = 'all',
  refreshInterval = 30000
}) => {
  const { indices, loading } = useIndices(type, refreshInterval);

  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {indices.map(index => (
        <IndexBadge key={index.symbol} index={index} />
      ))}
    </div>
  );
};
```

## 4. API 명세

### GET `/api/v1/stocks/foreign`

**Response (200):**
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
      "currency": "USD",
      "exchange": "NASDAQ",
      "updated_at": "2026-02-01T20:00:00Z"
    }
  ],
  "count": 1
}
```

### GET `/api/v1/indices/quotes`

**Response (200):**
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
    }
  ],
  "count": 2
}
```

## 5. 주요 결정 사항

| 결정 항목 | 선택 | 사유 |
|-----------|------|------|
| 색상 체계 | 국제 표준 (상승=초록, 하락=빨강) | 해외 시장 관습 |
| 시간 표시 | 현지 시간 + KST 병행 | 사용자 편의 |
| 지수 API | domestic/foreign 필터 | TSK-10 국내 지수와 공유 |
| 데이터 소스 | Yahoo Finance | 해외 종목/지수 지원 |

## 6. 테스트 결과 요약

| 구분 | 전체 | 통과 | 실패 | 비율 |
|------|------|------|------|------|
| Backend | 4 | 4 | 0 | 100% |
| Frontend | 3 | 3 | 0 | 100% |
| **합계** | **7** | **7** | **0** | **100%** |
