# TSK-02: 시스템 아키텍처 - 설계문서

## 1. 개요

주식 웹 포털 대시보드의 전체 시스템 아키텍처를 정의한다.

## 2. 시스템 아키텍처

### 계층 구조

```
┌─────────────────────────────────────┐
│       Presentation Layer            │
│  Next.js 14 (SSG/CSR) + Tailwind   │
│  TanStack Query + Lightweight Charts│
├─────────────────────────────────────┤
│       API Gateway Layer             │
│  Nginx Reverse Proxy                │
├─────────────────────────────────────┤
│       Application Layer             │
│  FastAPI REST API v1                │
│  WebSocket Gateway (계획)            │
├─────────────────────────────────────┤
│       Connector Layer               │
│  Upbit │ Yahoo │ metals.live │ etc  │
├─────────────────────────────────────┤
│       Cache Layer                   │
│  Redis (계획)                        │
├─────────────────────────────────────┤
│       Database Layer                │
│  PostgreSQL 16 (계획)               │
└─────────────────────────────────────┘
```

### 데이터 흐름

```
External APIs → Connectors → FastAPI → REST Response → TanStack Query → React Components
                                                              ↓
                                                       staleTime: 5s
                                                       refetchInterval: 10s
```

## 3. API 설계

### REST API v1 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/v1/crypto/quotes | 암호화폐 시세 |
| GET | /api/v1/metals/quotes | 귀금속 시세 |
| GET | /api/v1/exchange/rates | 환율 |
| GET | /api/v1/indices/quotes | 시장지수 |
| GET | /api/v1/stocks/domestic | 국내주식 |
| GET | /api/v1/stocks/foreign | 해외주식 |
| GET | /api/v1/stocks/{symbol}/chart | 차트 데이터 |
| GET | /api/v1/news | 뉴스 |
| GET | /health | 헬스체크 |

### 응답 형식

```json
{
  "data": [...],
  "status": "success",
  "timestamp": "2026-02-02T05:00:00+00:00"
}
```

## 4. 외부 API 연동

| 데이터 | API | 특성 |
|--------|-----|------|
| 암호화폐 | Upbit REST API | 실시간, KRW 기반 |
| 귀금속 | metals.live | USD 기반, fallback 지원 |
| 환율 | open.er-api.com | 무료, USD 기준 |
| 주식/지수 | Yahoo Finance | 무료, 글로벌 |
| 뉴스 | NewsAPI.org | API 키 필요, mock fallback |

## 5. 에러 처리 전략

- 모든 커넥터에 fallback/mock 데이터 구현
- try-except로 외부 API 장애 격리
- httpx timeout 5~10초 설정
- TanStack Query retry: 2회

## 6. PRD 요구사항 매핑

| NFR | 설계 대응 |
|-----|----------|
| NFR-001: 데이터 갱신 5초 이내 | staleTime: 5s, refetchInterval: 10s |
| NFR-002: 초기 로딩 3초 이내 | SSG, Code Splitting |
| NFR-003: 가용성 99.5% | Fallback 데이터, 에러 격리 |
| NFR-004: UI/UX | Tailwind, 반응형, 로딩/에러 상태 |
