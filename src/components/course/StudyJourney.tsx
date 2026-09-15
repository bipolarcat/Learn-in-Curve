"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  CHECKPOINT_GATE_COPY,
  showCheckpointGateHint,
} from "@/components/pmq/CheckpointGateHint";
import { productActionSecondary } from "@/components/ui/semantic";
import { CtaArrow } from "@/components/stamp-chip";
import {
  collectUnlockedStages,
  type CourseStageDef,
} from "@/lib/course/stages";

function scrollStudyToTop() {
  requestAnimationFrame(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });
}

export function StageContinueButton({
  label,
  onContinue,
  enabled = true,
  aside = null,
}: {
  label: string;
  onContinue: () => void;
  enabled?: boolean;
  /** Optional left-edge control (e.g. Learn “Back to Top”); Continue stays centred. */
  aside?: ReactNode;
}) {
  return (
    <div className="relative mt-6 flex min-h-11 items-center justify-center sm:mt-8">
      {aside ? (
        <div className="absolute inset-y-0 left-0 z-10 flex max-w-[min(42%,11rem)] items-center">
          {aside}
        </div>
      ) : null}
      <button
        type="button"
        aria-disabled={!enabled}
        aria-label={!enabled ? CHECKPOINT_GATE_COPY : label}
        className={`${productActionSecondary} ${
          !enabled
            ? "!cursor-not-allowed !border-ink/10 !bg-transparent !text-ink/30 hover:!bg-transparent hover:!text-ink/30 hover:!opacity-100 active:!bg-transparent active:!opacity-100"
            : ""
        }`}
        onClick={(event) => {
          event.preventDefault();
          if (!enabled) {
            showCheckpointGateHint("bottom-center");
            return;
          }
          onContinue();
        }}
      >
        {label}
        <CtaArrow className="!h-3.5 !w-3.5" />
      </button>
    </div>
  );
}

export type StudyJourneyChromeContext<TId extends string> = {
  stages: CourseStageDef<TId>[];
  currentId: TId;
  unlockedIds: Set<TId>;
  lockedIds: Set<TId>;
  selectStage: (id: TId) => void;
  continueLabel: string | null;
  onContinue: () => void;
  continueEnabled: boolean;
  optimisticCompletionPercent: number;
  isLast: boolean;
  showAdvance: boolean;
};

type StudyJourneyProps<TId extends string> = {
  /** Stable key for this unit (LO number / objective) — init once per key. */
  unitKey: string | number;
  stages: CourseStageDef<TId>[];
  sealed: boolean;
  /** Stage id that means "quiz/drill done" when quizCompleted flips true. */
  quizStageId?: TId;
  quizCompleted?: boolean;
  checkpointStageId: TId;
  dbReachedStageIds?: TId[];
  /** Stage ids that have a timestamp column (for optimistic %). */
  timestampStageIds: readonly TId[];
  completionPercent?: number;
  progressUnitPercent: number;
  /** When continuing from `fromId`, which stages become done (default: just fromId). */
  stagesCompletedOnAdvance?: (fromId: TId) => TId[];
  /** Override next stage index after leaving `fromId` (e.g. skip Pro media). */
  resolveNextIndex?: (fromId: TId, fromIndex: number, stageIds: TId[]) => number;
  onStagesMarkedDone?: (stageIds: TId[]) => void;
  lockedIds?: Set<TId>;
  /** Label override while on a given stage (e.g. "Continue to Apply"). */
  continueLabelFor?: (currentId: TId, defaultLabel: string) => string;
  /** Optional control beside the bottom Continue (e.g. Learn back-to-top). */
  continueAsideFor?: (currentId: TId) => ReactNode;
  checkpointContinueLabel: string;
  /** Chrome “Next” label on the last stage. Defaults to "Next LO". */
  headerLastContinueLabel?: string;
  checkpointReady: boolean;
  onCheckpointContinue: () => void;
  /**
   * When false, hide the bottom Continue on the last (checkpoint) stage.
   * PFQ uses in-panel Previous/Next instead. PMQ keeps the bottom button.
   */
  showCheckpointContinueButton?: boolean;
  srTitle: string;
  renderChrome: (ctx: StudyJourneyChromeContext<TId>) => ReactNode;
  renderStage: (
    stageId: TId,
    helpers: {
      selectStage: (id: TId) => void;
      /**
       * Jump to a later stage, marking every stage from the current one up to
       * (but not including) the target as Continue-done — same unlock effect as
       * tapping Continue, without requiring the bottom button.
       */
      jumpToStage: (id: TId) => void;
    },
  ) => ReactNode;
};

