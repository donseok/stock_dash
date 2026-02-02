# TSK-06 해외 시장 추적성 매트릭스

## 1. 개요

본 문서는 TSK-06 (Foreign Markets) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-004 | Foreign stocks (Alphabet C) | ForeignStockWidget 설계 | `components/widgets/ForeignStockWidget.tsx` | TC-06-001 ~ TC-06-003 | 완료 |
| FR-004.1 | Alphabet C (GOOG) 시세 표시 | StockCard 설계 | `ForeignStockWidget.tsx` | TC-06-001 | 완료 |
| FR-004.2 | 해외 주식 API | `/api/v1/stocks/foreign` | `routers/stocks.py` | TC-06-002 ~ TC-06-003 | 완료 |
| FR-009 | Foreign indices (DOW, NASDAQ) | MarketIndicesBar 설계 | `components/widgets/MarketIndicesBar.tsx` | TC-06-004 ~ TC-06-007 | 완료 |
| FR-009.1 | DOW 지수 표시 | IndexBadge 설계 | `MarketIndicesBar.tsx` | TC-06-004 | 완료 |
| FR-009.2 | NASDAQ 지수 표시 | IndexBadge 설계 | `MarketIndicesBar.tsx` | TC-06-005 | 완료 |
| FR-009.3 | 지수 API | `/api/v1/indices/quotes` | `routers/indices.py` | TC-06-006 ~ TC-06-007 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| ForeignStockWidget | `frontend/src/components/widgets/ForeignStockWidget.tsx` | 해외 주식 위젯 |
| MarketIndicesBar | `frontend/src/components/widgets/MarketIndicesBar.tsx` | 시장 지수 바 |
| ForeignMarketService | `backend/app/services/foreign_market_service.py` | 해외 시장 서비스 |
| IndicesRouter | `backend/app/routers/indices.py` | 지수 API 라우터 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-06-001 | Unit (FE) | Alphabet C 카드 렌더링 | FR-004.1 |
| TC-06-002 | Unit (BE) | Foreign stocks API 정상 조회 | FR-004.2 |
| TC-06-003 | Unit (BE) | Foreign stocks API 에러 처리 | FR-004.2 |
| TC-06-004 | Unit (FE) | DOW 지수 배지 렌더링 | FR-009.1 |
| TC-06-005 | Unit (FE) | NASDAQ 지수 배지 렌더링 | FR-009.2 |
| TC-06-006 | Unit (BE) | Indices API 정상 조회 | FR-009.3 |
| TC-06-007 | Unit (BE) | Indices API 타입 필터 | FR-009.3 |

## 5. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
