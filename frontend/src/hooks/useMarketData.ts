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

export function useDomesticStocks() {
  return useQuery({
    queryKey: ["stocks", "domestic"],
    queryFn: marketApi.getDomesticStocks,
    select: (res) => res.data,
    refetchInterval: 30_000,
  });
}

export function useForeignStocks() {
  return useQuery({
    queryKey: ["stocks", "foreign"],
    queryFn: marketApi.getForeignStocks,
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

export function useStockChart(symbol: string, period = "1M") {
  return useQuery({
    queryKey: ["chart", symbol, period],
    queryFn: () => marketApi.getStockChart(symbol, period),
    select: (res) => res.data,
    enabled: !!symbol,
  });
}

export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ["stock", "detail", symbol],
    queryFn: () => marketApi.getStockDetail(symbol),
    select: (res) => res.data,
    enabled: !!symbol,
    refetchInterval: 30_000,
  });
}
