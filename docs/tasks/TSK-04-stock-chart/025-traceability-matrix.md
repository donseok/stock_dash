# TSK-04 주식 차트 추적성 매트릭스

## 1. 개요

본 문서는 TSK-04 (Stock Chart) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-002 | Real-time stock charts | StockChartWidget 설계 | `components/charts/StockChartWidget.tsx` | TC-04-001 ~ TC-04-008 | 완료 |
| FR-002.1 | 캔들스틱 차트 표시 | CandlestickSeries 설계 | `StockChartWidget.tsx` (CandlestickSeries) | TC-04-001 | 완료 |
| FR-002.2 | 라인 차트 표시 | LineSeries 설계 | `StockChartWidget.tsx` (LineSeries) | TC-04-002 | 완료 |
| FR-002.3 | 기간 선택 (1D~5Y) | PeriodSelector 설계 | `StockChartWidget.tsx` (PeriodSelector) | TC-04-003 | 완료 |
| FR-002.4 | 심볼 전환 | SymbolSwitcher 설계 | `StockChartWidget.tsx` (SymbolSwitcher) | TC-04-004 | 완료 |
| FR-002.5 | 차트 데이터 API | `/api/v1/stocks/{symbol}/chart` | `routers/stocks.py`, `services/chart_service.py` | TC-04-005 ~ TC-04-008 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| StockChartWidget | `frontend/src/components/charts/StockChartWidget.tsx` | 메인 위젯 |
| ChartService | `backend/app/services/chart_service.py` | 차트 데이터 서비스 |
| Chart Router | `backend/app/routers/stocks.py` | API 라우터 |
| Chart Schema | `backend/app/schemas/chart.py` | 응답 스키마 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-04-001 | Unit (FE) | CandlestickSeries 렌더링 | FR-002.1 |
| TC-04-002 | Unit (FE) | LineSeries 렌더링 | FR-002.2 |
| TC-04-003 | Unit (FE) | PeriodSelector 동작 | FR-002.3 |
| TC-04-004 | Unit (FE) | SymbolSwitcher 동작 | FR-002.4 |
| TC-04-005 | Unit (BE) | Chart API 정상 응답 | FR-002.5 |
| TC-04-006 | Unit (BE) | Chart API 잘못된 심볼 | FR-002.5 |
| TC-04-007 | Unit (BE) | Chart API 기간 파라미터 | FR-002.5 |
| TC-04-008 | Integration | E2E 차트 렌더링 | FR-002 |

## 5. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
