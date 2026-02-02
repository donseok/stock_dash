# TSK-02 시스템 아키텍처 사용자 매뉴얼

## 1. 개요

stock_dash는 Next.js 14 프론트엔드와 FastAPI 백엔드로 구성된 주식 대시보드 웹 포털이다.

## 2. 시스템 구조

### 2.1 프론트엔드 (Next.js 14)
- **프레임워크**: Next.js 14 (App Router)
- **상태 관리**: TanStack Query v5
- **스타일링**: Tailwind CSS 3.4
- **포트**: http://localhost:3000

### 2.2 백엔드 (FastAPI)
- **프레임워크**: FastAPI 0.128+
- **API 버전**: /api/v1
- **포트**: http://localhost:8000

### 2.3 외부 데이터 소스

| 데이터 | 소스 | 용도 |
|--------|------|------|
| 암호화폐 | Upbit API | BTC, ETH 등 KRW 시세 |
| 귀금속 | metals.live | 금/은 현물가 |
| 환율 | ExchangeRate-API | USD/KRW 등 |
| 주식/지수 | Yahoo Finance | 국내/해외 주식, 시장 지수 |
| 뉴스 | NewsAPI | 금융 뉴스 |

## 3. API 엔드포인트

| 경로 | 설명 |
|------|------|
| GET /api/v1/crypto/quotes | 암호화폐 시세 |
| GET /api/v1/metals/quotes | 귀금속 시세 |
| GET /api/v1/exchange/rates | 환율 |
| GET /api/v1/indices/quotes | 시장 지수 |
| GET /api/v1/stocks/domestic | 국내 주식 |
| GET /api/v1/stocks/foreign | 해외 주식 |
| GET /api/v1/stocks/{symbol}/chart | 주식 차트 |
| GET /api/v1/news | 금융 뉴스 |

## 4. 실행 방법

### 4.1 백엔드 실행
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 4.2 프론트엔드 실행
```bash
cd frontend
pnpm dev
```

### 4.3 전체 실행 (Docker)
```bash
docker-compose up -d
```
