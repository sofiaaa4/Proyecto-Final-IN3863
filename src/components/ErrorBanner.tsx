import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorBanner({
  message,
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl bg-[#E84142]/10 border border-[#E84142]/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#FF6B6C] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-[#F5F5F7] leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E84142] text-white text-sm font-semibold hover:bg-[#D13637] transition-colors inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
