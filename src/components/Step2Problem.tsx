import { Check, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { ProblemSuggestion } from '../types/ideathon';
import { ErrorBanner } from './ErrorBanner';

interface Step2ProblemProps {
  subStep: number;
  targetAudience: string;
  problemSuggestions: ProblemSuggestion[];
  selectedProblemId: string | null;
  problemStatement: string;
  isSuggestingProblems: boolean;
  isDraftingStatement: boolean;
  error: string | null;
  onChangeTargetAudience: (val: string) => void;
  onSuggestProblems: () => void;
  onSelectProblem: (problem: ProblemSuggestion) => void;
  onChangeProblemStatement: (val: string) => void;
  onRegenerateStatement: () => void;
}

export function Step2Problem({
  subStep,
  targetAudience,
  problemSuggestions,
  selectedProblemId,
  problemStatement,
  isSuggestingProblems,
  isDraftingStatement,
  error,
  onChangeTargetAudience,
  onSuggestProblems,
  onSelectProblem,
  onChangeProblemStatement,
  onRegenerateStatement,
}: Step2ProblemProps) {
  if (subStep === 0) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9898A6] tabular-nums">
            Paso 2 · Pregunta 1 de 2
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            ¿A quién quieren ayudar?
          </h1>
          <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
            Describe un perfil de persona, comunidad u organización. Luego pide 5 problemas concretos del track.
          </p>
        </div>

        <div className="space-y-3">
          <label htmlFor="target-audience-input" className="block text-sm font-medium text-[#F5F5F7]">
            Usuario o comunidad objetivo
          </label>
          <textarea
            id="target-audience-input"
            rows={3}
            value={targetAudience}
            onChange={(e) => onChangeTargetAudience(e.target.value)}
            placeholder="Ej. Pequeños productores de café en Latinoamérica que exportan directo"
            className="w-full px-4 py-3 rounded-2xl bg-[#131317] border border-white/[0.1] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base focus:border-[#E84142] transition-colors resize-none"
          />

          <button
            type="button"
            onClick={onSuggestProblems}
            disabled={!targetAudience.trim() || isSuggestingProblems}
            className={`w-full min-h-[52px] px-5 py-3 rounded-2xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
              targetAudience.trim() && !isSuggestingProblems
                ? 'bg-[#E84142] text-white hover:bg-[#D13637] active:scale-[0.99] cursor-pointer'
                : 'bg-[#17171C] text-[#9898A6]/50 border border-white/[0.06] cursor-not-allowed'
            }`}
          >
            {isSuggestingProblems ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Buscando 5 problemas concretos...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Sugiéreme 5 problemas</span>
              </>
            )}
          </button>
        </div>

        {error && <ErrorBanner message={error} onRetry={onSuggestProblems} />}

        {problemSuggestions.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-medium text-[#9898A6]">
              Elige uno de los 5 problemas propuestos
            </h2>
            <div className="space-y-2.5">
              {problemSuggestions.map((prob) => {
                const isSelected = selectedProblemId === prob.id;
                return (
                  <button
                    key={prob.id}
                    type="button"
                    onClick={() => onSelectProblem(prob)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#1A1214] border-[#E84142]'
                        : 'bg-[#131317] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-display font-semibold text-base text-[#F5F5F7] leading-snug">
                        {prob.title}
                      </p>
                      <p className="text-sm text-[#9898A6] leading-relaxed">{prob.description}</p>
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
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#9898A6] tabular-nums">
          Paso 2 · Pregunta 2 de 2
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
          ¿Queda claro el problema?
        </h1>
        <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
          Revisa y edita esta frase hasta que cualquiera entienda a quién ayudan, qué traba tiene y cuánto le cuesta.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRegenerateStatement} />}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="problem-statement-input" className="text-sm font-medium text-[#F5F5F7]">
            Enunciado del problema
          </label>
          <button
            type="button"
            onClick={onRegenerateStatement}
            disabled={isDraftingStatement}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#17171C] border border-white/[0.08] text-xs font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDraftingStatement ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-[#E84142]" aria-hidden="true" />
            )}
            <span>Volver a redactar</span>
          </button>
        </div>

        {isDraftingStatement ? (
          <div className="w-full min-h-[140px] p-4 rounded-2xl bg-[#131317] border border-white/[0.08] flex flex-col items-center justify-center gap-2 text-sm text-[#9898A6]">
            <Loader2 className="w-5 h-5 animate-spin text-[#E84142]" aria-hidden="true" />
            <span>Redactando el enunciado con Gemini...</span>
          </div>
        ) : (
          <textarea
            id="problem-statement-input"
            rows={5}
            value={problemStatement}
            onChange={(e) => onChangeProblemStatement(e.target.value)}
            placeholder="[Persona] tiene que [tarea], pero hoy [obstáculo], lo que le cuesta [tiempo/dinero/confianza]"
            className="w-full px-4 py-3.5 rounded-2xl bg-[#131317] border border-white/[0.1] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base leading-relaxed focus:border-[#E84142] transition-colors"
          />
        )}
      </div>
    </section>
  );
}
