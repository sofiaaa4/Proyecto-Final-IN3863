import type {
  AvalancheAnswers,
  AvalancheQuestionKey,
  PitchScript,
  ProblemSuggestion,
  SolutionOption,
} from '../types/ideathon';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Sin conexión con el servidor. Verifica tu red e intenta nuevamente.');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('El servidor devolvió una respuesta inesperada. Intenta nuevamente.');
  }

  if (!response.ok) {
    const errMsg =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: unknown }).error)
        : 'Ocurrió un error al consultar a Gemini.';
    throw new Error(errMsg);
  }

  return data as T;
}

export async function suggestProblems(params: {
  trackName: string;
  trackDescription: string;
  targetAudience: string;
  teamName: string;
}): Promise<ProblemSuggestion[]> {
  const data = await postJson<{ problems: ProblemSuggestion[] }>('/api/suggest-problems', params);
  return data.problems;
}

export async function draftProblemStatement(params: {
  trackName: string;
  targetAudience: string;
  problemTitle: string;
  problemDescription: string;
  task?: string;
  obstacle?: string;
  cost?: string;
}): Promise<string> {
  const data = await postJson<{ statement: string }>('/api/draft-problem-statement', params);
  return data.statement;
}

export async function suggestSolutions(params: {
  trackName: string;
  trackDescription: string;
  targetAudience: string;
  problemStatement: string;
}): Promise<SolutionOption[]> {
  const data = await postJson<{ solutions: SolutionOption[] }>('/api/suggest-solutions', params);
  return data.solutions;
}

export async function suggestAvalancheAnswer(params: {
  questionKey: AvalancheQuestionKey;
  trackName: string;
  problemStatement: string;
  solutionName: string;
  solutionOneLiner: string;
  previousAnswers: AvalancheAnswers;
}): Promise<string> {
  const data = await postJson<{ suggestion: string }>('/api/suggest-avalanche-answer', params);
  return data.suggestion;
}

export async function summarizeAvalancheRole(params: {
  solutionName: string;
  teamName: string;
  trackName: string;
  problemStatement: string;
  avalancheAnswers: AvalancheAnswers;
}): Promise<string> {
  const data = await postJson<{ summary: string }>('/api/summarize-avalanche-role', params);
  return data.summary;
}

export async function generatePrototype(params: {
  teamName: string;
  members: string[];
  trackName: string;
  targetAudience: string;
  problemStatement: string;
  solutionName: string;
  solutionOneLiner: string;
  avalancheSummary: string;
  avalancheAnswers: AvalancheAnswers;
  currentHtml?: string;
  adjustmentInstruction?: string;
}): Promise<string> {
  const data = await postJson<{ html: string }>('/api/generate-prototype', params);
  return data.html;
}

export async function generateDeliverables(params: {
  teamName: string;
  members: string[];
  trackName: string;
  trackDescription: string;
  targetAudience: string;
  problemStatement: string;
  solutionName: string;
  solutionOneLiner: string;
  avalancheAnswers: AvalancheAnswers;
  avalancheSummary: string;
  prototypeHtml?: string;
}): Promise<{ readmeMarkdown: string; pitchScript: PitchScript }> {
  return postJson<{ readmeMarkdown: string; pitchScript: PitchScript }>(
    '/api/generate-deliverables',
    params
  );
}
