"use client";

import { formatChange, formatPercent, getChangeColor } from "@/utils/format";

interface PriceChangeProps {
  change: number;
  changePercent: number;
  showPercent?: boolean;
  className?: string;
}

export function PriceChange({
  change,
  changePercent,
  showPercent = true,
  className = "",
}: PriceChangeProps) {
  const colorClass = getChangeColor(change);
  const arrow = change > 0 ? "\u25B2" : change < 0 ? "\u25BC" : "";

  return (
    <span className={`${colorClass} ${className} text-sm`}>
      {arrow} {formatChange(change)}{" "}
      {showPercent && <span>({formatPercent(changePercent)})</span>}
    </span>
  );
}
