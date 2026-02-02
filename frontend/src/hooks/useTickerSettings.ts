"use client";

import { useState, useCallback, useEffect } from "react";

export type WidgetCategory = "domestic" | "foreign" | "crypto";

interface TickerOption {
  symbol: string;
  name: string;
}

const DEFAULT_TICKERS: Record<WidgetCategory, TickerOption[]> = {
  domestic: [
    { symbol: "058610", name: "에스피지" },
    { symbol: "247540", name: "에코프로" },
    { symbol: "068270", name: "셀트리온" },
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

export function useTickerSettings(category: WidgetCategory) {
  const defaults = DEFAULT_TICKERS[category];
  const defaultSymbols = defaults.map((t) => t.symbol);

  const [enabledSymbols, setEnabledSymbols] = useState<string[]>(defaultSymbols);

  useEffect(() => {
    const saved = loadSettings();
    if (saved && saved[category]) {
      setEnabledSymbols(saved[category]);
    }
  }, [category]);

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

  const resetToDefaults = useCallback(() => {
    setEnabledSymbols(defaultSymbols);
    const saved = loadSettings() || {
      domestic: DEFAULT_TICKERS.domestic.map((t) => t.symbol),
      foreign: DEFAULT_TICKERS.foreign.map((t) => t.symbol),
      crypto: DEFAULT_TICKERS.crypto.map((t) => t.symbol),
    };
    saved[category] = defaultSymbols;
    saveSettings(saved);
  }, [category, defaultSymbols]);

  return {
    allTickers: defaults,
    enabledSymbols,
    toggleSymbol,
    resetToDefaults,
    isEnabled: (symbol: string) => enabledSymbols.includes(symbol),
  };
}
