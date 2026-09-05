"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CHECKPOINT_GATE_COPY,
  showCheckpointGateHint,
} from "@/components/pmq/CheckpointGateHint";
import { productActionSecondary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { CtaArrow } from "@/components/stamp-chip";
import {
  collectUnlockedStages,
  type CourseStageDef,
} from "@/lib/course/stages";

/** Hold ∞ long enough for the bars spinner to read before a sync stage swap. */
const STAGE_CONTINUE_ADVANCE_MS = 420;

export function StageContinueButton({
  label,
  onContinue,
  enabled = true,
}: {
  label: string;
  onContinue: () => void;
  enabled?: boolean;
}) {
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-6 flex justify-center sm:mt-8">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        aria-disabled={!enabled}
        aria-label={
          !enabled ? CHECKPOINT_GATE_COPY : pending ? "Advancing" : label
        }
        className={`${productActionSecondary} disabled:cursor-wait disabled:opacity-90 ${
          !enabled
            ? "!cursor-not-allowed !opacity-40 hover:!bg-paper hover:!opacity-40"
            : ""
        }`}
        onClick={(event) => {
          event.preventDefault();
          if (pending) return;
          if (!enabled) {
            showCheckpointGateHint("bottom-center");
            return;
          }
          setPending(true);
          window.setTimeout(() => {
            onContinue();
            setPending(false);
          }, STAGE_CONTINUE_ADVANCE_MS);
        }}
      >
        {pending ? (
          <Spinner
            variant="bars"
            size={14}
            className="text-ink/55"
            aria-hidden
          />
        ) : (
          <>
            {label}
            <CtaArrow className="!h-3.5 !w-3.5" />
          </>
        )}
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
  /** Stable key for this unit (LO number / objective) — resume once per key. */
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
  checkpointContinueLabel: string;
  /** Chrome “Next” label on the last stage. Defaults to "Next LO". */
  headerLastContinueLabel?: string;
  checkpointReady: boolean;
  onCheckpointContinue: () => void;
  srTitle: string;
  renderChrome: (ctx: StudyJourneyChromeContext<TId>) => ReactNode;
  renderStage: (
    stageId: TId,
    helpers: { selectStage: (id: TId) => void },
  ) => ReactNode;
};

/**
 * Course-agnostic pathway shell: unlock/resume, continue, scroll, optimistic %.
 * PMQ and PFQ supply stage lists and render functions — this file must not
 * import either course's content components.
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
  checkpointContinueLabel,
  headerLastContinueLabel = "Next LO",
  checkpointReady,
  onCheckpointContinue,
  srTitle,
  renderChrome,
  renderStage,
}: StudyJourneyProps<TId>) {
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
  const resumedForUnitRef = useRef<string | number | null>(null);
  const dbDoneCountRef = useRef(0);

  useEffect(() => {
    const dbDone = dbReachedStageIds.filter((id) => stageIds.includes(id));
    const wasReset = dbDone.length < dbDoneCountRef.current;
    dbDoneCountRef.current = dbDone.length;
    if (wasReset) resumedForUnitRef.current = null;

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

    if (resumedForUnitRef.current === unitKey) return;
    resumedForUnitRef.current = unitKey;

    const furthestDbIdx = dbDone.reduce((max, id) => {
      const idx = stageIds.indexOf(id);
      return idx > max ? idx : max;
    }, -1);
    const nextIdx = Math.min(
      Math.max(furthestDbIdx + 1, 0),
      stageIds.length - 1,
    );
    setCurrentId(stageIds[nextIdx] ?? stageIds[0]!);
  }, [unitKey, stageIds, dbReachedStageIds]);

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
      if (unlockedIds.has(id)) setCurrentId(id);
    },
    [unlockedIds],
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

    setDoneIds((prev) => {
      const next = new Set(prev);
      for (const id of newlyDone) next.add(id);
      return next;
    });
    setCurrentId(nextId);
    onStagesMarkedDone?.(newlyDone);

    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [
    currentId,
    stageIds,
    resolveNextIndex,
    stagesCompletedOnAdvance,
    onStagesMarkedDone,
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
          {renderStage(currentId, { selectStage })}

          {isLast ? (
            <StageContinueButton
              key="checkpoint-continue"
              label={checkpointContinueLabel}
              onContinue={onCheckpointContinue}
              enabled={continueEnabled}
            />
          ) : showAdvance && continueLabel ? (
            <StageContinueButton
              key={currentId}
              label={continueLabel}
              onContinue={advance}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}
