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
  { symbol: "058610", name: "에스피지" },
  { symbol: "247540", name: "에코프로" },
  { symbol: "068270", name: "셀트리온" },
];

export function StockChartWidget() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOLS[0]);
  const [period, setPeriod] = useState("1M");

  const { data: chartData, isLoading, error, refetch } = useStockChart(
    selectedSymbol.symbol,
    period
  );

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
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "#e0e0e0",
      },
      timeScale: {
        borderColor: "#e0e0e0",
        timeVisible: true,
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
      const formattedData: CandlestickData<Time>[] = chartData.map((d) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candleSeries.setData(formattedData);
      chart.timeScale().fitContent();
    }

    return () => {
      chart.remove();
    };
  }, [chartData]);

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
    <div className="flex items-center gap-2">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPeriod(p.value)}
          className={`px-2 py-1 text-xs rounded ${
            period === p.value
              ? "bg-primary-500 text-white"
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
    >
      <div className="flex gap-2 mb-3">
        {DEFAULT_SYMBOLS.map((s) => (
          <button
            key={s.symbol}
            onClick={() => setSelectedSymbol(s)}
            className={`px-3 py-1 text-xs rounded-full border ${
              selectedSymbol.symbol === s.symbol
                ? "bg-gray-900 text-white border-gray-900"
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
