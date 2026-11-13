import { RotateCcw } from 'lucide-react';

interface TopBarProps {
  currentStep: number;
  onRequestReset: () => void;
}

export function TopBar({ currentStep, onRequestReset }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-12 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-4xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#F5F5F7] whitespace-nowrap shrink-0">
          Ideathon Studio
        </span>

        <span className="text-xs sm:text-sm font-medium text-[#9898A6] tabular-nums whitespace-nowrap shrink-0">
          Paso {currentStep} de 6
        </span>

        <button
          type="button"
          onClick={onRequestReset}
          className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#9898A6] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="Reiniciar proyecto"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reiniciar</span>
        </button>
      </div>
    </header>
  );
}
