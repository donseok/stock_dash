"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createChart, IChartApi, CandlestickData, Time } from "lightweight-charts";
import { useStockChart } from "@/hooks/useMarketData";
import { Card } from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

const PERIODS = [
  { label: "1일", value: "1D" },
  { label: "1주", value: "1W" },
  { label: "1개월", value: "1M" },
  { label: "3개월", value: "3M" },
  { label: "1년", value: "1Y" },
];

const DEFAULT_SYMBOLS = [
  { symbol: "058610", name: "에스피지", market: "KR" as const },
  { symbol: "247540", name: "에코프로", market: "KR" as const },
  { symbol: "068270", name: "셀트리온", market: "KR" as const },
  { symbol: "GOOG", name: "Alphabet C", market: "US" as const },
  { symbol: "NVDA", name: "Nvidia", market: "US" as const },
];

function toUnixTimestamp(timeStr: string): number {
  return Math.floor(new Date(timeStr).getTime() / 1000);
}

export function StockChartWidget() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOLS[0]);
  const [period, setPeriod] = useState("1M");

  const { data: chartData, isLoading, error, refetch } = useStockChart(
    selectedSymbol.symbol,
    period
  );

  const isIntraday = period === "1D" || period === "1W";

  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: isIntraday,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderUpColor: "#ef4444",
      borderDownColor: "#3b82f6",
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    if (chartData && chartData.length > 0) {
      const seen = new Set<string>();
      const formattedData: CandlestickData<Time>[] = [];
      for (const d of chartData) {
        const key = d.time;
        if (!seen.has(key)) {
          seen.add(key);
          // For intraday data (contains "T"), convert to Unix timestamp
          const timeValue = d.time.includes("T")
            ? (toUnixTimestamp(d.time) as Time)
            : (d.time as Time);
          formattedData.push({
            time: timeValue,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          });
        }
      }
      formattedData.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
      candleSeries.setData(formattedData);
      chart.timeScale().fitContent();
    }

    return () => {
      chart.remove();
    };
  }, [chartData, isIntraday]);

  useEffect(() => {
    initChart();
  }, [initChart]);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const headerRight = (
    <div className="flex items-center gap-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPeriod(p.value)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            period === p.value
              ? "bg-primary-500 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <Card
      title={`${selectedSymbol.name} (${selectedSymbol.symbol})`}
      headerRight={headerRight}
      accent="chart"
    >
      <div className="flex gap-2 mb-3">
        {DEFAULT_SYMBOLS.map((s) => (
          <button
            key={s.symbol}
            onClick={() => setSelectedSymbol(s)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selectedSymbol.symbol === s.symbol
                ? s.market === "KR"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-indigo-600 text-white border-indigo-600"
                : "text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage onRetry={() => refetch()} />}

      <div ref={chartContainerRef} className="w-full" />
    </Card>
  );
}
