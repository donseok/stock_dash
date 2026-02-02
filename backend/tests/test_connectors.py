"""Connector tests for stock_dash backend."""

import pytest
from app.connectors.upbit import fetch_crypto_quotes, CRYPTO_MARKETS
from app.connectors.metals import fetch_precious_metals
from app.connectors.exchange_rate import fetch_exchange_rates
from app.connectors.market_index import fetch_market_indices
from app.connectors.stock import fetch_domestic_stocks, fetch_foreign_stocks, fetch_stock_chart
from app.connectors.news import fetch_news


@pytest.mark.anyio
async def test_upbit_crypto_connector():
    quotes = await fetch_crypto_quotes()
    assert isinstance(quotes, list)
    assert len(quotes) > 0
    for q in quotes:
        assert q.symbol in [m[2] for m in CRYPTO_MARKETS]
        assert q.currency == "KRW"
        assert q.price > 0


@pytest.mark.anyio
async def test_metals_connector():
    metals = await fetch_precious_metals()
    assert isinstance(metals, list)
    assert len(metals) >= 2
    metal_types = [m.metal for m in metals]
    assert "gold" in metal_types
    assert "silver" in metal_types


@pytest.mark.anyio
async def test_exchange_rate_connector():
    rates = await fetch_exchange_rates()
    assert isinstance(rates, list)
    assert len(rates) >= 1
    usd_krw = next((r for r in rates if r.quoteCurrency == "KRW"), None)
    assert usd_krw is not None
    assert usd_krw.rate > 0


@pytest.mark.anyio
async def test_market_index_connector():
    indices = await fetch_market_indices()
    assert isinstance(indices, list)
    assert len(indices) >= 2
    names = [i.name for i in indices]
    assert "KOSPI" in names


@pytest.mark.anyio
async def test_domestic_stock_connector():
    stocks = await fetch_domestic_stocks()
    assert isinstance(stocks, list)
    # May be empty if Yahoo Finance is unreachable
    for s in stocks:
        assert s.market == "KR"


@pytest.mark.anyio
async def test_foreign_stock_connector():
    stocks = await fetch_foreign_stocks()
    assert isinstance(stocks, list)
    for s in stocks:
        assert s.market == "US"


@pytest.mark.anyio
async def test_stock_chart_connector():
    chart = await fetch_stock_chart("005930", "1M")
    assert isinstance(chart, list)


@pytest.mark.anyio
async def test_news_connector():
    articles = await fetch_news(limit=5)
    assert isinstance(articles, list)
    assert len(articles) <= 5
    for a in articles:
        assert a.title
        assert a.source
