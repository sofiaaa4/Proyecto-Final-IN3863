import { useState } from 'react';
import { Check, Copy, Loader2, RefreshCw, CheckSquare, Square } from 'lucide-react';
import type { ChecklistItem, PitchScript } from '../types/ideathon';
import { ErrorBanner } from './ErrorBanner';

interface Step6DeliveryProps {
  subStep: number; // 0: README, 1: Pitch, 2: Checklist
  readmeMarkdown: string;
  pitchScript: PitchScript | null;
  checklist: ChecklistItem[];
  isLoading: boolean;
  error: string | null;
  onChangeSubStep: (sub: number) => void;
  onRegenerate: () => void;
  onToggleChecklist: (id: string) => void;
}

export function Step6Delivery({
  subStep,
  readmeMarkdown,
  pitchScript,
  checklist,
  isLoading,
  error,
  onChangeSubStep,
  onRegenerate,
  onToggleChecklist,
}: Step6DeliveryProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const completedCount = checklist.filter((c) => c.checked).length;

  const checklistText = checklist
    .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.label}`)
    .join('\n');

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9898A6] tabular-nums">
            Paso 6 · Entrega final
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            Kit listo para enviar
          </h1>
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
          <span>Regenerar textos</span>
        </button>
      </div>

      {/* Sub-navigation tabs */}
      <div
        role="tablist"
        aria-label="Secciones de entrega"
        className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#131317] border border-white/[0.08]"
      >
        {[
          { idx: 0, label: 'README' },
          { idx: 1, label: 'Pitch 3 min' },
          { idx: 2, label: 'Checklist' },
        ].map((tab) => {
          const active = subStep === tab.idx;
          return (
            <button
              key={tab.idx}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onChangeSubStep(tab.idx)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#E84142] text-white'
                  : 'text-[#9898A6] hover:text-[#F5F5F7]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <ErrorBanner message={error} onRetry={onRegenerate} />}

      {isLoading && subStep !== 2 ? (
        <div className="rounded-2xl bg-[#131317] border border-white/[0.08] p-10 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#E84142]" aria-hidden="true" />
          <p className="text-sm text-[#9898A6]">
            Generando README en Markdown y guion de pitch de 3 minutos...
          </p>
        </div>
      ) : (
        <>
          {subStep === 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-[#F5F5F7]">
                  README.md
                </h2>
                <button
                  type="button"
                  onClick={() => copyText('readme', readmeMarkdown)}
                  disabled={!readmeMarkdown}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#17171C] border border-white/[0.1] text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {copiedKey === 'readme' ? (
                    <>
                      <Check className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#9898A6]" aria-hidden="true" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl bg-[#131317] border border-white/[0.08] p-4 sm:p-5">
                <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-[#E4E4EA] leading-relaxed overflow-x-auto">
                  {readmeMarkdown || 'Presiona "Regenerar textos" para crear el README.'}
                </pre>
              </div>
            </div>
          )}

          {subStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-[#F5F5F7]">
                  Guion de pitch (3 minutos)
                </h2>
                <button
                  type="button"
                  onClick={() => copyText('pitch', pitchScript?.fullText ?? '')}
                  disabled={!pitchScript}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#17171C] border border-white/[0.1] text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {copiedKey === 'pitch' ? (
                    <>
                      <Check className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#9898A6]" aria-hidden="true" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {pitchScript ? (
                <div className="space-y-3">
                  {[
                    {
                      time: '0:00 – 0:45',
                      title: 'Problema',
                      body: pitchScript.part1,
                    },
                    {
                      time: '0:45 – 1:45',
                      title: 'Solución y rol de Avalanche',
                      body: pitchScript.part2,
                    },
                    {
                      time: '1:45 – 3:00',
                      title: 'Demo y cierre',
                      body: pitchScript.part3,
                    },
                  ].map((block) => (
                    <article
                      key={block.time}
                      className="rounded-2xl bg-[#131317] border border-white/[0.08] p-5 space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-[#E84142] font-semibold tabular-nums">
                          {block.time}
                        </span>
                        <span aria-hidden="true" className="text-[#9898A6]">·</span>
                        <span className="text-[#F5F5F7] font-sans font-semibold text-sm">
                          {block.title}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-[#E4E4EA] leading-relaxed whitespace-pre-line">
                        {block.body}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#131317] border border-white/[0.08] p-6 text-sm text-[#9898A6]">
                  Presiona &ldquo;Regenerar textos&rdquo; para crear el guion de pitch.
                </div>
              )}
            </div>
          )}

          {subStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#F5F5F7]">
                    Checklist final de entrega
                  </h2>
                  <p className="text-xs text-[#9898A6] tabular-nums">
                    {completedCount} de {checklist.length} completados
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyText('checklist', checklistText)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#17171C] border border-white/[0.1] text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center gap-2 cursor-pointer"
                >
                  {copiedKey === 'checklist' ? (
                    <>
                      <Check className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#9898A6]" aria-hidden="true" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggleChecklist(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-colors flex items-center gap-3.5 min-h-[56px] cursor-pointer ${
                      item.checked
                        ? 'bg-[#1A1214] border-[#E84142]/60'
                        : 'bg-[#131317] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {item.checked ? (
                      <CheckSquare className="w-5 h-5 text-[#E84142] shrink-0" aria-hidden="true" />
                    ) : (
                      <Square className="w-5 h-5 text-[#9898A6] shrink-0" aria-hidden="true" />
                    )}
                    <span
                      className={`text-sm sm:text-base font-medium leading-snug ${
                        item.checked ? 'text-[#F5F5F7] line-through opacity-80' : 'text-[#F5F5F7]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