/**
 * Course-agnostic pathway shell: unlock, continue, scroll, optimistic %.
 * Opens on the first stage (Orient) every visit; DB reached stages still mark
 * progress. PMQ and PFQ supply stage lists and render functions — this file
 * must not import either course's content components.
 */
export function StudyJourney<TId extends string>({
  unitKey,
  stages,
  sealed,
  quizStageId,
  quizCompleted = false,
  checkpointStageId,
  dbReachedStageIds = [],
  timestampStageIds,
  completionPercent = 0,
  progressUnitPercent,
  stagesCompletedOnAdvance,
  resolveNextIndex,
  onStagesMarkedDone,
  lockedIds: lockedIdsProp,
  continueLabelFor,
  continueAsideFor,
  checkpointContinueLabel,
  headerLastContinueLabel = "Next LO",
  checkpointReady,
  onCheckpointContinue,
  showCheckpointContinueButton = true,
  srTitle,
  renderChrome,
  renderStage,
}: StudyJourneyProps<TId>) {
  const [, startStageTransition] = useTransition();
  const stageIdsKey = stages.map((s) => s.id).join("|");
  const stageIds = useMemo(
    () => stageIdsKey.split("|") as TId[],
    [stageIdsKey],
  );

  const [currentId, setCurrentId] = useState<TId>(
    () => stages[0]?.id ?? ("" as TId),
  );
  const [doneIds, setDoneIds] = useState<Set<TId>>(() => new Set());
  const [visitedIds, setVisitedIds] = useState<Set<TId>>(
    () => new Set([stages[0]?.id].filter(Boolean) as TId[]),
  );
  const prevSealedRef = useRef<boolean | null>(null);
  const openedForUnitRef = useRef<string | number | null>(null);
  const dbDoneCountRef = useRef(0);

  useEffect(() => {
    const dbDone = dbReachedStageIds.filter((id) => stageIds.includes(id));
    const wasReset = dbDone.length < dbDoneCountRef.current;
    dbDoneCountRef.current = dbDone.length;
    if (wasReset) openedForUnitRef.current = null;

    setDoneIds((prev) => {
      if (wasReset) return new Set(dbDone);
      const next = new Set(prev);
      for (const id of dbDone) next.add(id);
      return next;
    });

    setVisitedIds((prev) => {
      if (wasReset) return new Set(dbDone);
      const next = new Set(prev);
      for (const id of dbDone) next.add(id);
      return next;
    });

    // Always land on the first pathway stage (Orient) when opening a unit.
    // Do not jump to the next incomplete stage — progress ticks stay in doneIds.
    // Sealed units: the seal effect sends them to Checkpoint instead.
    if (openedForUnitRef.current === unitKey) return;
    openedForUnitRef.current = unitKey;
    if (!sealed) {
      setCurrentId(stageIds[0]!);
    }
  }, [unitKey, stageIds, dbReachedStageIds, sealed]);

  useEffect(() => {
    if (sealed) {
      setDoneIds(new Set(stageIds));
      if (prevSealedRef.current !== true) {
        setCurrentId(checkpointStageId);
      }
    } else if (quizCompleted && quizStageId) {
      setDoneIds((prev) => {
        const next = new Set(prev);
        next.add(quizStageId);
        return next;
      });
    }
    prevSealedRef.current = sealed;
  }, [sealed, stageIds, quizCompleted, quizStageId, checkpointStageId]);

  useEffect(() => {
    setVisitedIds((prev) => {
      if (prev.has(currentId)) return prev;
      const next = new Set(prev);
      next.add(currentId);
      return next;
    });
  }, [currentId]);

  const unlockedIds = useMemo(
    () =>
      collectUnlockedStages(
        stageIds,
        doneIds,
        visitedIds,
        currentId,
        sealed,
      ),
    [stageIds, doneIds, visitedIds, currentId, sealed],
  );

  const selectStage = useCallback(
    (id: TId) => {
      if (!unlockedIds.has(id)) return;
      startStageTransition(() => setCurrentId(id));
    },
    [unlockedIds, startStageTransition],
  );

  const jumpToStage = useCallback(
    (id: TId) => {
      const targetIdx = stageIds.indexOf(id);
      const currentIdx = stageIds.indexOf(currentId);
      if (targetIdx < 0 || currentIdx < 0) return;
      if (targetIdx === currentIdx) {
        startStageTransition(() => setCurrentId(id));
        return;
      }
      if (targetIdx < currentIdx) {
        // Only revisit already-unlocked earlier stages.
        if (unlockedIds.has(id)) {
          startStageTransition(() => setCurrentId(id));
        }
        return;
      }

      const newlyDone: TId[] = [];
      for (let i = currentIdx; i < targetIdx; i++) {
        const stage = stageIds[i];
        if (stage) newlyDone.push(stage);
      }

      startStageTransition(() => {
        setDoneIds((prev) => {
          const next = new Set(prev);
          for (const doneId of newlyDone) next.add(doneId);
          return next;
        });
        setCurrentId(id);
      });
      scrollStudyToTop();
      window.setTimeout(() => onStagesMarkedDone?.(newlyDone), 0);
    },
    [stageIds, currentId, unlockedIds, onStagesMarkedDone, startStageTransition],
  );

  const advance = useCallback(() => {
    const idx = stageIds.indexOf(currentId);
    if (idx < 0 || idx >= stageIds.length - 1) return;

    const nextIdx = resolveNextIndex
      ? resolveNextIndex(currentId, idx, stageIds)
      : idx + 1;
    const nextId = stageIds[nextIdx];
    if (!nextId) return;

    const newlyDone = stagesCompletedOnAdvance
      ? stagesCompletedOnAdvance(currentId)
      : [currentId];

    startStageTransition(() => {
      setDoneIds((prev) => {
        const next = new Set(prev);
        for (const id of newlyDone) next.add(id);
        return next;
      });
      setCurrentId(nextId);
    });
    scrollStudyToTop();
    window.setTimeout(() => onStagesMarkedDone?.(newlyDone), 0);
  }, [
    currentId,
    stageIds,
    resolveNextIndex,
    stagesCompletedOnAdvance,
    onStagesMarkedDone,
    startStageTransition,
  ]);

  const timestampSet = useMemo(
    () => new Set(timestampStageIds),
    [timestampStageIds],
  );

  const optimisticCompletionPercent = useMemo(() => {
    const dbReached = new Set(dbReachedStageIds);
    let pendingUnits = 0;
    for (const id of doneIds) {
      if (timestampSet.has(id) && !dbReached.has(id)) pendingUnits += 1;
    }
    return Math.min(
      100,
      completionPercent + pendingUnits * progressUnitPercent,
    );
  }, [
    completionPercent,
    doneIds,
    dbReachedStageIds,
    timestampSet,
    progressUnitPercent,
  ]);

  const currentStage = stages.find((s) => s.id === currentId) ?? stages[0];
  const isLast = currentId === checkpointStageId;
  const showAdvance = !isLast && !!currentStage;
  const lockedIds = lockedIdsProp ?? new Set<TId>();

  const rawContinue = currentStage?.continueLabel ?? "";
  const continueLabel = !showAdvance
    ? null
    : continueLabelFor
      ? continueLabelFor(currentId, rawContinue)
      : rawContinue;

  const headerContinueLabel = isLast ? headerLastContinueLabel : continueLabel;
  const headerOnContinue = isLast ? onCheckpointContinue : advance;
  const continueEnabled = !isLast || checkpointReady;

  const chrome = renderChrome({
    stages,
    currentId,
    unlockedIds,
    lockedIds,
    selectStage,
    continueLabel: headerContinueLabel,
    onContinue: headerOnContinue,
    continueEnabled,
    optimisticCompletionPercent,
    isLast,
    showAdvance,
  });

  return (
    <>
      {chrome}
      <main className="w-full px-3 pb-28 pt-4 sm:px-5 sm:pb-24 sm:pt-6">
        <h1 className="sr-only">{srTitle}</h1>
        <div className="mx-auto w-full min-w-0 max-w-wrap">
          {renderStage(currentId, { selectStage, jumpToStage })}

          {isLast ? (
            showCheckpointContinueButton ? (
              <StageContinueButton
                key="checkpoint-continue"
                label={checkpointContinueLabel}
                onContinue={onCheckpointContinue}
                enabled={continueEnabled}
                aside={continueAsideFor?.(currentId) ?? null}
              />
            ) : null
          ) : showAdvance && continueLabel ? (
            <StageContinueButton
              key={currentId}
              label={continueLabel}
              onContinue={advance}
              aside={continueAsideFor?.(currentId) ?? null}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}
