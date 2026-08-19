import { PMQ_SECTION_COUNT } from "@/lib/pmq/constants";
import type { LessonBody } from "@/types/pmq";

export type LoStageId =
  | "orient"
  | "learn"
  | "video"
  | "audio"
  | "apply"
  | "practice"
  | "checkpoint";

export type LoStageDef = {
  id: LoStageId;
  label: string;
  continueLabel: string;
};

const STAGE_META: Record<
  LoStageId,
  { label: string; continueLabel: string }
> = {
  orient: { label: "Orient", continueLabel: "Continue to Learn" },
  learn: { label: "Learn", continueLabel: "Continue to Video" },
  video: { label: "Video", continueLabel: "Continue to Audio" },
  audio: { label: "Audio", continueLabel: "Continue to Apply" },
  apply: { label: "Apply", continueLabel: "Continue to Quiz" },
  practice: { label: "Quiz", continueLabel: "Continue to Checkpoint" },
  checkpoint: { label: "Checkpoint", continueLabel: "Done" },
};

/** Every LO uses the full pathway — same interface as LO1. */
export const LO_STAGE_ORDER: LoStageId[] = [
  "orient",
  "learn",
  "video",
  "audio",
  "apply",
  "practice",
  "checkpoint",
];

/** @deprecated Prefer `LO_STAGE_ORDER` — kept as alias for existing imports. */
const STAGE_ORDER = LO_STAGE_ORDER;

export const LO_STAGE_COUNT = LO_STAGE_ORDER.length;

/**
 * Pathway icons may open any stage the learner has already been on, not only
 * stages they left via Next. `doneIds` is Continue-off; `visitedIds` is every
 * current stage they have landed on (including the frontier they have not
 * Next'd away from yet).
 */
export function collectUnlockedLoStages(
  stageIds: readonly LoStageId[],
  doneIds: ReadonlySet<LoStageId>,
  visitedIds: ReadonlySet<LoStageId>,
  currentId: LoStageId,
  sealed: boolean,
): Set<LoStageId> {
  if (sealed) return new Set(stageIds);
  const next = new Set(doneIds);
  for (const id of visitedIds) next.add(id);
  next.add(currentId);
  return next;
}

/**
 * Total equally-weighted units of overall course progress: 24 LOs × 7 stages
 * = 168.
 */
export const PMQ_TOTAL_PROGRESS_UNITS = PMQ_SECTION_COUNT * LO_STAGE_COUNT;

/**
 * What one pathway stage is worth on the 0–100 course bar — 100/168 ≈ 0.595%.
 *
 * Keep this un-rounded everywhere it's summed. Rounding per stage is what made
 * the header bar look frozen: five consecutive tabs are only ~3 points, so an
 * integer-only bar shows nothing, nothing, nothing, nothing, then +3 at once.
 */
export const PMQ_PROGRESS_UNIT_PERCENT = 100 / PMQ_TOTAL_PROGRESS_UNITS;

// NOTE: there used to be a `loJourneyStorageKey`/`getLoJourneyReachedCount`
// pair here backed by `window.sessionStorage` — a client-only "done stages"
// cache with no server invalidation path. It was the root cause of two
// separate bugs (incorrect progress pies, and a reset LO reopening on a
// stale stage instead of Orient) because it had no way to distinguish "the
// user revisited this LO" from "an admin reset this account server-side."
// Removed entirely 2026-07-30 rather than patched a third time — DB
// (`getLoReachedCountFromProgress`, `section_progress.*_reached_at`) is now
// the sole source of truth for both progress and pathway position. See
// OPERATIONS.md, "reset didn't reset the in-LO pathway".

export function buildLoStages(_input?: {
  loNumber?: number;
  body?: LessonBody;
}): LoStageDef[] {
  return STAGE_ORDER.map((id, index) => {
    const next = STAGE_ORDER[index + 1];
    let continueLabel = STAGE_META[id].continueLabel;
    if (next && id !== "checkpoint") {
      continueLabel = `Continue to ${STAGE_META[next].label}`;
    }
    return {
      id,
      label: STAGE_META[id].label,
      continueLabel,
    };
  });
}

/** Seal when the checklist is done (quiz no longer gates LO complete). */
export function canSealLo(input: {
  checkpointTotal: number;
  completedCheckpointCount: number;
  /** @deprecated Ignored — quiz no longer required to seal. */
  quizCompleted?: boolean;
}): boolean {
  if (input.checkpointTotal <= 0) return true;
  return input.completedCheckpointCount >= input.checkpointTotal;
}

export function sealBlockedReason(input: {
  checkpointTotal: number;
  completedCheckpointCount: number;
  /** @deprecated Ignored — quiz no longer required to seal. */
  quizCompleted?: boolean;
}): string | null {
  if (canSealLo(input)) return null;
  return "Finish the checklist to mark this LO complete.";
}

/**
 * The 5 pre-quiz pathway stages that get their own DB timestamp column on
 * `section_progress`. Quiz and Checkpoint reuse existing columns
 * (`quiz_completed_at`, `completed_at`) rather than new ones — see
 * `getLoReachedCountFromProgress` below.
 */
export const STAGE_REACHED_COLUMN: Partial<Record<LoStageId, keyof LoStageSignals>> = {
  orient: "orient_reached_at",
  learn: "learn_reached_at",
  video: "video_reached_at",
  audio: "audio_reached_at",
  apply: "apply_reached_at",
};

export type LoStageSignals = {
  orient_reached_at?: string | null;
  learn_reached_at?: string | null;
  video_reached_at?: string | null;
  audio_reached_at?: string | null;
  apply_reached_at?: string | null;
  quiz_completed_at?: string | null;
  completed_at?: string | null;
};

/**
 * DB-backed count of pathway stages reached, out of `LO_STAGE_COUNT` (7)
 * equally-weighted segments: Orient, Learn, Video, Audio, Apply, Quiz,
 * Checkpoint. Checkpoint only counts once the full checklist is done
 * (`completed_at` set by `tryMarkSectionCompleteIfReady` in actions.ts) —
 * reaching the Checkpoint *page* isn't itself a milestone; finishing every
 * checklist item is. This replaces the old client-only sessionStorage
 * count (`getLoJourneyReachedCount`) as the source of truth for progress
 * pies and the overall course-progress bar.
 */
export function getLoReachedCountFromProgress(
  row: LoStageSignals | null | undefined,
): number {
  if (!row) return 0;
  return [
    row.orient_reached_at,
    row.learn_reached_at,
    row.video_reached_at,
    row.audio_reached_at,
    row.apply_reached_at,
    row.quiz_completed_at,
    row.completed_at,
  ].filter(Boolean).length;
}
