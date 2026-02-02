# 주식 웹 포털 대시보드 - 프로젝트 폴더 구조

**버전**: 1.0
**생성일**: 2026-02-02
**기반 문서**: PRD-20260202, TRD-20260202, WBS-20260202

---

## 프로젝트 개요

PRD, TRD, WBS 분석 결과를 기반으로 설계된 최적의 폴더 구조입니다.

### 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, TradingView Lightweight Charts
- **Backend**: Python 3.12, FastAPI, WebSocket, Redis
- **Database**: PostgreSQL 16, Redis
- **Infrastructure**: Docker, Nginx, GitHub Actions

---

## 권장 폴더 구조

```
stock_dash/
├── docs/                           # 📚 문서
│   ├── prd/                        # Product Requirements Documents
│   ├── trd/                        # Technical Requirements Documents
│   ├── wbs/                        # Work Breakdown Structure
│   └── api/                        # API 명세서 (Swagger/OpenAPI)
│
├── frontend/                       # 🖥️ Next.js 프론트엔드
│   ├── public/                     # 정적 파일 (이미지, 폰트 등)
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # 메인 대시보드
│   │   │   └── globals.css
│   │   │
│   │   ├── components/             # 재사용 컴포넌트
│   │   │   ├── common/             # 공통 UI 컴포넌트
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   └── Modal/
│   │   │   │
│   │   │   ├── widgets/            # 대시보드 위젯
│   │   │   │   ├── ChartWidget/        # 주식 차트 위젯
│   │   │   │   ├── StockPriceWidget/   # 국내주식 시세 위젯
│   │   │   │   ├── CryptoWidget/       # 암호화폐 시세 위젯
│   │   │   │   ├── GoldSilverWidget/   # 금/은 시세 위젯
│   │   │   │   ├── ExchangeRateWidget/ # 환율 위젯
│   │   │   │   ├── MarketIndexWidget/  # 시장지수 위젯
│   │   │   │   └── NewsWidget/         # 뉴스 피드 위젯
│   │   │   │
│   │   │   ├── dashboard/          # 대시보드 레이아웃 컴포넌트
│   │   │   │   ├── DashboardLayout/
│   │   │   │   ├── WidgetContainer/
│   │   │   │   └── TickerSelector/
│   │   │   │
│   │   │   └── charts/             # 차트 컴포넌트
│   │   │       ├── CandleChart/
│   │   │       ├── LineChart/
│   │   │       └── ChartToolbar/
│   │   │
│   │   ├── hooks/                  # 커스텀 React Hooks
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useStockData.ts
│   │   │   ├── useCryptoData.ts
│   │   │   └── useMarketIndex.ts
│   │   │
│   │   ├── contexts/               # React Context Providers
│   │   │   ├── TickerContext.tsx
│   │   │   ├── WebSocketContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── services/               # API 호출 서비스
│   │   │   ├── api.ts              # Axios/Fetch 인스턴스
│   │   │   ├── stockService.ts
│   │   │   ├── cryptoService.ts
│   │   │   ├── newsService.ts
│   │   │   └── marketIndexService.ts
│   │   │
│   │   ├── stores/                 # 상태 관리 (TanStack Query)
│   │   │   ├── queryClient.ts
│   │   │   └── queries/
│   │   │
│   │   ├── types/                  # TypeScript 타입 정의
│   │   │   ├── stock.ts
│   │   │   ├── crypto.ts
│   │   │   ├── news.ts
│   │   │   └── widget.ts
│   │   │
│   │   ├── utils/                  # 유틸리티 함수
│   │   │   ├── formatters.ts       # 숫자/날짜 포맷터
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── styles/                 # 스타일 관련
│   │       ├── globals.css
│   │       └── variables.css
│   │
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local
│
├── backend/                        # 🐍 FastAPI 백엔드
│   ├── app/
│   │   ├── main.py                 # FastAPI 애플리케이션 진입점
│   │   ├── config.py               # 설정 관리
│   │   │
│   │   ├── api/                    # API 엔드포인트
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # 의존성 주입
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py       # API 라우터 통합
│   │   │       ├── stocks.py       # 국내주식 API
│   │   │       ├── overseas.py     # 해외주식 API
│   │   │       ├── crypto.py       # 암호화폐 API
│   │   │       ├── precious.py     # 금/은 시세 API
│   │   │       ├── exchange.py     # 환율 API
│   │   │       ├── market_index.py # 시장지수 API
│   │   │       └── news.py         # 뉴스 API
│   │   │
│   │   ├── core/                   # 핵심 모듈
│   │   │   ├── __init__.py
│   │   │   ├── security.py         # 보안 관련
│   │   │   └── exceptions.py       # 커스텀 예외
│   │   │
│   │   ├── models/                 # SQLAlchemy 모델
│   │   │   ├── __init__.py
│   │   │   ├── stock.py
│   │   │   ├── crypto.py
│   │   │   ├── news.py
│   │   │   └── user_settings.py
│   │   │
│   │   ├── schemas/                # Pydantic 스키마
│   │   │   ├── __init__.py
│   │   │   ├── stock.py
│   │   │   ├── crypto.py
│   │   │   ├── news.py
│   │   │   └── widget.py
│   │   │
│   │   ├── services/               # 비즈니스 로직 서비스
│   │   │   ├── __init__.py
│   │   │   ├── market_data_service.py
│   │   │   ├── crypto_data_service.py
│   │   │   ├── precious_metal_service.py
│   │   │   ├── exchange_rate_service.py
│   │   │   ├── news_service.py
│   │   │   └── realtime_aggregator.py
│   │   │
│   │   ├── connectors/             # 외부 API 커넥터
│   │   │   ├── __init__.py
│   │   │   ├── kiwoom_connector.py     # 키움증권 Open API
│   │   │   ├── upbit_connector.py      # 업비트 WebSocket
│   │   │   ├── gold_api_connector.py   # 금/은 시세 API
│   │   │   ├── exchange_connector.py   # 한국수출입은행 환율
│   │   │   └── news_connector.py       # NewsAPI
│   │   │
│   │   ├── websocket/              # WebSocket 핸들러
│   │   │   ├── __init__.py
│   │   │   ├── manager.py          # WebSocket 연결 관리
│   │   │   └── handlers.py         # 메시지 핸들러
│   │   │
│   │   ├── scheduler/              # APScheduler 작업
│   │   │   ├── __init__.py
│   │   │   └── jobs.py             # 스케줄링 작업 정의
│   │   │
│   │   ├── db/                     # 데이터베이스
│   │   │   ├── __init__.py
│   │   │   ├── database.py         # DB 연결 설정
│   │   │   ├── redis.py            # Redis 연결
│   │   │   └── migrations/         # Alembic 마이그레이션
│   │   │
│   │   └── utils/                  # 유틸리티
│   │       ├── __init__.py
│   │       ├── logger.py
│   │       └── formatters.py
│   │
│   ├── tests/                      # 테스트
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── alembic/                    # DB 마이그레이션
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env.example
│
├── infrastructure/                 # 🏗️ 인프라 설정
│   ├── docker/
│   │   ├── docker-compose.yml      # 개발 환경
│   │   ├── docker-compose.prod.yml # 프로덕션 환경
│   │   ├── nginx/
│   │   │   ├── nginx.conf
│   │   │   └── ssl/
│   │   └── postgres/
│   │       └── init.sql
│   │
│   ├── monitoring/                 # 모니터링 설정
│   │   ├── prometheus/
│   │   │   └── prometheus.yml
│   │   └── grafana/
│   │       └── dashboards/
│   │
│   └── scripts/                    # 배포/운영 스크립트
│       ├── deploy.sh
│       ├── backup.sh
│       └── healthcheck.sh
│
├── .github/                        # 🔧 GitHub 설정
│   └── workflows/
│       ├── ci.yml                  # CI 파이프라인
│       ├── cd.yml                  # CD 파이프라인
│       └── test.yml                # 테스트 자동화
│
├── .vscode/                        # VS Code 설정
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── scripts/                        # 📜 개발 스크립트
│   ├── setup-dev.sh                # 개발 환경 설정
│   ├── run-tests.sh                # 테스트 실행
│   └── generate-api-docs.sh        # API 문서 생성
│
├── .gitignore
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 폴더 구조 설명

### 1. `docs/` - 문서
프로젝트 관련 모든 문서 저장. PRD, TRD, WBS 및 API 명세서 포함.

### 2. `frontend/` - Next.js 프론트엔드
- **components/widgets/**: PRD에 정의된 각 위젯별 컴포넌트 (차트, 시세, 뉴스 등)
- **hooks/**: WebSocket 연결, 데이터 페칭 등 커스텀 훅
- **services/**: TanStack Query 기반 API 서비스

### 3. `backend/` - FastAPI 백엔드
- **connectors/**: 외부 API 연동 (키움증권, 업비트, 환율 등)
- **services/**: TRD에 정의된 Data Service Layer 구현
- **websocket/**: 실시간 데이터 스트리밍 처리

### 4. `infrastructure/` - 인프라
Docker, Nginx, Prometheus/Grafana 모니터링 설정

---

## 주요 특징

1. **모듈화**: 각 기능(주식, 암호화폐, 금/은 등)이 독립적인 모듈로 분리
2. **위젯 기반**: PRD 요구사항에 따라 종목 교체 가능한 위젯 구조
3. **실시간 데이터**: WebSocket 기반 실시간 시세 스트리밍 지원
4. **확장성**: 새로운 자산군/API 추가가 용이한 구조
5. **테스트 용이**: 단위/통합/E2E 테스트 분리

---

*이 문서는 PRD, TRD, WBS 분석을 기반으로 자동 생성되었습니다.*
