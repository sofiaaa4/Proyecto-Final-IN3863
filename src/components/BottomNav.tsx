import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface BottomNavProps {
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  isLoading?: boolean;
  onBack: () => void;
  onNext: () => void;
  hideNext?: boolean;
}

export function BottomNav({
  canGoBack,
  canGoNext,
  nextLabel = 'Siguiente',
  isLoading = false,
  onBack,
  onNext,
  hideNext = false,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-white/[0.08]">
      <div className="max-w-4xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack || isLoading}
          className={`min-h-[48px] px-5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            canGoBack && !isLoading
              ? 'bg-[#17171C] text-[#F5F5F7] border border-white/[0.1] hover:bg-[#1E1E25] cursor-pointer'
              : 'bg-[#131317] text-[#9898A6]/40 border border-white/[0.04] cursor-not-allowed'
          }`}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Atrás</span>
        </button>

        {!hideNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className={`flex-1 sm:flex-none sm:min-w-[200px] min-h-[48px] px-6 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              canGoNext && !isLoading
                ? 'bg-[#E84142] text-white hover:bg-[#D13637] active:scale-[0.99] cursor-pointer'
                : 'bg-[#E84142]/25 text-white/45 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <span>{nextLabel}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
