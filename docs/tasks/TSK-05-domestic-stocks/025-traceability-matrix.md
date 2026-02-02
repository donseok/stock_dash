# TSK-05 국내 주식 추적성 매트릭스

## 1. 개요

본 문서는 TSK-05 (Domestic Stocks) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-003 | Domestic stocks (Samsung, EcoPro, Celltrion) | DomesticStockWidget 설계 | `components/widgets/DomesticStockWidget.tsx` | TC-05-001 ~ TC-05-008 | 완료 |
| FR-003.1 | 삼성전자(005930) 시세 표시 | StockCard 설계 | `DomesticStockWidget.tsx` | TC-05-001 | 완료 |
| FR-003.2 | 에코프로(247540) 시세 표시 | StockCard 설계 | `DomesticStockWidget.tsx` | TC-05-002 | 완료 |
| FR-003.3 | 셀트리온(068270) 시세 표시 | StockCard 설계 | `DomesticStockWidget.tsx` | TC-05-003 | 완료 |
| FR-003.4 | 국내 주식 API | `/api/v1/stocks/domestic` | `routers/stocks.py`, `connectors/yahoo_finance.py` | TC-05-004 ~ TC-05-008 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| DomesticStockWidget | `frontend/src/components/widgets/DomesticStockWidget.tsx` | 메인 위젯 |
| StockCard | `frontend/src/components/widgets/StockCard.tsx` | 개별 종목 카드 |
| DomesticStockService | `backend/app/services/domestic_stock_service.py` | 시세 조회 서비스 |
| YahooFinanceConnector | `backend/app/connectors/yahoo_finance.py` | Yahoo Finance 연동 |
| Stock Router | `backend/app/routers/stocks.py` | API 라우터 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-05-001 | Unit (FE) | 삼성전자 StockCard 렌더링 | FR-003.1 |
| TC-05-002 | Unit (FE) | 에코프로 StockCard 렌더링 | FR-003.2 |
| TC-05-003 | Unit (FE) | 셀트리온 StockCard 렌더링 | FR-003.3 |
| TC-05-004 | Unit (BE) | Domestic API 전체 종목 조회 | FR-003.4 |
| TC-05-005 | Unit (BE) | Domestic API 개별 종목 필터 | FR-003.4 |
| TC-05-006 | Unit (BE) | Yahoo Finance Connector mock | FR-003.4 |
| TC-05-007 | Unit (FE) | 자동 갱신 동작 | FR-003 |
| TC-05-008 | Integration | E2E 위젯 렌더링 | FR-003 |

## 5. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
