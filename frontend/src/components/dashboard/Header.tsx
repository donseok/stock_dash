"use client";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">
            Stock Dashboard
          </h1>
          <span className="text-xs text-gray-400 hidden sm:inline">
            주식 웹 포털 대시보드
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </span>
          <div className="w-2 h-2 rounded-full bg-green-400" title="실시간 연결" />
        </div>
      </div>
    </header>
  );
}
