"use client";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

export function Card({ title, children, className = "", headerRight }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {headerRight}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
