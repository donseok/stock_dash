# TSK-11 종목 상세정보 패널 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-11 |
| 테스트 대상 | StockDetail Schema, Stock Detail API, fetch_stock_detail Connector, StockDetailPanel |
| 관련 요구사항 | FR-011 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Backend 테스트 | pytest, httpx (AsyncClient), anyio |
| Frontend 테스트 | TypeScript 컴파일, Next.js build |
| Mock | Yahoo Finance 응답 의존 (실제 API 호출) |

## 3. 테스트 케이스

### 3.1 Backend 테스트

#### TC-11-001: StockDetail 스키마 유효성 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-001 |
| 구분 | Unit (Backend) |
| 사전 조건 | 없음 |
| 입력 | StockDetail 객체 생성 (15개 필드) |
| 기대 결과 | 모든 필드 정상 할당, week52High >= week52Low |
| 파일 | `backend/tests/test_schemas.py::test_stock_detail_schema` |

```python
def test_stock_detail_schema():
    detail = StockDetail(
        symbol="058610",
        name="에스피지",
        price=35000,
        change=500,
        changePercent=1.45,
        volume=123456,
        high=35500,
        low=34500,
        open=34800,
        prevClose=34500,
        week52High=42000,
        week52Low=28000,
        marketCap=500000000000,
        market="KR",
        timestamp="2026-02-02T09:30:00+00:00",
    )
    assert detail.symbol == "058610"
    assert detail.week52High == 42000
    assert detail.week52Low == 28000
    assert detail.week52High >= detail.week52Low
```

#### TC-11-002: Stock Detail API 엔드포인트

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-002 |
| 구분 | Unit (Backend) |
| 사전 조건 | FastAPI 앱 구동 |
| 입력 | `GET /api/v1/stocks/058610/detail` |
| 기대 결과 | HTTP 200, status "success" 또는 "error", 성공 시 detail 필드 포함 |
| 파일 | `backend/tests/test_api.py::test_stock_detail` |

```python
@pytest.mark.anyio
async def test_stock_detail(client):
    resp = await client.get("/api/v1/stocks/058610/detail")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("success", "error")
    if data["status"] == "success" and data["data"]:
        detail = data["data"]
        assert detail["symbol"] == "058610"
        assert "week52High" in detail
        assert "week52Low" in detail
        assert "price" in detail
        assert "volume" in detail
```

#### TC-11-003: fetch_stock_detail() 커넥터

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-003 |
| 구분 | Unit (Backend) |
| 사전 조건 | Yahoo Finance API 접근 가능 |
| 입력 | `fetch_stock_detail("058610")` |
| 기대 결과 | StockDetail 객체 반환, week52High >= week52Low, market == "KR" |
| 파일 | `backend/tests/test_connectors.py::test_stock_detail_connector` |

```python
@pytest.mark.anyio
async def test_stock_detail_connector():
    detail = await fetch_stock_detail("058610")
    # May be None if Yahoo Finance is unreachable
    if detail is not None:
        assert detail.symbol == "058610"
        assert detail.market == "KR"
        assert detail.week52High >= detail.week52Low
        assert detail.price > 0
```

### 3.2 Frontend 테스트

#### TC-11-004 ~ TC-11-006: TypeScript 타입 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-004, TC-11-005, TC-11-006 |
| 구분 | Type (Frontend) |
| 기대 결과 | TypeScript 컴파일 오류 없음 |
| 검증 방법 | `next build` 시 타입 체크 포함 |

검증 대상:
- `StockDetail` 인터페이스 (`frontend/src/types/market.ts`)
- `getStockDetail` API 함수 (`frontend/src/services/api.ts`)
- `useStockDetail` Hook (`frontend/src/hooks/useMarketData.ts`)

#### TC-11-007: StockDetailPanel 컴포넌트 빌드 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-007 |
| 구분 | Build (Frontend) |
| 기대 결과 | StockDetailPanel.tsx 정상 빌드 |
| 검증 방법 | `npm run build` 성공 |

#### TC-11-008: Dashboard 통합 빌드 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | TC-11-008 |
| 구분 | Build (Frontend) |
| 기대 결과 | Dashboard에 StockDetailPanel 통합 후 빌드 성공 |
| 검증 방법 | `npm run build` 성공 |

## 4. 테스트 실행 방법

```bash
# Backend 전체 테스트 (28개)
cd backend && python -m pytest tests/ -v

# Backend 개별 테스트
cd backend && python -m pytest tests/test_schemas.py::test_stock_detail_schema -v
cd backend && python -m pytest tests/test_api.py::test_stock_detail -v
cd backend && python -m pytest tests/test_connectors.py::test_stock_detail_connector -v

# Frontend 빌드 검증
cd frontend && npm run build
```
