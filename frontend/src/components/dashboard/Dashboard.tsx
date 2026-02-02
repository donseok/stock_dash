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
import { SummaryWidget } from "@/components/widgets/SummaryWidget";
import { AlertBanner } from "@/components/widgets/AlertBanner";
import { HeatmapWidget } from "@/components/widgets/HeatmapWidget";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 lg:pb-0">
      <Header />
      <AlertBanner />
      <MarketIndicesBar />

      <div className="max-w-[1920px] mx-auto px-4 py-5">
        {/* Summary Section */}
        <section id="summary-section">
          <SummaryWidget />
        </section>

        {/* Chart & Rates Section */}
        <section id="chart-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <StockChartWidget />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <ExchangeRateWidget />
              <PreciousMetalWidget />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">종목 현황</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Stocks Section */}
        <section id="stocks-section">
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
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">시장 히트맵</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Heatmap Section */}
        <section className="mb-5">
          <HeatmapWidget />
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">크립토 &amp; 뉴스</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Crypto & News Section */}
        <section id="news-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <CryptoWidget />
            </div>
            <div className="lg:col-span-4">
              <NewsWidget />
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

