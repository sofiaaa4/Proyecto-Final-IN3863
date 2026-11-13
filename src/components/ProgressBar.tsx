import { Check } from 'lucide-react';
import { STEP_LABELS } from '../types/ideathon';

interface ProgressBarProps {
  currentStep: number;
  maxReachedStep: number;
  onSelectStep: (step: number) => void;
}

export function ProgressBar({ currentStep, maxReachedStep, onSelectStep }: ProgressBarProps) {
  return (
    <nav aria-label="Progreso de pasos" className="w-full py-3">
      <ol className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {STEP_LABELS.map((item) => {
          const isCurrent = item.step === currentStep;
          const isCompleted = item.step < currentStep;
          const isClickable = item.step <= maxReachedStep;

          return (
            <li key={item.step}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(item.step)}
                className={`w-full min-h-[44px] px-1.5 py-2 rounded-xl text-left transition-colors flex flex-col justify-between gap-1.5 ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-45'
                } ${
                  isCurrent
                    ? 'bg-[#17171C] border border-[#E84142]/70'
                    : isCompleted
                      ? 'bg-[#131317] border border-white/[0.08] hover:border-white/20'
                      : 'bg-[#131317]/60 border border-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[11px] font-mono font-semibold tabular-nums ${
                      isCurrent
                        ? 'text-[#E84142]'
                        : isCompleted
                          ? 'text-[#F5F5F7]'
                          : 'text-[#9898A6]'
                    }`}
                  >
                    0{item.step}
                  </span>
                  {isCompleted && (
                    <Check className="w-3.5 h-3.5 text-[#E84142]" aria-hidden="true" />
                  )}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-medium truncate w-full ${
                    isCurrent ? 'text-[#F5F5F7]' : 'text-[#9898A6]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
