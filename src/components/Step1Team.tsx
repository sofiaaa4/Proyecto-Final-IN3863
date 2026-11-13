import { Check, Plus, Trash2 } from 'lucide-react';
import { AVALANCHE_TRACKS } from '../types/ideathon';
import type { TrackId } from '../types/ideathon';

interface Step1TeamProps {
  subStep: number;
  teamName: string;
  members: string[];
  trackId: TrackId | null;
  onChangeTeamName: (value: string) => void;
  onChangeMembers: (members: string[]) => void;
  onSelectTrack: (trackId: TrackId) => void;
}

export function Step1Team({
  subStep,
  teamName,
  members,
  trackId,
  onChangeTeamName,
  onChangeMembers,
  onSelectTrack,
}: Step1TeamProps) {
  const handleMemberChange = (index: number, value: string) => {
    const next = [...members];
    next[index] = value;
    onChangeMembers(next);
  };

  const handleAddMember = () => {
    if (members.length < 3) {
      onChangeMembers([...members, '']);
    }
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      onChangeMembers(members.filter((_, i) => i !== index));
    }
  };

  if (subStep === 0) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9898A6] tabular-nums">
            Paso 1 · Pregunta 1 de 3
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            ¿Cómo se llama tu equipo?
          </h1>
          <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
            Usa el nombre con el que se inscribieron o uno provisional para identificar el proyecto.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="team-name-input" className="block text-sm font-medium text-[#F5F5F7]">
            Nombre del equipo
          </label>
          <input
            id="team-name-input"
            type="text"
            value={teamName}
            onChange={(e) => onChangeTeamName(e.target.value)}
            placeholder="Ej. Andino Labs"
            maxLength={60}
            className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-[#131317] border border-white/[0.1] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base focus:border-[#E84142] transition-colors"
            autoFocus
          />
        </div>
      </section>
    );
  }

  if (subStep === 1) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#9898A6] tabular-nums">
            Paso 1 · Pregunta 2 de 3
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            ¿Quiénes integran el equipo?
          </h1>
          <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
            Agrega hasta 3 integrantes. Estos nombres aparecerán en tu README final.
          </p>
        </div>

        <div className="space-y-3">
          {members.map((member, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor={`member-${idx}`} className="sr-only">
                  Integrante {idx + 1}
                </label>
                <input
                  id={`member-${idx}`}
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(idx, e.target.value)}
                  placeholder={`Nombre del integrante ${idx + 1}`}
                  maxLength={60}
                  className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-[#131317] border border-white/[0.1] text-[#F5F5F7] placeholder:text-[#9898A6]/50 text-base focus:border-[#E84142] transition-colors"
                />
              </div>
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(idx)}
                  aria-label={`Quitar integrante ${idx + 1}`}
                  className="min-h-[52px] min-w-[52px] rounded-2xl bg-[#131317] border border-white/[0.08] text-[#9898A6] hover:text-[#FF6B6C] hover:border-[#E84142]/40 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}

          {members.length < 3 && (
            <button
              type="button"
              onClick={handleAddMember}
              className="w-full min-h-[48px] px-4 py-3 rounded-2xl border border-dashed border-white/[0.16] text-sm font-medium text-[#F5F5F7] hover:bg-white/[0.04] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E84142]" aria-hidden="true" />
              <span>Agregar integrante ({members.length}/3)</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#9898A6] tabular-nums">
          Paso 1 · Pregunta 3 de 3
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
          ¿En qué track van a competir?
        </h1>
        <p className="text-sm sm:text-base text-[#9898A6] leading-relaxed">
          Elige el track que mejor se alinea con la idea que quieren explorar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AVALANCHE_TRACKS.map((track) => {
          const isSelected = trackId === track.id;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelectTrack(track.id)}
              className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 min-h-[128px] ${
                isSelected
                  ? 'bg-[#1A1214] border-[#E84142]'
                  : 'bg-[#131317] border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-[#F5F5F7] leading-snug">
                  {track.name}
                </h2>
                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-[#E84142] border-[#E84142] text-white'
                      : 'border-white/20 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <p className="text-sm text-[#9898A6] leading-relaxed">{track.shortDescription}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
