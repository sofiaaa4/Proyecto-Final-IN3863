import { Check, Loader2, PenLine, RefreshCw } from 'lucide-react';
import type { SolutionOption } from '../types/ideathon';
import { ErrorBanner } from './ErrorBanner';

interface Step3SolutionProps {
  solutionOptions: SolutionOption[];
  selectedSolutionId: string | null;
  customSolutionName: string;
  customSolutionOneLiner: string;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onSelectSolution: (id: string) => void;
  onUpdateSolutionOption: (id: string, patch: { name?: string; oneLiner?: string }) => void;
  onChangeCustomName: (val: string) => void;
  onChangeCustomOneLiner: (val: string) => void;
}

export function Step3Solution({
  solutionOptions,
  selectedSolutionId,
  customSolutionName,
  customSolutionOneLiner,
  isLoading,
  error,
  onRegenerate,
  onSelectSolution,
  onUpdateSolutionOption,
  onChangeCustomName,
  onChangeCustomOneLiner,
}: Step3SolutionProps) {
  const isCustom = selectedSolutionId === 'custom';

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9898A6] tabular-nums">Paso 3 · Solución</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            ¿Qué solución van a prototipar?
          </h1>
          <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
            Elige una de las 3 propuestas simples (puedes editar su nombre) o redacta la tuya propia.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#17171C] border border-white/[0.08] text-xs sm:text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
          )}
          <span>Proponer otras 3</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRegenerate} />}

      {isLoading ? (
        <div className="rounded-2xl bg-[#131317] border border-white/[0.08] p-8 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#E84142]" aria-hidden="true" />
          <p className="text-sm text-[#9898A6]">
            Generando 3 soluciones simples para tu problema...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {solutionOptions.map((sol) => {
            const isSelected = selectedSolutionId === sol.id;
            return (
              <div
                key={sol.id}
                className={`rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#1A1214] border-[#E84142]'
                    : 'bg-[#131317] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSolution(sol.id)}
                  className="w-full text-left p-5 cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-semibold text-[#F5F5F7] leading-snug">
                      {sol.name || 'Sin nombre'}
                    </h2>
                    <p className="text-sm text-[#9898A6] leading-relaxed">{sol.oneLiner}</p>
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#E84142] border-[#E84142] text-white'
                        : 'border-white/20 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </button>

                {isSelected && (
                  <div className="px-5 pb-5 pt-3 border-t border-white/[0.08] space-y-2.5">
                    <label
                      htmlFor={`edit-sol-name-${sol.id}`}
                      className="block text-xs font-medium text-[#9898A6]"
                    >
                      Nombre del proyecto (puedes cambiarlo)
                    </label>
                    <input
                      id={`edit-sol-name-${sol.id}`}
                      type="text"
                      value={sol.name}
                      onChange={(e) =>
                        onUpdateSolutionOption(sol.id, { name: e.target.value })
                      }
                      maxLength={50}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-[#F5F5F7] text-sm font-medium focus:border-[#E84142]"
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div
            className={`rounded-2xl border transition-all ${
              isCustom
                ? 'bg-[#1A1214] border-[#E84142]'
                : 'bg-[#131317] border-white/[0.08] hover:border-white/20'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectSolution('custom')}
              className="w-full text-left p-5 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <PenLine className="w-5 h-5 text-[#E84142] shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-display text-base font-semibold text-[#F5F5F7]">
                    Escribir nuestra propia solución
                  </p>
                  <p className="text-sm text-[#9898A6]">
                    Define el nombre y una línea descriptiva
                  </p>
                </div>
              </div>
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  isCustom
                    ? 'bg-[#E84142] border-[#E84142] text-white'
                    : 'border-white/20 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </button>

            {isCustom && (
              <div className="px-5 pb-5 space-y-3 border-t border-white/[0.08] pt-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="custom-sol-name"
                    className="block text-xs font-medium text-[#9898A6]"
                  >
                    Nombre de la solución
                  </label>
                  <input
                    id="custom-sol-name"
                    type="text"
                    value={customSolutionName}
                    onChange={(e) => onChangeCustomName(e.target.value)}
                    placeholder="Ej. CaféVeritas"
                    maxLength={50}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base focus:border-[#E84142]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="custom-sol-oneliner"
                    className="block text-xs font-medium text-[#9898A6]"
                  >
                    Descripción en una línea
                  </label>
                  <input
                    id="custom-sol-oneliner"
                    type="text"
                    value={customSolutionOneLiner}
                    onChange={(e) => onChangeCustomOneLiner(e.target.value)}
                    placeholder="Ej. Certifica lotes de exportación con prueba verificable de origen en segundos."
                    maxLength={160}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base focus:border-[#E84142]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
