"""API v1 router - aggregates all endpoint routers."""

from fastapi import APIRouter

from app.api.v1.crypto import router as crypto_router
from app.api.v1.metals import router as metals_router
from app.api.v1.exchange import router as exchange_router
from app.api.v1.indices import router as indices_router
from app.api.v1.stocks import router as stocks_router
from app.api.v1.news import router as news_router

api_router = APIRouter()

api_router.include_router(crypto_router)
api_router.include_router(metals_router)
api_router.include_router(exchange_router)
api_router.include_router(indices_router)
api_router.include_router(stocks_router)
api_router.include_router(news_router)
