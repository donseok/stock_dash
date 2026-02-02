# TSK-11 종목 상세정보 패널 추적성 매트릭스

## 1. 개요

본 문서는 TSK-11 (Stock Detail Information Panel) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-011 | Stock Detail Information Panel | StockDetailPanel 설계 | `frontend/src/components/widgets/StockDetailPanel.tsx` | TC-11-001 ~ TC-11-008 | 완료 |
| FR-011.1 | StockDetail 스키마 (15개 필드) | StockDetail BaseModel | `backend/app/schemas/market.py` | TC-11-001 | 완료 |
| FR-011.2 | 종목 상세 API 엔드포인트 | GET /api/v1/stocks/{symbol}/detail | `backend/app/api/v1/stocks.py` | TC-11-002 | 완료 |
| FR-011.3 | Yahoo Finance 1년 데이터 조회 | fetch_stock_detail() | `backend/app/connectors/stock.py` | TC-11-003 | 완료 |
| FR-011.4 | 52주 최고/최저 계산 | week52High/week52Low 산출 | `backend/app/connectors/stock.py` | TC-11-003 | 완료 |
| FR-011.5 | Frontend StockDetail 타입 | StockDetail interface | `frontend/src/types/market.ts` | TC-11-004 | 완료 |
| FR-011.6 | API 서비스 함수 | getStockDetail() | `frontend/src/services/api.ts` | TC-11-005 | 완료 |
| FR-011.7 | React Query Hook | useStockDetail() | `frontend/src/hooks/useMarketData.ts` | TC-11-006 | 완료 |
| FR-011.8 | StockDetailPanel 컴포넌트 | 종목 선택 + 상세 표시 UI | `frontend/src/components/widgets/StockDetailPanel.tsx` | TC-11-007 | 완료 |
| FR-011.9 | Dashboard 통합 | StockDetailPanel 대시보드 배치 | `frontend/src/components/dashboard/Dashboard.tsx` | TC-11-008 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| StockDetail Schema | `backend/app/schemas/market.py` | Pydantic BaseModel, 15개 필드 |
| Stock Detail Connector | `backend/app/connectors/stock.py` | `fetch_stock_detail()` 함수 |
| Stock Detail API | `backend/app/api/v1/stocks.py` | `GET /api/v1/stocks/{symbol}/detail` |
| StockDetail Interface | `frontend/src/types/market.ts` | TypeScript interface |
| getStockDetail Service | `frontend/src/services/api.ts` | API 호출 함수 |
| useStockDetail Hook | `frontend/src/hooks/useMarketData.ts` | React Query hook |
| StockDetailPanel | `frontend/src/components/widgets/StockDetailPanel.tsx` | 메인 UI 컴포넌트 |
| Dashboard Integration | `frontend/src/components/dashboard/Dashboard.tsx` | `lg:col-span-4` 배치 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 | 파일 |
|-----------|-----------|------|----------|------|
| TC-11-001 | Unit (BE) | StockDetail 스키마 유효성 | FR-011.1 | `backend/tests/test_schemas.py` |
| TC-11-002 | Unit (BE) | Stock Detail API 엔드포인트 | FR-011.2 | `backend/tests/test_api.py` |
| TC-11-003 | Unit (BE) | fetch_stock_detail() 커넥터 | FR-011.3, FR-011.4 | `backend/tests/test_connectors.py` |
| TC-11-004 | Type (FE) | StockDetail TypeScript 인터페이스 | FR-011.5 | TypeScript 컴파일 검증 |
| TC-11-005 | Type (FE) | getStockDetail API 서비스 | FR-011.6 | TypeScript 컴파일 검증 |
| TC-11-006 | Type (FE) | useStockDetail Hook | FR-011.7 | TypeScript 컴파일 검증 |
| TC-11-007 | Build (FE) | StockDetailPanel 컴포넌트 빌드 | FR-011.8 | `next build` 검증 |
| TC-11-008 | Build (FE) | Dashboard 통합 빌드 | FR-011.9 | `next build` 검증 |

## 5. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
