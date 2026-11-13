import { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  History,
  Loader2,
  Maximize2,
  Send,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import type { PrototypeVersion } from '../types/ideathon';
import { ErrorBanner } from './ErrorBanner';

interface Step5PrototypeProps {
  versions: PrototypeVersion[];
  activeVersionIndex: number;
  isGenerating: boolean;
  error: string | null;
  onGenerateInitial: () => void;
  onAdjustPrototype: (instruction: string) => Promise<boolean>;
  onSelectVersion: (index: number) => void;
}

export function Step5Prototype({
  versions,
  activeVersionIndex,
  isGenerating,
  error,
  onGenerateInitial,
  onAdjustPrototype,
  onSelectVersion,
}: Step5PrototypeProps) {
  const [instruction, setInstruction] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeVersion = versions[activeVersionIndex] ?? null;

  const handleCopyHtml = async () => {
    if (!activeVersion) return;
    try {
      await navigator.clipboard.writeText(activeVersion.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = instruction.trim();
    if (!trimmed || isGenerating) return;
    const ok = await onAdjustPrototype(trimmed);
    if (ok) {
      setInstruction('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#9898A6] tabular-nums">
          Paso 5 · Prototipo navegable
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
          Tu demo móvil lista para probar
        </h1>
        <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
          Genera una aplicación HTML autocontenida con pantallas navegables, billetera simulada y registro simulado en Avalanche.
        </p>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={
            activeVersion && instruction.trim()
              ? () => onAdjustPrototype(instruction.trim())
              : onGenerateInitial
          }
        />
      )}

      {!activeVersion ? (
        <div className="rounded-3xl bg-[#131317] border border-white/[0.08] p-6 sm:p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1214] border border-[#E84142]/40 flex items-center justify-center mx-auto">
            <Smartphone className="w-7 h-7 text-[#E84142]" aria-hidden="true" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-display text-xl font-semibold text-[#F5F5F7]">
              Genera el prototipo de tu solución
            </h2>
            <p className="text-sm text-[#9898A6] leading-relaxed">
              Gemini creará de 3 a 5 pantallas interactivas adaptadas al celular con datos realistas en español.
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerateInitial}
            disabled={isGenerating}
            className="w-full sm:w-auto min-h-[52px] px-7 py-3 rounded-2xl bg-[#E84142] text-white font-semibold text-base hover:bg-[#D13637] active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Construyendo prototipo HTML...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                <span>Generar prototipo</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Phone Frame Column */}
          <div className="lg:col-span-6 flex flex-col items-center gap-4">
            <div className="relative w-full max-w-[360px] rounded-[40px] p-3 bg-[#17171C] border border-white/[0.14] shadow-2xl">
              <div className="w-24 h-1.5 bg-[#2A2A34] rounded-full mx-auto mb-2.5" />
              <div className="relative rounded-[28px] overflow-hidden bg-[#0A0A0C] border border-white/[0.06]">
                {isGenerating && (
                  <div className="absolute inset-0 z-10 bg-[#0A0A0C]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <Loader2 className="w-7 h-7 animate-spin text-[#E84142]" aria-hidden="true" />
                    <p className="text-sm font-medium text-[#F5F5F7]">
                      Aplicando ajuste y regenerando pantallas...
                    </p>
                  </div>
                )}
                <iframe
                  title="Vista previa del prototipo"
                  sandbox="allow-scripts"
                  srcDoc={activeVersion.html}
                  className="w-full h-[600px] border-0 block bg-[#0A0A0C]"
                />
              </div>
            </div>

            {/* Action toolbar under phone */}
            <div className="w-full max-w-[360px] grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#17171C] border border-white/[0.1] text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Maximize2 className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
                <span>Pantalla completa</span>
              </button>

              <button
                type="button"
                onClick={handleCopyHtml}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#17171C] border border-white/[0.1] text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#9898A6]" aria-hidden="true" />
                    <span>Copiar código HTML</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Iteration & Version History Column */}
          <div className="lg:col-span-6 space-y-5">
            <form
              onSubmit={handleSubmitAdjust}
              className="rounded-2xl bg-[#131317] border border-white/[0.08] p-5 space-y-4"
            >
              <div className="space-y-1">
                <label
                  htmlFor="prototype-adjust-input"
                  className="block font-display text-base font-semibold text-[#F5F5F7]"
                >
                  ¿Qué quieres cambiar?
                </label>
                <p className="text-xs text-[#9898A6] leading-relaxed">
                  Pide cambios específicos (ej. &ldquo;cambia los botones a verde&rdquo;, &ldquo;agrega una pantalla de historial&rdquo;). Guardamos las versiones anteriores.
                </p>
              </div>

              <textarea
                id="prototype-adjust-input"
                rows={3}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Describe el ajuste que quieres aplicar al prototipo..."
                className="w-full px-3.5 py-3 rounded-xl bg-[#0A0A0C] border border-white/[0.1] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-sm focus:border-[#E84142] resize-none"
              />

              <button
                type="submit"
                disabled={!instruction.trim() || isGenerating}
                className={`w-full min-h-[48px] px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                  instruction.trim() && !isGenerating
                    ? 'bg-[#E84142] text-white hover:bg-[#D13637] cursor-pointer'
                    : 'bg-[#1C1C22] text-[#9898A6]/50 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Ajustando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Ajustar</span>
                  </>
                )}
              </button>
            </form>

            {/* Version history */}
            <div className="rounded-2xl bg-[#131317] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#9898A6]" aria-hidden="true" />
                  <h2 className="font-display text-sm font-semibold text-[#F5F5F7]">
                    Historial de versiones
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#9898A6] tabular-nums">
                  {versions.length} {versions.length === 1 ? 'versión' : 'versiones'}
                </span>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {versions.map((ver, idx) => {
                  const isActive = idx === activeVersionIndex;
                  return (
                    <button
                      key={ver.id}
                      type="button"
                      onClick={() => onSelectVersion(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 min-h-[48px] ${
                        isActive
                          ? 'bg-[#1A1214] border-[#E84142]'
                          : 'bg-[#0A0A0C]/60 border-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className={isActive ? 'text-[#E84142] font-semibold' : 'text-[#F5F5F7]'}>
                            v{ver.version}
                          </span>
                          <span aria-hidden="true" className="text-[#9898A6]">·</span>
                          <span className="text-[#9898A6]">{ver.createdAt}</span>
                        </div>
                        <p className="text-xs text-[#9898A6] truncate">
                          {ver.instruction ? ver.instruction : 'Versión inicial generada'}
                        </p>
                      </div>
                      {isActive && (
                        <Code2 className="w-4 h-4 text-[#E84142] shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Demo Modal */}
      {isFullscreen && activeVersion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Demo en pantalla completa"
          className="fixed inset-0 z-50 bg-[#0A0A0C] flex flex-col"
        >
          <div className="h-14 px-4 border-b border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
            <span className="text-sm font-medium text-[#F5F5F7] truncate">
              Demo en vivo · v{activeVersion.version}
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#17171C] border border-white/[0.1] text-sm font-medium text-[#F5F5F7] hover:bg-[#1E1E25] inline-flex items-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Cerrar</span>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <div className="w-full max-w-[420px] h-full max-h-[820px] rounded-[32px] overflow-hidden border border-white/[0.12] bg-[#0A0A0C]">
              <iframe
                title="Demo en pantalla completa"
                sandbox="allow-scripts"
                srcDoc={activeVersion.html}
                className="w-full h-full border-0 block"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
