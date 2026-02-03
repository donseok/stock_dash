"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { StockSearchResult } from "@/types/market";

export type WidgetCategory = "domestic" | "foreign" | "crypto";

export interface TickerOption {
  symbol: string;
  yahooSymbol?: string;
  name: string;
  isDefault: boolean;
}

const DEFAULT_TICKERS: Record<WidgetCategory, Omit<TickerOption, "isDefault">[]> = {
  domestic: [
    { symbol: "058610", yahooSymbol: "058610.KQ", name: "에스피지" },
    { symbol: "247540", yahooSymbol: "247540.KQ", name: "에코프로" },
    { symbol: "068270", yahooSymbol: "068270.KS", name: "셀트리온" },
  ],
  foreign: [
    { symbol: "GOOG", name: "Alphabet C" },
    { symbol: "NVDA", name: "Nvidia" },
    { symbol: "BMNR", name: "Bitmine Immersion" },
    { symbol: "FIG", name: "Figma" },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "XRP", name: "XRP" },
    { symbol: "LINK", name: "Chainlink" },
    { symbol: "SUI", name: "Sui" },
    { symbol: "ONDO", name: "Ondo Finance" },
  ],
};

const STORAGE_KEY = "stock_dash_tickers";
const CUSTOM_STORAGE_KEY = "stock_dash_custom_tickers";

interface StoredCustomTicker {
  symbol: string;
  yahooSymbol: string;
  name: string;
  market: "KR" | "US";
}

function loadSettings(): Record<WidgetCategory, string[]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSettings(settings: Record<WidgetCategory, string[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadCustomTickers(): Record<WidgetCategory, StoredCustomTicker[]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCustomTickers(tickers: Record<WidgetCategory, StoredCustomTicker[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(tickers));
}

export function useTickerSettings(category: WidgetCategory) {
  const defaults = DEFAULT_TICKERS[category];
  const defaultSymbols = defaults.map((t) => t.symbol);

  const [enabledSymbols, setEnabledSymbols] = useState<string[]>(defaultSymbols);
  const [customTickers, setCustomTickers] = useState<StoredCustomTicker[]>([]);

  useEffect(() => {
    const saved = loadSettings();
    if (saved && saved[category]) {
      setEnabledSymbols(saved[category]);
    }
    const savedCustom = loadCustomTickers();
    if (savedCustom && savedCustom[category]) {
      setCustomTickers(savedCustom[category]);
    }
  }, [category]);

  const allTickers: TickerOption[] = useMemo(() => {
    const defaultList: TickerOption[] = defaults.map((t) => ({
      ...t,
      isDefault: true,
    }));
    const customList: TickerOption[] = customTickers.map((t) => ({
      symbol: t.symbol,
      yahooSymbol: t.yahooSymbol,
      name: t.name,
      isDefault: false,
    }));
    return [...defaultList, ...customList];
  }, [defaults, customTickers]);

  const toggleSymbol = useCallback(
    (symbol: string) => {
      setEnabledSymbols((prev) => {
        const next = prev.includes(symbol)
          ? prev.filter((s) => s !== symbol)
          : [...prev, symbol];
        const saved = loadSettings() || {
          domestic: DEFAULT_TICKERS.domestic.map((t) => t.symbol),
          foreign: DEFAULT_TICKERS.foreign.map((t) => t.symbol),
          crypto: DEFAULT_TICKERS.crypto.map((t) => t.symbol),
        };
        saved[category] = next;
        saveSettings(saved);
        return next;
      });
    },
    [category]
  );

  const addCustomStock = useCallback(
    (result: StockSearchResult) => {
      const newTicker: StoredCustomTicker = {
        symbol: result.symbol,
        yahooSymbol: result.yahooSymbol,
        name: result.name,
        market: result.market,
      };

      setCustomTickers((prev) => {
        if (prev.some((t) => t.symbol === result.symbol)) return prev;
        const next = [...prev, newTicker];
        const savedCustom = loadCustomTickers() || { domestic: [], foreign: [], crypto: [] };
        savedCustom[category] = next;
        saveCustomTickers(savedCustom);
        return next;
      });

      // Also enable it
      setEnabledSymbols((prev) => {
        if (prev.includes(result.symbol)) return prev;
        const next = [...prev, result.symbol];
        const saved = loadSettings() || {
          domestic: DEFAULT_TICKERS.domestic.map((t) => t.symbol),
          foreign: DEFAULT_TICKERS.foreign.map((t) => t.symbol),
          crypto: DEFAULT_TICKERS.crypto.map((t) => t.symbol),
        };
        saved[category] = next;
        saveSettings(saved);
        return next;
      });
    },
    [category]
  );

  const removeCustomStock = useCallback(
    (symbol: string) => {
      setCustomTickers((prev) => {
        const next = prev.filter((t) => t.symbol !== symbol);
        const savedCustom = loadCustomTickers() || { domestic: [], foreign: [], crypto: [] };
        savedCustom[category] = next;
        saveCustomTickers(savedCustom);
        return next;
      });

      // Also disable it
      setEnabledSymbols((prev) => {
        const next = prev.filter((s) => s !== symbol);
        const saved = loadSettings() || {
          domestic: DEFAULT_TICKERS.domestic.map((t) => t.symbol),
          foreign: DEFAULT_TICKERS.foreign.map((t) => t.symbol),
          crypto: DEFAULT_TICKERS.crypto.map((t) => t.symbol),
        };
        saved[category] = next;
        saveSettings(saved);
        return next;
      });
    },
    [category]
  );

  const resetToDefaults = useCallback(() => {
    setEnabledSymbols(defaultSymbols);
    setCustomTickers([]);
    const saved = loadSettings() || {
      domestic: DEFAULT_TICKERS.domestic.map((t) => t.symbol),
      foreign: DEFAULT_TICKERS.foreign.map((t) => t.symbol),
      crypto: DEFAULT_TICKERS.crypto.map((t) => t.symbol),
    };
    saved[category] = defaultSymbols;
    saveSettings(saved);
    const savedCustom = loadCustomTickers() || { domestic: [], foreign: [], crypto: [] };
    savedCustom[category] = [];
    saveCustomTickers(savedCustom);
  }, [category, defaultSymbols]);

  // Build extra params for API calls
  const extraParams = useMemo(() => {
    return customTickers.map(
      (t) => `${t.yahooSymbol}:${t.symbol}:${t.name}`
    );
  }, [customTickers]);

  // Get yahooSymbol for a given display symbol
  const getYahooSymbol = useCallback(
    (symbol: string): string | undefined => {
      const ticker = allTickers.find((t) => t.symbol === symbol);
      return ticker?.yahooSymbol;
    },
    [allTickers]
  );

  return {
    allTickers,
    enabledSymbols,
    customTickers,
    extraParams,
    toggleSymbol,
    addCustomStock,
    removeCustomStock,
    resetToDefaults,
    isEnabled: (symbol: string) => enabledSymbols.includes(symbol),
    getYahooSymbol,
  };
}
