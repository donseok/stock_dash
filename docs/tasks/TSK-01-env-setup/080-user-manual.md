# Stock Dashboard - 유저 매뉴얼

## 1. 프로젝트 개요

주식 웹 포털 대시보드는 국내외 주식, 암호화폐, 귀금속, 환율, 시장지수, 뉴스를 한눈에 확인할 수 있는 통합 대시보드입니다.

## 2. 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.12+
- pnpm (`npm install -g pnpm`)

### 백엔드 실행

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 프론트엔드 실행

```bash
cd frontend
pnpm install
pnpm dev
```

### 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs

## 3. 대시보드 구성

### 헤더
- 앱 이름 및 현재 날짜 표시
- 실시간 연결 상태 인디케이터 (녹색 점)

### 시장지수 바
- KOSPI, KOSDAQ, 다우존스, 나스닥 실시간 지수
- 등락률 색상 표시 (상승: 빨강, 하락: 파랑)
- 개장/폐장 상태 표시

### 주식 차트
- 캔들스틱 차트 (TradingView Lightweight Charts)
- 기간 선택: 1일, 1주, 1개월, 3개월, 1년
- 종목 전환: 삼성전자, LG에너지솔루션, 셀트리온
- 줌/팬 인터랙션 지원

### 국내주식 위젯
- 종목명, 현재가, 등락률, 거래량 표시
- 대상: 삼성전자(005930), 에코프로비엠(247540), 셀트리온(068270)

### 해외주식 위젯
- 해외 주식 시세 (USD 기준)
- 대상: Alphabet C (GOOGL)

### 암호화폐 위젯
- Upbit 실시간 시세 (KRW 기준)
- 대상: BTC, ETH, SOL, XRP, LINK, SUI, ONDO
- 현재가, 등락률, 24시간 거래량

### 귀금속 시세 위젯
- 금, 은 국제 시세
- 온스(oz) 및 그램(g) 단위 표시
- USD 기준

### 환율 위젯
- USD/KRW, USD/JPY, USD/EUR, USD/CNY
- 현재 환율 및 등락률

### 뉴스 위젯
- 금융 뉴스 목록
- 출처 및 발행 시간 표시
- 관련 종목 태그
- 클릭 시 원문 링크 이동

## 4. API 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| GET /api/v1/crypto/quotes | 암호화폐 시세 |
| GET /api/v1/metals/quotes | 귀금속 시세 |
| GET /api/v1/exchange/rates | 환율 |
| GET /api/v1/indices/quotes | 시장지수 |
| GET /api/v1/stocks/domestic | 국내주식 |
| GET /api/v1/stocks/foreign | 해외주식 |
| GET /api/v1/stocks/{symbol}/chart?period={period} | 차트 데이터 |
| GET /api/v1/news?limit={n} | 뉴스 |
| GET /health | 서버 상태 |

## 5. 환경 설정

### 환경 변수 (.env)

```
NEWS_API_KEY=your_api_key    # NewsAPI.org API 키 (선택)
KIS_APP_KEY=                 # 한국투자증권 API 키 (선택)
KIS_APP_SECRET=              # 한국투자증권 API Secret (선택)
```

## 6. Docker 실행 (선택)

```bash
cd infrastructure/docker
docker-compose up -d
```

서비스: PostgreSQL (5432), Redis (6379), Nginx (80/443)

## 7. 빌드

```bash
cd frontend
pnpm build    # 프로덕션 빌드
pnpm start    # 프로덕션 서버 시작
```

## 8. 테스트

```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```
