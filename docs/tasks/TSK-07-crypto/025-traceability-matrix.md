# TSK-07 암호화폐 추적성 매트릭스

## 1. 개요

본 문서는 TSK-07 (Crypto) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 테스트 ID | 상태 |
|-------------|-------------|-----------|-----------|-----------|------|
| FR-005 | Cryptocurrencies (BTC, ETH, SOL, XRP, LINK, SUI, ONDO) | CryptoWidget 설계 | `components/widgets/CryptoWidget.tsx` | TC-07-001 ~ TC-07-009 | 완료 |
| FR-005.1 | BTC 시세 표시 | CryptoCard 설계 | `CryptoWidget.tsx` | TC-07-001 | 완료 |
| FR-005.2 | ETH 시세 표시 | CryptoCard 설계 | `CryptoWidget.tsx` | TC-07-002 | 완료 |
| FR-005.3 | SOL/XRP/LINK/SUI/ONDO 시세 | CryptoCard 설계 | `CryptoWidget.tsx` | TC-07-003 | 완료 |
| FR-005.4 | 암호화폐 API | `/api/v1/crypto/quotes` | `routers/crypto.py`, `connectors/upbit.py` | TC-07-004 ~ TC-07-007 | 완료 |
| FR-005.5 | Upbit API 연동 | UpbitConnector 설계 | `connectors/upbit.py` | TC-07-006 ~ TC-07-007 | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| CryptoWidget | `frontend/src/components/widgets/CryptoWidget.tsx` | 메인 위젯 |
| CryptoCard | `frontend/src/components/widgets/CryptoCard.tsx` | 개별 코인 카드 |
| CryptoService | `backend/app/services/crypto_service.py` | 암호화폐 서비스 |
| UpbitConnector | `backend/app/connectors/upbit.py` | Upbit API 커넥터 |
| Crypto Router | `backend/app/routers/crypto.py` | API 라우터 |

## 4. 테스트 커버리지 매핑

| 테스트 ID | 테스트 유형 | 대상 | 요구사항 |
|-----------|-----------|------|----------|
| TC-07-001 | Unit (FE) | BTC CryptoCard 렌더링 | FR-005.1 |
| TC-07-002 | Unit (FE) | ETH CryptoCard 렌더링 | FR-005.2 |
| TC-07-003 | Unit (FE) | 전체 코인 리스트 렌더링 | FR-005.3 |
| TC-07-004 | Unit (BE) | Crypto API 전체 조회 | FR-005.4 |
| TC-07-005 | Unit (BE) | Crypto API 심볼 필터 | FR-005.4 |
| TC-07-006 | Unit (BE) | Upbit Connector mock | FR-005.5 |
| TC-07-007 | Unit (BE) | Upbit Connector 에러 처리 | FR-005.5 |
| TC-07-008 | Unit (FE) | 자동 갱신 동작 (10초) | FR-005 |
| TC-07-009 | Integration | E2E 위젯 렌더링 | FR-005 |

## 5. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
