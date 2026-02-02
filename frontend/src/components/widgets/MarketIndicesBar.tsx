"use client";

import { useMarketIndices } from "@/hooks/useMarketData";
import { formatNumber, formatPercent } from "@/utils/format";

export function MarketIndicesBar() {
  const { data: indices, isLoading } = useMarketIndices();

  if (isLoading || !indices) {
    return (
      <div className="bg-slate-900 text-white h-10 flex items-center px-4">
        <div className="flex gap-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-32 bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white h-10 flex items-center overflow-x-auto">
      <div className="flex gap-6 px-4 min-w-max">
        {indices.map((index) => (
          <div key={index.symbol} className="flex items-center gap-2 text-xs">
            <span className="text-slate-300 font-medium">{index.name}</span>
            <span className="font-mono">{formatNumber(index.value, 2)}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                index.change > 0
                  ? "bg-red-500/20 text-red-300"
                  : index.change < 0
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400"
              }`}
            >
              {formatPercent(index.changePercent)}
            </span>
            {!index.isOpen && (
              <span className="text-slate-500 text-[10px]">CLOSED</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
