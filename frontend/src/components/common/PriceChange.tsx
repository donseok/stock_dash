"use client";

import { formatChange, formatPercent, getChangeBadgeClass } from "@/utils/format";

interface PriceChangeProps {
  change: number;
  changePercent: number;
  showPercent?: boolean;
  className?: string;
  badge?: boolean;
}

export function PriceChange({
  change,
  changePercent,
  showPercent = true,
  className = "",
  badge = false,
}: PriceChangeProps) {
  const arrow = change > 0 ? "\u25B2" : change < 0 ? "\u25BC" : "";

  if (badge) {
    return (
      <span className={`${getChangeBadgeClass(change)} ${className}`}>
        {arrow} {formatChange(change)}{" "}
        {showPercent && <span>({formatPercent(changePercent)})</span>}
      </span>
    );
  }

  const colorClass = change > 0 ? "text-up" : change < 0 ? "text-down" : "text-gray-500";

  return (
    <span className={`${colorClass} ${className} text-sm`}>
      {arrow} {formatChange(change)}{" "}
      {showPercent && <span>({formatPercent(changePercent)})</span>}
    </span>
  );
}
