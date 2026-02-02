# TSK-12 종목 교체/커스터마이징 추적성 매트릭스

## 1. 개요

본 문서는 TSK-12 (Ticker Replacement/Customization) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-012 | Ticker Replacement/Customization | 종목 필터링 + 설정 UI | 전체 구현 파일 | TC-12-001 ~ TC-12-009 | 완료 |
| FR-012.1 | 위젯별 종목 표시/숨김 설정 | useTickerSettings Hook | `frontend/src/hooks/useTickerSettings.ts` | TC-12-001 | 완료 |
| FR-012.2 | 설정 모달 UI | TickerSettingsModal | `frontend/src/components/common/TickerSettingsModal.tsx` | TC-12-002 | 완료 |
| FR-012.3 | localStorage 영구 저장 | loadSettings / saveSettings | `frontend/src/hooks/useTickerSettings.ts` | TC-12-003 | 완료 |
| FR-012.4 | 국내주식 위젯 종목 필터링 | DomesticStockWidget 통합 | `frontend/src/components/widgets/DomesticStockWidget.tsx` | TC-12-004 | 완료 |
| FR-012.5 | 해외주식 위젯 종목 필터링 | ForeignStockWidget 통합 | `frontend/src/components/widgets/ForeignStockWidget.tsx` | TC-12-005 | 완료 |
| FR-012.6 | 암호화폐 위젯 종목 필터링 | CryptoWidget 통합 | `frontend/src/components/widgets/CryptoWidget.tsx` | TC-12-006 | 완료 |
| FR-012.7 | 종목 토글 시 즉시 반영 | toggleSymbol + state 업데이트 | `useTickerSettings.ts` | TC-12-007 | 완료 |
| FR-012.8 | 기본값 초기화 기능 | resetToDefaults | `useTickerSettings.ts` | TC-12-008 | 완료 |
| FR-012.9 | 빈 상태 안내 메시지 | 전체 종목 비활성 시 | 각 위젯 컴포넌트 | TC-12-009 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| useTickerSettings Hook | `frontend/src/hooks/useTickerSettings.ts` | 카테고리별 종목 관리, localStorage 연동 |
| TickerSettingsModal | `frontend/src/components/common/TickerSettingsModal.tsx` | 체크박스 기반 설정 모달 |
| DomesticStockWidget 통합 | `frontend/src/components/widgets/DomesticStockWidget.tsx` | 설정 버튼 + 필터링 |
| ForeignStockWidget 통합 | `frontend/src/components/widgets/ForeignStockWidget.tsx` | 설정 버튼 + 필터링 |
| CryptoWidget 통합 | `frontend/src/components/widgets/CryptoWidget.tsx` | 설정 버튼 + 필터링 |
| DEFAULT_TICKERS 상수 | `frontend/src/hooks/useTickerSettings.ts` | 3개 카테고리 기본 종목 정의 |
| STORAGE_KEY | `frontend/src/hooks/useTickerSettings.ts` | `"stock_dash_tickers"` |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-12-001 | Build (FE) | useTickerSettings Hook 타입/빌드 검증 | FR-012.1 |
| TC-12-002 | Build (FE) | TickerSettingsModal 컴포넌트 빌드 검증 | FR-012.2 |
| TC-12-003 | Build (FE) | localStorage 저장/로드 로직 빌드 검증 | FR-012.3 |
| TC-12-004 | Build (FE) | DomesticStockWidget 필터링 통합 빌드 | FR-012.4 |
| TC-12-005 | Build (FE) | ForeignStockWidget 필터링 통합 빌드 | FR-012.5 |
| TC-12-006 | Build (FE) | CryptoWidget 필터링 통합 빌드 | FR-012.6 |
| TC-12-007 | Build (FE) | 종목 토글 state 업데이트 검증 | FR-012.7 |
| TC-12-008 | Build (FE) | 기본값 초기화 기능 검증 | FR-012.8 |
| TC-12-009 | Build (FE) | 빈 상태 메시지 렌더링 검증 | FR-012.9 |

## 5. 카테고리-종목 매핑

| 카테고리 | 종목 수 | 종목 목록 |
|----------|--------|-----------|
| domestic | 3 | 에스피지(058610), 에코프로(247540), 셀트리온(068270) |
| foreign | 2 | Alphabet C(GOOG), Figma(FIGM) |
| crypto | 7 | BTC, ETH, SOL, XRP, LINK, SUI, ONDO |
| **합계** | **12** | |

## 6. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
