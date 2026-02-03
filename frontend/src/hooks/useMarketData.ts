"use client";

import { useQuery } from "@tanstack/react-query";
import { marketApi } from "@/services/api";

export function useCryptoQuotes() {
  return useQuery({
    queryKey: ["crypto", "quotes"],
    queryFn: marketApi.getCryptoQuotes,
    select: (res) => res.data,
    refetchInterval: 30_000,
  });
}

export function usePreciousMetals() {
  return useQuery({
    queryKey: ["metals", "quotes"],
    queryFn: marketApi.getPreciousMetals,
    select: (res) => res.data,
    refetchInterval: 60_000,
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchange", "rates"],
    queryFn: marketApi.getExchangeRates,
    select: (res) => res.data,
    refetchInterval: 60_000,
  });
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ["indices", "quotes"],
    queryFn: marketApi.getMarketIndices,
    select: (res) => res.data,
    refetchInterval: 30_000,
  });
}

export function useDomesticStocks(extra?: string[]) {
  return useQuery({
    queryKey: ["stocks", "domestic", extra],
    queryFn: () => marketApi.getDomesticStocks(extra),
    select: (res) => res.data,
    refetchInterval: 30_000,
  });
}

export function useForeignStocks(extra?: string[]) {
  return useQuery({
    queryKey: ["stocks", "foreign", extra],
    queryFn: () => marketApi.getForeignStocks(extra),
    select: (res) => res.data,
    refetchInterval: 30_000,
  });
}

export function useNews(limit = 20) {
  return useQuery({
    queryKey: ["news", limit],
    queryFn: () => marketApi.getNews(limit),
    select: (res) => res.data,
    refetchInterval: 60_000,
  });
}

export function useStockChart(symbol: string, period = "1M", yf?: string) {
  return useQuery({
    queryKey: ["chart", symbol, period, yf],
    queryFn: () => marketApi.getStockChart(symbol, period, yf),
    select: (res) => res.data,
    enabled: !!symbol,
  });
}

export function useStockDetail(symbol: string, yf?: string) {
  return useQuery({
    queryKey: ["stock", "detail", symbol, yf],
    queryFn: () => marketApi.getStockDetail(symbol, yf),
    select: (res) => res.data,
    enabled: !!symbol,
    refetchInterval: 30_000,
  });
}

export function useStockSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["stock", "search", query],
    queryFn: () => marketApi.searchStocks(query),
    select: (res) => res.data,
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
