export type TrackId =
  | 'ai-agents'
  | 'digital-identity'
  | 'gaming-interactive'
  | 'web3-impact';

export interface TrackInfo {
  id: TrackId;
  name: string;
  shortDescription: string;
}

export const AVALANCHE_TRACKS: TrackInfo[] = [
  {
    id: 'ai-agents',
    name: 'AI Agents On-Chain',
    shortDescription:
      'Agentes de IA que ejecutan tareas bajo permisos y reglas claras, con registro verificable de sus acciones.',
  },
  {
    id: 'digital-identity',
    name: 'Digital Identity & Reputation',
    shortDescription:
      'Identidades, credenciales y reputación verificables, portables entre plataformas.',
  },
  {
    id: 'gaming-interactive',
    name: 'Gaming & Interactive Experiences',
    shortDescription:
      'Juegos y experiencias con activos verificables que conectan comunidades.',
  },
  {
    id: 'web3-impact',
    name: 'Web3 for Real Impact',
    shortDescription:
      'Blockchain aplicada a problemas de comunidades u organizaciones, con trazabilidad.',
  },
];

export interface ProblemSuggestion {
  id: string;
  title: string;
  description: string;
  task: string;
  obstacle: string;
  cost: string;
}

export interface SolutionOption {
  id: string;
  name: string;
  oneLiner: string;
}

export type AvalancheQuestionKey =
  | 'onChainData'
  | 'verifierTrust'
  | 'withoutBlockchain'
  | 'offChainData';

export interface AvalancheAnswers {
  onChainData: string;
  verifierTrust: string;
  withoutBlockchain: string;
  offChainData: string;
}

export interface PrototypeVersion {
  id: string;
  version: number;
  html: string;
  instruction?: string;
  createdAt: string;
}

export interface PitchScript {
  part1: string;
  part2: string;
  part3: string;
  fullText: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'builder-hub',
    label: 'Inscripción del equipo en Builder Hub',
    checked: false,
  },
  {
    id: 'github-repo',
    label: 'Repositorio en GitHub con código y README',
    checked: false,
  },
  {
    id: 'private-link',
    label: 'Enlace del prototipo probado en ventana privada (incógnito)',
    checked: false,
  },
  {
    id: 'pitch-rehearsed',
    label: 'Pitch de 3 minutos ensayado con cronómetro',
    checked: false,
  },
  {
    id: 'links-submitted',
    label: 'Envío de ambos enlaces antes de la hora límite',
    checked: false,
  },
];

export interface IdeathonState {
  currentStep: number; // 1 to 6
  subStep: number; // sub-screen index within step
  teamName: string;
  members: string[];
  trackId: TrackId | null;
  targetAudience: string;
  problemSuggestions: ProblemSuggestion[];
  selectedProblemId: string | null;
  problemStatement: string;
  solutionOptions: SolutionOption[];
  selectedSolutionId: string | null; // 'custom' when writing own
  customSolutionName: string;
  customSolutionOneLiner: string;
  avalancheAnswers: AvalancheAnswers;
  avalancheSummary: string;
  prototypeVersions: PrototypeVersion[];
  activeVersionIndex: number;
  readmeMarkdown: string;
  pitchScript: PitchScript | null;
  checklist: ChecklistItem[];
}

export const INITIAL_STATE: IdeathonState = {
  currentStep: 1,
  subStep: 0,
  teamName: '',
  members: [''],
  trackId: null,
  targetAudience: '',
  problemSuggestions: [],
  selectedProblemId: null,
  problemStatement: '',
  solutionOptions: [],
  selectedSolutionId: null,
  customSolutionName: '',
  customSolutionOneLiner: '',
  avalancheAnswers: {
    onChainData: '',
    verifierTrust: '',
    withoutBlockchain: '',
    offChainData: '',
  },
  avalancheSummary: '',
  prototypeVersions: [],
  activeVersionIndex: 0,
  readmeMarkdown: '',
  pitchScript: null,
  checklist: DEFAULT_CHECKLIST,
};

export const STEP_LABELS = [
  { step: 1, label: 'Equipo' },
  { step: 2, label: 'Problema' },
  { step: 3, label: 'Solución' },
  { step: 4, label: 'Avalanche' },
  { step: 5, label: 'Prototipo' },
  { step: 6, label: 'Entrega' },
];

export const STORAGE_KEY = 'ideathon_studio_state_v1';

export function loadIdeathonState(): IdeathonState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<IdeathonState>;
    return {
      ...INITIAL_STATE,
      ...parsed,
      members:
        Array.isArray(parsed.members) && parsed.members.length > 0
          ? parsed.members.slice(0, 3)
          : [''],
      avalancheAnswers: {
        ...INITIAL_STATE.avalancheAnswers,
        ...(parsed.avalancheAnswers || {}),
      },
      checklist:
        Array.isArray(parsed.checklist) && parsed.checklist.length === DEFAULT_CHECKLIST.length
          ? parsed.checklist
          : DEFAULT_CHECKLIST,
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveIdeathonState(state: IdeathonState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function getActiveSolution(state: IdeathonState): { name: string; oneLiner: string } | null {
  if (state.selectedSolutionId === 'custom') {
    if (!state.customSolutionName.trim() || !state.customSolutionOneLiner.trim()) {
      return null;
    }
    return {
      name: state.customSolutionName.trim(),
      oneLiner: state.customSolutionOneLiner.trim(),
    };
  }
  const found = state.solutionOptions.find((s) => s.id === state.selectedSolutionId);
  return found && found.name.trim()
    ? { name: found.name.trim(), oneLiner: found.oneLiner.trim() }
    : null;
}
