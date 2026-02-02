# TSK-12 위젯 프레임워크 추적성 매트릭스

## 1. 개요

본 문서는 TSK-12 (Widget Framework) 태스크의 요구사항-설계-구현-테스트 간 추적성을 관리한다.

## 2. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 항목 | 구현 파일 | 상태 |
|-------------|-------------|-----------|-----------|------|
| NFR-001 | 컴포넌트 재사용성 | 공통 위젯 컴포넌트 | `components/common/` | 완료 |
| NFR-001.1 | Card 컴포넌트 | Card 설계 | `components/common/Card.tsx` | 완료 |
| NFR-001.2 | Loading 상태 | LoadingSpinner 설계 | `components/common/LoadingSpinner.tsx` | 완료 |
| NFR-001.3 | Error 상태 | ErrorMessage 설계 | `components/common/ErrorMessage.tsx` | 완료 |
| NFR-001.4 | 가격 변동 표시 | PriceChange 설계 | `components/common/PriceChange.tsx` | 완료 |
| NFR-002 | 데이터 페칭 패턴 | TanStack Query hook | `hooks/useMarketData.ts` | 완료 |
| NFR-003 | API 서비스 레이어 | API 클라이언트 | `services/api.ts` | 완료 |
| NFR-004 | 유틸리티 함수 | 포맷팅 유틸 | `utils/format.ts` | 완료 |

## 3. 설계-구현 매핑

| 설계 컴포넌트 | 구현 파일 | 비고 |
|--------------|-----------|------|
| Card | `frontend/src/components/common/Card.tsx` | 공통 카드 |
| LoadingSpinner | `frontend/src/components/common/LoadingSpinner.tsx` | 로딩 표시 |
| ErrorMessage | `frontend/src/components/common/ErrorMessage.tsx` | 에러 표시 |
| PriceChange | `frontend/src/components/common/PriceChange.tsx` | 등락 표시 |
| MarketData hooks | `frontend/src/hooks/useMarketData.ts` | 8개 커스텀 hook |
| API Service | `frontend/src/services/api.ts` | API 클라이언트 |
| Format Utils | `frontend/src/utils/format.ts` | 포맷팅 유틸 |
| TypeScript Types | `frontend/src/types/market.ts` | 타입 정의 |

## 4. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-02-02 | 초기 작성 | 개발팀 |
