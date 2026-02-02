"""Schema validation tests for stock_dash backend."""

import pytest
from app.schemas.market import (
    StockQuote,
    StockDetail,
    CryptoQuote,
    PreciousMetalQuote,
    ExchangeRate,
    MarketIndex,
    NewsArticle,
    OHLCData,
)


def test_stock_quote_schema():
    quote = StockQuote(
        symbol="005930",
        name="삼성전자",
        price=79000,
        change=1200,
        changePercent=1.54,
        volume=15234567,
        high=79500,
        low=77500,
        open=78000,
        prevClose=77800,
        timestamp="2026-02-02T09:30:00+00:00",
        market="KR",
    )
    assert quote.symbol == "005930"
    assert quote.price == 79000
    assert quote.market == "KR"


def test_crypto_quote_schema():
    quote = CryptoQuote(
        symbol="BTC",
        name="Bitcoin",
        price=145000000,
        change=2500000,
        changePercent=1.75,
        volume24h=1234.56,
        high24h=146000000,
        low24h=143000000,
        timestamp="2026-02-02T09:30:00+00:00",
        currency="KRW",
    )
    assert quote.symbol == "BTC"
    assert quote.currency == "KRW"


def test_precious_metal_schema():
    metal = PreciousMetalQuote(
        metal="gold",
        pricePerOz=2815.50,
        pricePerGram=90.52,
        change=12.30,
        changePercent=0.44,
        currency="USD",
        timestamp="2026-02-02T09:30:00+00:00",
    )
    assert metal.metal == "gold"
    assert metal.pricePerOz == 2815.50


def test_exchange_rate_schema():
    rate = ExchangeRate(
        baseCurrency="USD",
        quoteCurrency="KRW",
        rate=1450.25,
        change=-5.50,
        changePercent=-0.38,
        timestamp="2026-02-02T09:30:00+00:00",
    )
    assert rate.rate == 1450.25


def test_market_index_schema():
    index = MarketIndex(
        symbol="KOSPI",
        name="KOSPI",
        value=2580.45,
        change=12.30,
        changePercent=0.48,
        market="KR",
        isOpen=True,
        timestamp="2026-02-02T09:30:00+00:00",
    )
    assert index.isOpen is True
    assert index.market == "KR"


def test_news_article_schema():
    article = NewsArticle(
        id="news-001",
        title="테스트 뉴스",
        summary="테스트 요약",
        source="테스트 소스",
        url="https://example.com",
        publishedAt="2026-02-02T09:30:00+00:00",
        relatedSymbols=["005930", "BTC"],
        category="stock",
    )
    assert article.id == "news-001"
    assert len(article.relatedSymbols) == 2


def test_stock_detail_schema():
    detail = StockDetail(
        symbol="058610",
        name="에스피지",
        price=35000,
        change=500,
        changePercent=1.45,
        volume=123456,
        high=35500,
        low=34500,
        open=34800,
        prevClose=34500,
        week52High=42000,
        week52Low=28000,
        marketCap=500000000000,
        market="KR",
        timestamp="2026-02-02T09:30:00+00:00",
    )
    assert detail.symbol == "058610"
    assert detail.week52High == 42000
    assert detail.week52Low == 28000
    assert detail.week52High >= detail.week52Low


def test_ohlc_data_schema():
    ohlc = OHLCData(
        time="2026-02-02",
        open=78000,
        high=79500,
        low=77500,
        close=79000,
        volume=15234567,
    )
    assert ohlc.open == 78000
    assert ohlc.close == 79000
