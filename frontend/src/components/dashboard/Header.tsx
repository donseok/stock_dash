"use client";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-400" />
          <h1 className="text-lg font-bold text-white">
            Stock Dashboard
          </h1>
          <span className="text-xs text-slate-400 hidden sm:inline">
            주식 웹 포털 대시보드
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-live" />
            <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
