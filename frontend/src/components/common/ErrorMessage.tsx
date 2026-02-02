"use client";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message = "데이터를 불러오는 중 오류가 발생했습니다.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <p className="text-sm text-gray-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-xs text-primary-500 hover:text-primary-700 underline"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
