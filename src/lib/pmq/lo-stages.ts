import { PMQ_SECTION_COUNT } from "@/lib/pmq/constants";
import type { LessonBody } from "@/types/pmq";
import {
  buildStageContinueLabels,
  canSealCourse,
  collectUnlockedStages,
  sealBlockedReason as sealBlockedReasonGeneric,
  type CourseStageDef,
} from "@/lib/course/stages";

/**
 * Stage IDs are PERSISTED: `section_progress` has `orient_reached_at`,
 * `learn_reached_at`, `apply_reached_at` columns keyed to these strings
 * (legacy `video_reached_at` / `audio_reached_at` remain in the DB but are
 * unused after media stages were removed). Display names are in STAGE_META
 * and may be renamed freely; renaming an ID needs a migration.
 * Current display names: apply = "Polish", practice = "Drill",
 * checkpoint = "Lock in".
 */
export type LoStageId =
  | "orient"
  | "learn"
  | "apply"
  | "practice"
  | "checkpoint";

export type LoStageDef = CourseStageDef<LoStageId>;

const STAGE_META: Record<
  LoStageId,
  { label: string; continueLabel: string }
> = {
  orient: { label: "Orient", continueLabel: "Continue to Learn" },
  learn: { label: "Learn", continueLabel: "Continue to Polish" },
  apply: { label: "Polish", continueLabel: "Continue to Drill" },
  practice: { label: "Drill", continueLabel: "Continue to Lock in" },
  checkpoint: { label: "Lock in", continueLabel: "Done" },
};

/** Every LO uses the full pathway — same interface as LO1. */
export const LO_STAGE_ORDER: LoStageId[] = [
  "orient",
  "learn",
  "apply",
  "practice",
  "checkpoint",
];

/** @deprecated Prefer `LO_STAGE_ORDER` — kept as alias for existing imports. */
const STAGE_ORDER = LO_STAGE_ORDER;

export const LO_STAGE_COUNT = LO_STAGE_ORDER.length;

export function collectUnlockedLoStages(
  stageIds: readonly LoStageId[],
  doneIds: ReadonlySet<LoStageId>,
  visitedIds: ReadonlySet<LoStageId>,
  currentId: LoStageId,
  sealed: boolean,
): Set<LoStageId> {
  return collectUnlockedStages(
    stageIds,
    doneIds,
    visitedIds,
    currentId,
    sealed,
  );
}

/**
 * Total equally-weighted units of overall course progress: 24 LOs × 5 stages
 * = 120.
 */
export const PMQ_TOTAL_PROGRESS_UNITS = PMQ_SECTION_COUNT * LO_STAGE_COUNT;

/**
 * What one pathway stage is worth on the 0–100 course bar — 100/120 ≈ 0.833%.
 *
 * Keep this un-rounded everywhere it's summed. Rounding per stage is what made
 * the header bar look frozen: five consecutive tabs are only ~3 points, so an
 * integer-only bar shows nothing, nothing, nothing, nothing, then +3 at once.
 */
export const PMQ_PROGRESS_UNIT_PERCENT = 100 / PMQ_TOTAL_PROGRESS_UNITS;

export function buildLoStages(_input?: {
  loNumber?: number;
  body?: LessonBody;
}): LoStageDef[] {
  return buildStageContinueLabels(STAGE_ORDER, STAGE_META);
}

/** Seal when the checklist is done (quiz no longer gates LO complete). */
export function canSealLo(input: {
  checkpointTotal: number;
  completedCheckpointCount: number;
  /** @deprecated Ignored — quiz no longer required to seal. */
  quizCompleted?: boolean;
}): boolean {
  return canSealCourse(input);
}

export function sealBlockedReason(input: {
  checkpointTotal: number;
  completedCheckpointCount: number;
  /** @deprecated Ignored — quiz no longer required to seal. */
  quizCompleted?: boolean;
}): string | null {
  return sealBlockedReasonGeneric(input);
}

/**
 * Pre-quiz pathway stages that get their own DB timestamp column on
 * `section_progress`. Quiz and Checkpoint reuse existing columns
 * (`quiz_completed_at`, `completed_at`) rather than new ones — see
 * `getLoReachedCountFromProgress` below.
 */
export const STAGE_REACHED_COLUMN: Partial<Record<LoStageId, keyof LoStageSignals>> = {
  orient: "orient_reached_at",
  learn: "learn_reached_at",
  apply: "apply_reached_at",
};

export type LoStageSignals = {
  orient_reached_at?: string | null;
  learn_reached_at?: string | null;
  /** Legacy — unused after video/audio stages were removed. */
  video_reached_at?: string | null;
  /** Legacy — unused after video/audio stages were removed. */
  audio_reached_at?: string | null;
  apply_reached_at?: string | null;
  quiz_completed_at?: string | null;
  completed_at?: string | null;
};

/**
 * DB-backed count of pathway stages reached, out of `LO_STAGE_COUNT` (5)
 * equally-weighted segments: Orient, Learn, Apply, Quiz, Checkpoint.
 * Checkpoint only counts once the full checklist is done
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
    row.apply_reached_at,
    row.quiz_completed_at,
    row.completed_at,
  ].filter(Boolean).length;
}
