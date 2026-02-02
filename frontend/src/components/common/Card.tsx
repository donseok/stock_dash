"use client";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  accent?: "domestic" | "foreign" | "crypto" | "gold" | "forex" | "news" | "chart" | "default";
}

const accentColors: Record<string, string> = {
  domestic: "border-l-emerald-500",
  foreign: "border-l-indigo-500",
  crypto: "border-l-violet-500",
  gold: "border-l-amber-500",
  forex: "border-l-cyan-500",
  news: "border-l-rose-500",
  chart: "border-l-primary-500",
  default: "border-l-slate-300 dark:border-l-slate-600",
};

export function Card({ title, children, className = "", headerRight, accent }: CardProps) {
  const accentClass = accent ? `border-l-[3px] ${accentColors[accent] || accentColors.default}` : "";

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200/60 dark:border-slate-700 ${accentClass} ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-lg">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
          {headerRight}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

