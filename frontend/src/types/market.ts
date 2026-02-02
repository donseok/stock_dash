/** Common market data types for stock_dash */

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: string;
  market: "KR" | "US";
}

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: string;
  currency: "KRW" | "USD";
}

export interface PreciousMetalQuote {
  metal: "gold" | "silver";
  pricePerOz: number;
  pricePerGram: number;
  change: number;
  changePercent: number;
  currency: "USD" | "KRW";
  timestamp: string;
}

export interface ExchangeRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  market: "KR" | "US" | "JP" | "EU";
  isOpen: boolean;
  timestamp: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  relatedSymbols: string[];
  category: string;
}

export interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  week52High: number;
  week52Low: number;
  marketCap?: number;
  market: "KR" | "US";
  timestamp: string;
}

export interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type WidgetType =
  | "stock-chart"
  | "crypto-price"
  | "precious-metal"
  | "market-index"
  | "exchange-rate"
  | "news-feed"
  | "stock-detail";

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}
