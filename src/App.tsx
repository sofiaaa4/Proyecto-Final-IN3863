import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  AVALANCHE_TRACKS,
  INITIAL_STATE,
  getActiveSolution,
  loadIdeathonState,
  saveIdeathonState,
} from './types/ideathon';
import type {
  AvalancheQuestionKey,
  IdeathonState,
  ProblemSuggestion,
  PrototypeVersion,
} from './types/ideathon';
import * as api from './services/api';
import { TopBar } from './components/TopBar';
import { ProgressBar } from './components/ProgressBar';
import { BottomNav } from './components/BottomNav';
import { Step1Team } from './components/Step1Team';
import { Step2Problem } from './components/Step2Problem';
import { Step3Solution } from './components/Step3Solution';
import { Step4Avalanche } from './components/Step4Avalanche';
import { Step5Prototype } from './components/Step5Prototype';
import { Step6Delivery } from './components/Step6Delivery';

export default function App() {
  const [state, setState] = useState<IdeathonState>(() => loadIdeathonState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Persist every state change in localStorage
  useEffect(() => {
    saveIdeathonState(state);
  }, [state]);

  // Clear transient errors when changing screens
  useEffect(() => {
    setError(null);
  }, [state.currentStep, state.subStep]);

  const activeTrack = useMemo(
    () => AVALANCHE_TRACKS.find((t) => t.id === state.trackId) ?? null,
    [state.trackId]
  );

  const activeSolution = useMemo(() => getActiveSolution(state), [state]);

  const maxReachedStep = useMemo(() => {
    let max = 1;
    if (
      state.teamName.trim() &&
      state.members.some((m) => m.trim()) &&
      state.trackId
    ) {
      max = 2;
    }
    if (max >= 2 && state.problemStatement.trim()) {
      max = 3;
    }
    if (max >= 3 && activeSolution) {
      max = 4;
    }
    if (max >= 4 && state.avalancheSummary.trim()) {
      max = 5;
    }
    if (max >= 5 && state.prototypeVersions.length > 0) {
      max = 6;
    }
    return Math.max(max, state.currentStep);
  }, [state, activeSolution]);

  const canGoBack = !(state.currentStep === 1 && state.subStep === 0);

  const canGoNext = useMemo(() => {
    const { currentStep, subStep } = state;
    if (currentStep === 1) {
      if (subStep === 0) return state.teamName.trim().length > 0;
      if (subStep === 1) return state.members.some((m) => m.trim().length > 0);
      if (subStep === 2) return state.trackId !== null;
    }
    if (currentStep === 2) {
      if (subStep === 0) return state.selectedProblemId !== null;
      if (subStep === 1) return state.problemStatement.trim().length > 5;
    }
    if (currentStep === 3) {
      return activeSolution !== null;
    }
    if (currentStep === 4) {
      const keys: AvalancheQuestionKey[] = [
        'onChainData',
        'verifierTrust',
        'withoutBlockchain',
        'offChainData',
      ];
      if (subStep < 4) {
        return state.avalancheAnswers[keys[subStep]].trim().length > 0;
      }
      return state.avalancheSummary.trim().length > 5;
    }
    if (currentStep === 5) {
      return state.prototypeVersions.length > 0;
    }
    if (currentStep === 6) {
      return subStep < 2;
    }
    return false;
  }, [state, activeSolution]);

  // --- API Actions ---

  const handleSuggestProblems = async () => {
    if (!activeTrack || !state.targetAudience.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const problems = await api.suggestProblems({
        trackName: activeTrack.name,
        trackDescription: activeTrack.shortDescription,
        targetAudience: state.targetAudience.trim(),
        teamName: state.teamName.trim(),
      });
      setState((prev) => ({
        ...prev,
        problemSuggestions: problems,
        selectedProblemId: null,
        problemStatement: '',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al sugerir problemas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftStatement = async (problemOverride?: ProblemSuggestion) => {
    if (!activeTrack) return;
    const problem =
      problemOverride ??
      state.problemSuggestions.find((p) => p.id === state.selectedProblemId);
    if (!problem) return;

    setIsLoading(true);
    setError(null);
    try {
      const statement = await api.draftProblemStatement({
        trackName: activeTrack.name,
        targetAudience: state.targetAudience.trim(),
        problemTitle: problem.title,
        problemDescription: problem.description,
        task: problem.task,
        obstacle: problem.obstacle,
        cost: problem.cost,
      });
      setState((prev) => ({ ...prev, problemStatement: statement }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al redactar el enunciado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestSolutions = async () => {
    if (!activeTrack || !state.problemStatement.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const solutions = await api.suggestSolutions({
        trackName: activeTrack.name,
        trackDescription: activeTrack.shortDescription,
        targetAudience: state.targetAudience.trim(),
        problemStatement: state.problemStatement.trim(),
      });
      setState((prev) => ({
        ...prev,
        solutionOptions: solutions,
        selectedSolutionId:
          prev.selectedSolutionId === 'custom' ? 'custom' : solutions[0]?.id ?? null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al proponer soluciones.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestAvalancheAnswer = async (key: AvalancheQuestionKey) => {
    if (!activeTrack || !activeSolution) return;
    setIsLoading(true);
    setError(null);
    try {
      const suggestion = await api.suggestAvalancheAnswer({
        questionKey: key,
        trackName: activeTrack.name,
        problemStatement: state.problemStatement.trim(),
        solutionName: activeSolution.name,
        solutionOneLiner: activeSolution.oneLiner,
        previousAnswers: state.avalancheAnswers,
      });
      setState((prev) => ({
        ...prev,
        avalancheAnswers: {
          ...prev.avalancheAnswers,
          [key]: suggestion,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar sugerencia.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeAvalanche = async () => {
    if (!activeTrack || !activeSolution) return;
    setIsLoading(true);
    setError(null);
    try {
      const summary = await api.summarizeAvalancheRole({
        solutionName: activeSolution.name,
        teamName: state.teamName.trim(),
        trackName: activeTrack.name,
        problemStatement: state.problemStatement.trim(),
        avalancheAnswers: state.avalancheAnswers,
      });
      setState((prev) => ({ ...prev, avalancheSummary: summary }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resumir el rol de Avalanche.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePrototype = async () => {
    if (!activeTrack || !activeSolution) return;
    setIsLoading(true);
    setError(null);
    try {
      const html = await api.generatePrototype({
        teamName: state.teamName.trim(),
        members: state.members.filter((m) => m.trim()),
        trackName: activeTrack.name,
        targetAudience: state.targetAudience.trim(),
        problemStatement: state.problemStatement.trim(),
        solutionName: activeSolution.name,
        solutionOneLiner: activeSolution.oneLiner,
        avalancheSummary: state.avalancheSummary.trim(),
        avalancheAnswers: state.avalancheAnswers,
      });

      const now = new Date().toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newVersion: PrototypeVersion = {
        id: `proto-${Date.now()}`,
        version: state.prototypeVersions.length + 1,
        html,
        createdAt: now,
      };
      setState((prev) => {
        const nextVersions = [...prev.prototypeVersions, newVersion];
        return {
          ...prev,
          prototypeVersions: nextVersions,
          activeVersionIndex: nextVersions.length - 1,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el prototipo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustPrototype = async (instruction: string): Promise<boolean> => {
    if (!activeTrack || !activeSolution) return false;
    const current = state.prototypeVersions[state.activeVersionIndex];
    if (!current) return false;

    setIsLoading(true);
    setError(null);
    try {
      const html = await api.generatePrototype({
        teamName: state.teamName.trim(),
        members: state.members.filter((m) => m.trim()),
        trackName: activeTrack.name,
        targetAudience: state.targetAudience.trim(),
        problemStatement: state.problemStatement.trim(),
        solutionName: activeSolution.name,
        solutionOneLiner: activeSolution.oneLiner,
        avalancheSummary: state.avalancheSummary.trim(),
        avalancheAnswers: state.avalancheAnswers,
        currentHtml: current.html,
        adjustmentInstruction: instruction,
      });

      const now = new Date().toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newVersion: PrototypeVersion = {
        id: `proto-${Date.now()}`,
        version: state.prototypeVersions.length + 1,
        html,
        instruction,
        createdAt: now,
      };
      setState((prev) => {
        const nextVersions = [...prev.prototypeVersions, newVersion];
        return {
          ...prev,
          prototypeVersions: nextVersions,
          activeVersionIndex: nextVersions.length - 1,
        };
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ajustar el prototipo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDeliverables = async () => {
    if (!activeTrack || !activeSolution) return;
    setIsLoading(true);
    setError(null);
    try {
      const activeProto = state.prototypeVersions[state.activeVersionIndex];
      const result = await api.generateDeliverables({
        teamName: state.teamName.trim(),
        members: state.members.filter((m) => m.trim()),
        trackName: activeTrack.name,
        trackDescription: activeTrack.shortDescription,
        targetAudience: state.targetAudience.trim(),
        problemStatement: state.problemStatement.trim(),
        solutionName: activeSolution.name,
        solutionOneLiner: activeSolution.oneLiner,
        avalancheAnswers: state.avalancheAnswers,
        avalancheSummary: state.avalancheSummary.trim(),
        prototypeHtml: activeProto?.html,
      });
      setState((prev) => ({
        ...prev,
        readmeMarkdown: result.readmeMarkdown,
        pitchScript: result.pitchScript,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar los entregables.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Navigation ---

  const handleBack = () => {
    if (!canGoBack || isLoading) return;
    const { currentStep, subStep } = state;

    if (subStep > 0) {
      setState((prev) => ({ ...prev, subStep: prev.subStep - 1 }));
      return;
    }

    if (currentStep === 2) setState((prev) => ({ ...prev, currentStep: 1, subStep: 2 }));
    else if (currentStep === 3) setState((prev) => ({ ...prev, currentStep: 2, subStep: 1 }));
    else if (currentStep === 4) setState((prev) => ({ ...prev, currentStep: 3, subStep: 0 }));
    else if (currentStep === 5) setState((prev) => ({ ...prev, currentStep: 4, subStep: 4 }));
    else if (currentStep === 6) setState((prev) => ({ ...prev, currentStep: 5, subStep: 0 }));
  };

  const handleNext = async () => {
    if (!canGoNext || isLoading) return;
    const { currentStep, subStep } = state;

    if (currentStep === 1) {
      if (subStep < 2) {
        setState((prev) => ({ ...prev, subStep: prev.subStep + 1 }));
      } else {
        setState((prev) => ({ ...prev, currentStep: 2, subStep: 0 }));
      }
      return;
    }

    if (currentStep === 2) {
      if (subStep === 0) {
        setState((prev) => ({ ...prev, subStep: 1 }));
        if (!state.problemStatement.trim()) {
          await handleDraftStatement();
        }
      } else {
        setState((prev) => ({ ...prev, currentStep: 3, subStep: 0 }));
        if (state.solutionOptions.length === 0) {
          await handleSuggestSolutions();
        }
      }
      return;
    }

    if (currentStep === 3) {
      setState((prev) => ({ ...prev, currentStep: 4, subStep: 0 }));
      return;
    }

    if (currentStep === 4) {
      if (subStep < 3) {
        setState((prev) => ({ ...prev, subStep: prev.subStep + 1 }));
      } else if (subStep === 3) {
        setState((prev) => ({ ...prev, subStep: 4 }));
        if (!state.avalancheSummary.trim()) {
          await handleSummarizeAvalanche();
        }
      } else {
        setState((prev) => ({ ...prev, currentStep: 5, subStep: 0 }));
      }
      return;
    }

    if (currentStep === 5) {
      setState((prev) => ({ ...prev, currentStep: 6, subStep: 0 }));
      if (!state.readmeMarkdown || !state.pitchScript) {
        await handleGenerateDeliverables();
      }
      return;
    }

    if (currentStep === 6 && subStep < 2) {
      setState((prev) => ({ ...prev, subStep: prev.subStep + 1 }));
    }
  };

  const handleSelectStepFromBar = async (targetStep: number) => {
    if (isLoading || targetStep > maxReachedStep) return;
    setState((prev) => ({ ...prev, currentStep: targetStep, subStep: 0 }));
    if (targetStep === 3 && state.solutionOptions.length === 0 && state.problemStatement.trim()) {
      await handleSuggestSolutions();
    }
    if (
      targetStep === 6 &&
      (!state.readmeMarkdown || !state.pitchScript) &&
      state.prototypeVersions.length > 0
    ) {
      await handleGenerateDeliverables();
    }
  };

  const handleConfirmReset = () => {
    setState(INITIAL_STATE);
    setError(null);
    setShowResetModal(false);
  };

  const nextButtonLabel = useMemo(() => {
    if (state.currentStep === 4 && state.subStep === 4) return 'Ir al prototipo';
    if (state.currentStep === 5) return 'Ir a entrega';
    return 'Siguiente';
  }, [state.currentStep, state.subStep]);

  const screenKey = `${state.currentStep}-${state.subStep}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[#0A0A0C] text-[#F5F5F7] flex flex-col">
        <TopBar
          currentStep={state.currentStep}
          onRequestReset={() => setShowResetModal(true)}
        />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-24">
          <ProgressBar
            currentStep={state.currentStep}
            maxReachedStep={maxReachedStep}
            onSelectStep={handleSelectStepFromBar}
          />

          <div className="pt-2 sm:pt-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={screenKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                {state.currentStep === 1 && (
                  <Step1Team
                    subStep={state.subStep}
                    teamName={state.teamName}
                    members={state.members}
                    trackId={state.trackId}
                    onChangeTeamName={(teamName) =>
                      setState((prev) => ({ ...prev, teamName }))
                    }
                    onChangeMembers={(members) =>
                      setState((prev) => ({ ...prev, members }))
                    }
                    onSelectTrack={(trackId) =>
                      setState((prev) => ({ ...prev, trackId }))
                    }
                  />
                )}

                {state.currentStep === 2 && (
                  <Step2Problem
                    subStep={state.subStep}
                    targetAudience={state.targetAudience}
                    problemSuggestions={state.problemSuggestions}
                    selectedProblemId={state.selectedProblemId}
                    problemStatement={state.problemStatement}
                    isSuggestingProblems={isLoading && state.subStep === 0}
                    isDraftingStatement={isLoading && state.subStep === 1}
                    error={error}
                    onChangeTargetAudience={(targetAudience) =>
                      setState((prev) => ({ ...prev, targetAudience }))
                    }
                    onSuggestProblems={handleSuggestProblems}
                    onSelectProblem={(problem) =>
                      setState((prev) => ({
                        ...prev,
                        selectedProblemId: problem.id,
                        problemStatement: '',
                        solutionOptions: [],
                        selectedSolutionId:
                          prev.selectedSolutionId === 'custom' ? 'custom' : null,
                      }))
                    }
                    onChangeProblemStatement={(problemStatement) =>
                      setState((prev) => ({ ...prev, problemStatement }))
                    }
                    onRegenerateStatement={() => handleDraftStatement()}
                  />
                )}

                {state.currentStep === 3 && (
                  <Step3Solution
                    solutionOptions={state.solutionOptions}
                    selectedSolutionId={state.selectedSolutionId}
                    customSolutionName={state.customSolutionName}
                    customSolutionOneLiner={state.customSolutionOneLiner}
                    isLoading={isLoading}
                    error={error}
                    onRegenerate={handleSuggestSolutions}
                    onSelectSolution={(id) =>
                      setState((prev) => ({ ...prev, selectedSolutionId: id }))
                    }
                    onUpdateSolutionOption={(id, patch) =>
                      setState((prev) => ({
                        ...prev,
                        solutionOptions: prev.solutionOptions.map((opt) =>
                          opt.id === id ? { ...opt, ...patch } : opt
                        ),
                      }))
                    }
                    onChangeCustomName={(customSolutionName) =>
                      setState((prev) => ({ ...prev, customSolutionName }))
                    }
                    onChangeCustomOneLiner={(customSolutionOneLiner) =>
                      setState((prev) => ({ ...prev, customSolutionOneLiner }))
                    }
                  />
                )}

                {state.currentStep === 4 && (
                  <Step4Avalanche
                    subStep={state.subStep}
                    answers={state.avalancheAnswers}
                    summary={state.avalancheSummary}
                    isSuggesting={isLoading && state.subStep < 4}
                    isSummarizing={isLoading && state.subStep === 4}
                    error={error}
                    onChangeAnswer={(key, value) =>
                      setState((prev) => ({
                        ...prev,
                        avalancheAnswers: {
                          ...prev.avalancheAnswers,
                          [key]: value,
                        },
                      }))
                    }
                    onSuggestAnswer={handleSuggestAvalancheAnswer}
                    onChangeSummary={(avalancheSummary) =>
                      setState((prev) => ({ ...prev, avalancheSummary }))
                    }
                    onRegenerateSummary={handleSummarizeAvalanche}
                  />
                )}

                {state.currentStep === 5 && (
                  <Step5Prototype
                    versions={state.prototypeVersions}
                    activeVersionIndex={state.activeVersionIndex}
                    isGenerating={isLoading}
                    error={error}
                    onGenerateInitial={handleGeneratePrototype}
                    onAdjustPrototype={handleAdjustPrototype}
                    onSelectVersion={(activeVersionIndex) =>
                      setState((prev) => ({ ...prev, activeVersionIndex }))
                    }
                  />
                )}

                {state.currentStep === 6 && (
                  <Step6Delivery
                    subStep={state.subStep}
                    readmeMarkdown={state.readmeMarkdown}
                    pitchScript={state.pitchScript}
                    checklist={state.checklist}
                    isLoading={isLoading}
                    error={error}
                    onChangeSubStep={(subStep) =>
                      setState((prev) => ({ ...prev, subStep }))
                    }
                    onRegenerate={handleGenerateDeliverables}
                    onToggleChecklist={(id) =>
                      setState((prev) => ({
                        ...prev,
                        checklist: prev.checklist.map((item) =>
                          item.id === id ? { ...item, checked: !item.checked } : item
                        ),
                      }))
                    }
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <BottomNav
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          nextLabel={nextButtonLabel}
          isLoading={isLoading}
          onBack={handleBack}
          onNext={handleNext}
          hideNext={state.currentStep === 6 && state.subStep === 2}
        />

        {/* In-app Reset Confirmation Modal */}
        {showResetModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-3xl bg-[#131317] border border-white/[0.12] p-6 space-y-5">
              <div className="space-y-2">
                <h2
                  id="reset-modal-title"
                  className="font-display text-xl font-bold text-[#F5F5F7]"
                >
                  ¿Reiniciar el proyecto?
                </h2>
                <p className="text-sm text-[#9898A6] leading-relaxed">
                  Se borrarán todas tus respuestas, versiones del prototipo y entregables guardados en este dispositivo.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="min-h-[48px] px-4 rounded-xl bg-[#1C1C22] border border-white/[0.08] text-sm font-semibold text-[#F5F5F7] hover:bg-[#24242C] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="min-h-[48px] px-4 rounded-xl bg-[#E84142] text-sm font-semibold text-white hover:bg-[#D13637] cursor-pointer"
                >
                  Sí, reiniciar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
