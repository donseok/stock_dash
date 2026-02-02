"use client";

import { useMarketIndices } from "@/hooks/useMarketData";
import { formatNumber, formatPercent, getChangeColor } from "@/utils/format";

export function MarketIndicesBar() {
  const { data: indices, isLoading } = useMarketIndices();

  if (isLoading || !indices) {
    return (
      <div className="bg-gray-900 text-white h-10 flex items-center px-4">
        <div className="flex gap-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-32 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white h-10 flex items-center overflow-x-auto">
      <div className="flex gap-6 px-4 min-w-max">
        {indices.map((index) => (
          <div key={index.symbol} className="flex items-center gap-2 text-xs">
            <span className="text-gray-300 font-medium">{index.name}</span>
            <span className="font-mono">{formatNumber(index.value, 2)}</span>
            <span className={getChangeColor(index.change)}>
              {formatPercent(index.changePercent)}
            </span>
            {!index.isOpen && (
              <span className="text-gray-500 text-[10px]">CLOSED</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
