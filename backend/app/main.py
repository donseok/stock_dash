"""
주식 웹 포털 대시보드 - FastAPI 메인 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router

app = FastAPI(
    title="Stock Dashboard API",
    description="주식 웹 포털 대시보드 API - 국내외 주식, 암호화폐, 금/은, 환율, 뉴스 통합 제공",
    version="0.1.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://frontend-rho-eight-89.vercel.app",
        "https://frontend-leedonseoks-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Stock Dashboard API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# API v1 라우터 등록
app.include_router(api_router, prefix="/api/v1")
