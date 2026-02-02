# 주식 웹 포털 대시보드 (Stock Dashboard)

국내외 주식, 암호화폐, 금/은, 환율, 시장지수, 뉴스를 하나의 웹 대시보드에서 실시간으로 통합 제공하는 포털 시스템입니다.

## 🚀 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TradingView Lightweight Charts
- TanStack Query

### Backend
- Python 3.12
- FastAPI
- WebSocket
- PostgreSQL 16
- Redis

## 📁 프로젝트 구조

```
stock_dash/
├── docs/           # 문서 (PRD, TRD, WBS, API 명세)
├── frontend/       # Next.js 프론트엔드
├── backend/        # FastAPI 백엔드
├── infrastructure/ # Docker, Nginx, 모니터링 설정
└── scripts/        # 개발/배포 스크립트
```

## 🛠️ 개발 환경 설정

### Docker Compose로 실행
```bash
cd infrastructure/docker
docker-compose up -d
```

### 개별 실행

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📊 주요 기능

- ✅ 국내주식 시세 (에스피지, 에코프로, 셀트리온)
- ✅ 해외주식 시세 (알파벳 C, 피그마)
- ✅ 암호화폐 시세 (비트코인, 이더리움, 솔라나, XRP, 체인링크, SUI, ONDO)
- ✅ 금/은 시세
- ✅ 환율 정보 (USD/KRW)
- ✅ 시장지수 (KOSPI, KOSDAQ, 다우, 나스닥)
- ✅ 뉴스 피드
- ✅ 종목 교체 가능 위젯 구조

## 📝 문서

- [PRD (제품 요구사항)](docs/prd/)
- [TRD (기술 요구사항)](docs/trd/)
- [WBS (작업분해구조)](docs/wbs/)
- [프로젝트 구조](docs/project_structure.md)

## 📄 라이선스

MIT License
