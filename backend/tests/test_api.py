"""API endpoint tests for stock_dash backend."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.anyio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "running"


@pytest.mark.anyio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


@pytest.mark.anyio
async def test_crypto_quotes(client):
    resp = await client.get("/api/v1/crypto/quotes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


@pytest.mark.anyio
async def test_metals_quotes(client):
    resp = await client.get("/api/v1/metals/quotes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


@pytest.mark.anyio
async def test_exchange_rates(client):
    resp = await client.get("/api/v1/exchange/rates")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


@pytest.mark.anyio
async def test_market_indices(client):
    resp = await client.get("/api/v1/indices/quotes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


@pytest.mark.anyio
async def test_domestic_stocks(client):
    resp = await client.get("/api/v1/stocks/domestic")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


@pytest.mark.anyio
async def test_foreign_stocks(client):
    resp = await client.get("/api/v1/stocks/foreign")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


@pytest.mark.anyio
async def test_news(client):
    resp = await client.get("/api/v1/news?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


@pytest.mark.anyio
async def test_stock_detail(client):
    resp = await client.get("/api/v1/stocks/058610/detail")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("success", "error")
    if data["status"] == "success" and data["data"]:
        detail = data["data"]
        assert detail["symbol"] == "058610"
        assert "week52High" in detail
        assert "week52Low" in detail
        assert "price" in detail
        assert "volume" in detail


@pytest.mark.anyio
async def test_stock_chart(client):
    resp = await client.get("/api/v1/stocks/005930/chart?period=1M")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)
