"use client";

import { Header } from "./Header";
import { MarketIndicesBar } from "@/components/widgets/MarketIndicesBar";
import { CryptoWidget } from "@/components/widgets/CryptoWidget";
import { PreciousMetalWidget } from "@/components/widgets/PreciousMetalWidget";
import { ExchangeRateWidget } from "@/components/widgets/ExchangeRateWidget";
import { DomesticStockWidget } from "@/components/widgets/DomesticStockWidget";
import { ForeignStockWidget } from "@/components/widgets/ForeignStockWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { StockChartWidget } from "@/components/charts/StockChartWidget";
import { StockDetailPanel } from "@/components/widgets/StockDetailPanel";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <MarketIndicesBar />

      <div className="max-w-[1920px] mx-auto px-4 py-5">
        {/* Chart & Rates Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <StockChartWidget />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <ExchangeRateWidget />
            <PreciousMetalWidget />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">종목 현황</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Stocks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <StockDetailPanel />
          </div>
          <div className="lg:col-span-4">
            <DomesticStockWidget />
          </div>
          <div className="lg:col-span-4">
            <ForeignStockWidget />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">크립토 &amp; 뉴스</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Crypto & News Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <CryptoWidget />
          </div>
          <div className="lg:col-span-4">
            <NewsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
