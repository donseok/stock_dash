const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const marketApi = {
  getCryptoQuotes: () =>
    fetchApi<{ data: import("@/types/market").CryptoQuote[] }>(
      "/api/v1/crypto/quotes"
    ),

  getPreciousMetals: () =>
    fetchApi<{ data: import("@/types/market").PreciousMetalQuote[] }>(
      "/api/v1/metals/quotes"
    ),

  getExchangeRates: () =>
    fetchApi<{ data: import("@/types/market").ExchangeRate[] }>(
      "/api/v1/exchange/rates"
    ),

  getMarketIndices: () =>
    fetchApi<{ data: import("@/types/market").MarketIndex[] }>(
      "/api/v1/indices/quotes"
    ),

  getDomesticStocks: (extra?: string[]) => {
    const params = extra?.length
      ? "?" + extra.map((e) => `extra=${encodeURIComponent(e)}`).join("&")
      : "";
    return fetchApi<{ data: import("@/types/market").StockQuote[] }>(
      `/api/v1/stocks/domestic${params}`
    );
  },

  getForeignStocks: (extra?: string[]) => {
    const params = extra?.length
      ? "?" + extra.map((e) => `extra=${encodeURIComponent(e)}`).join("&")
      : "";
    return fetchApi<{ data: import("@/types/market").StockQuote[] }>(
      `/api/v1/stocks/foreign${params}`
    );
  },

  getNews: (limit = 20) =>
    fetchApi<{ data: import("@/types/market").NewsArticle[] }>(
      `/api/v1/news?limit=${limit}`
    ),

  getStockChart: (symbol: string, period = "1M", yf?: string) => {
    const params = new URLSearchParams({ period });
    if (yf) params.set("yf", yf);
    return fetchApi<{ data: import("@/types/market").OHLCData[] }>(
      `/api/v1/stocks/${symbol}/chart?${params}`
    );
  },

  getStockDetail: (symbol: string, yf?: string) => {
    const params = yf ? `?yf=${encodeURIComponent(yf)}` : "";
    return fetchApi<{ data: import("@/types/market").StockDetail }>(
      `/api/v1/stocks/${symbol}/detail${params}`
    );
  },

  searchStocks: (q: string, limit = 10) =>
    fetchApi<{ data: import("@/types/market").StockSearchResult[] }>(
      `/api/v1/stocks/search?q=${encodeURIComponent(q)}&limit=${limit}`
    ),
};
