import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import type { AvalancheAnswers, AvalancheQuestionKey } from '../types/ideathon';
import { ErrorBanner } from './ErrorBanner';

interface QuestionMeta {
  key: AvalancheQuestionKey;
  title: string;
  helper: string;
  placeholder: string;
}

const QUESTIONS: QuestionMeta[] = [
  {
    key: 'onChainData',
    title: '¿Qué dato o acción queda registrado en la cadena?',
    helper: 'Piensa en el evento mínimo que necesita quedar inmutable y verificable.',
    placeholder: 'Ej. El hash del certificado de origen, la fecha de cosecha y la firma del inspector.',
  },
  {
    key: 'verifierTrust',
    title: '¿Quién lo verifica y qué confianza se gana?',
    helper: 'Explica quién consulta ese registro y por qué evita disputas o fraudes.',
    placeholder: 'Ej. Cualquier comprador internacional verifica el lote sin depender de intermediarios.',
  },
  {
    key: 'withoutBlockchain',
    title: '¿Qué pasaría sin blockchain?',
    helper: 'Sé honesto: ¿qué fallaría si usaras solo una base de datos tradicional?',
    placeholder: 'Ej. Un único actor podría alterar registros retroactivamente o exigir comisiones opacas.',
  },
  {
    key: 'offChainData',
    title: '¿Qué queda fuera de la cadena y por qué?',
    helper: 'Datos pesados, privados o cambiantes deben vivir off-chain.',
    placeholder: 'Ej. Fotos, documentos personales e historial de chat quedan off-chain por privacidad y costo.',
  },
];

interface Step4AvalancheProps {
  subStep: number; // 0..3 questions, 4 summary
  answers: AvalancheAnswers;
  summary: string;
  isSuggesting: boolean;
  isSummarizing: boolean;
  error: string | null;
  onChangeAnswer: (key: AvalancheQuestionKey, value: string) => void;
  onSuggestAnswer: (key: AvalancheQuestionKey) => void;
  onChangeSummary: (value: string) => void;
  onRegenerateSummary: () => void;
}

export function Step4Avalanche({
  subStep,
  answers,
  summary,
  isSuggesting,
  isSummarizing,
  error,
  onChangeAnswer,
  onSuggestAnswer,
  onChangeSummary,
  onRegenerateSummary,
}: Step4AvalancheProps) {
  if (subStep < 4) {
    const q = QUESTIONS[subStep];
    const value = answers[q.key];

    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9898A6] tabular-nums">
            Paso 4 · Pregunta {subStep + 1} de 4 sobre Avalanche
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            {q.title}
          </h1>
          <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">{q.helper}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`avalanche-${q.key}`} className="text-sm font-medium text-[#F5F5F7]">
              Tu respuesta
            </label>
            <button
              type="button"
              onClick={() => onSuggestAnswer(q.key)}
              disabled={isSuggesting}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#17171C] border border-[#E84142]/40 text-xs sm:text-sm font-semibold text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E84142]" aria-hidden="true" />
                  <span>Sugiriendo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
                  <span>Sugiéreme</span>
                </>
              )}
            </button>
          </div>

          <textarea
            id={`avalanche-${q.key}`}
            rows={5}
            value={value}
            onChange={(e) => onChangeAnswer(q.key, e.target.value)}
            placeholder={q.placeholder}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#131317] border border-white/[0.1] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base leading-relaxed focus:border-[#E84142] transition-colors"
          />
        </div>

        {error && <ErrorBanner message={error} onRetry={() => onSuggestAnswer(q.key)} />}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#9898A6] tabular-nums">
          Paso 4 · Síntesis del rol de Avalanche
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
          El rol de Avalanche en una frase
        </h1>
        <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
          Esta oración resume por qué Avalanche importa en tu solución. Puedes ajustarla antes de generar el prototipo.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRegenerateSummary} />}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="avalanche-summary" className="text-sm font-medium text-[#F5F5F7]">
            Frase resumen
          </label>
          <button
            type="button"
            onClick={onRegenerateSummary}
            disabled={isSummarizing}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#17171C] border border-white/[0.08] text-xs font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSummarizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-[#E84142]" aria-hidden="true" />
            )}
            <span>Regenerar frase</span>
          </button>
        </div>

        {isSummarizing ? (
          <div className="w-full min-h-[132px] p-4 rounded-2xl bg-[#131317] border border-white/[0.08] flex flex-col items-center justify-center gap-2 text-sm text-[#9898A6]">
            <Loader2 className="w-5 h-5 animate-spin text-[#E84142]" aria-hidden="true" />
            <span>Sintetizando las 4 respuestas con Gemini...</span>
          </div>
        ) : (
          <textarea
            id="avalanche-summary"
            rows={4}
            value={summary}
            onChange={(e) => onChangeSummary(e.target.value)}
            placeholder="En [nombre], Avalanche se usa para [verbo] [qué], de modo que [beneficio]."
            className="w-full px-4 py-3.5 rounded-2xl bg-[#131317] border border-white/[0.1] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base leading-relaxed focus:border-[#E84142] transition-colors"
          />
        )}
      </div>
    </section>
  );
}
