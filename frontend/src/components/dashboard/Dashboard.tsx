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

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MarketIndicesBar />

      <div className="max-w-[1920px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main chart area */}
          <div className="lg:col-span-8">
            <StockChartWidget />
          </div>

          {/* Right sidebar - exchange rate + precious metals */}
          <div className="lg:col-span-4 space-y-4">
            <ExchangeRateWidget />
            <PreciousMetalWidget />
          </div>

          {/* Stock widgets row */}
          <div className="lg:col-span-6">
            <DomesticStockWidget />
          </div>
          <div className="lg:col-span-6">
            <ForeignStockWidget />
          </div>

          {/* Crypto + News row */}
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
