# TSK-12 위젯 프레임워크 테스트 명세서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 태스크 ID | TSK-12 |
| 테스트 대상 | 공통 컴포넌트, API 서비스, 유틸리티 |
| 관련 요구사항 | NFR-001 ~ NFR-004 |

## 2. 테스트 환경

| 구분 | 도구 |
|------|------|
| Frontend 테스트 | Jest, React Testing Library |
| Backend 테스트 | pytest, httpx |

## 3. 테스트 케이스

### TC-12-001: Card 컴포넌트 렌더링

| 항목 | 내용 |
|------|------|
| 구분 | Unit (Frontend) |
| 기대 결과 | 타이틀, children 정상 렌더링 |

### TC-12-002: LoadingSpinner 크기별 렌더링

| 항목 | 내용 |
|------|------|
| 구분 | Unit (Frontend) |
| 기대 결과 | sm/md/lg 크기 정상 렌더링 |

### TC-12-003: ErrorMessage 표시 및 재시도

| 항목 | 내용 |
|------|------|
| 구분 | Unit (Frontend) |
| 기대 결과 | 에러 메시지 표시, 재시도 버튼 동작 |

### TC-12-004: PriceChange 상승/하락/보합

| 항목 | 내용 |
|------|------|
| 구분 | Unit (Frontend) |
| 기대 결과 | 상승(빨강/초록), 하락(파랑/빨강), 보합(회색) |

### TC-12-005: formatPrice 유틸리티

| 항목 | 내용 |
|------|------|
| 구분 | Unit (Frontend) |
| 기대 결과 | KRW/USD 가격 포맷 정상 |

### TC-12-006: API 서비스 엔드포인트

| 항목 | 내용 |
|------|------|
| 구분 | Integration (Backend) |
| 기대 결과 | 모든 API 엔드포인트 200 응답 |

## 4. 테스트 실행 방법

```bash
# Frontend 컴포넌트 테스트
cd frontend && npm test

# Backend API 테스트
cd backend && pytest tests/test_api.py -v
```
