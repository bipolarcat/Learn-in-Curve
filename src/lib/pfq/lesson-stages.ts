/**
 * PFQ pathway stages (parity with PMQ Apply for misconceptions / memory aids).
 * Trap school stays a global module — no per-objective traps stage.
 */

import {
  buildStageContinueLabels,
  type CourseStageDef,
} from "../course/stages.ts";

export type PfqStageId =
  | "orient"
  | "learn"
  | "apply"
  | "drill"
  | "checkpoint";

export type PfqStageDef = CourseStageDef<PfqStageId>;

export const PFQ_STAGE_ORDER: PfqStageId[] = [
  "orient",
  "learn",
  "apply",
  "drill",
  "checkpoint",
];

export const PFQ_STAGE_COUNT = PFQ_STAGE_ORDER.length;

const STAGE_META: Record<
  PfqStageId,
  { label: string; continueLabel: string }
> = {
  orient: { label: "Orient", continueLabel: "Continue to Learn" },
  learn: { label: "Learn", continueLabel: "Continue to Apply" },
  apply: { label: "Apply", continueLabel: "Continue to Drill" },
  drill: { label: "Drill", continueLabel: "Continue to Checkpoint" },
  checkpoint: { label: "Checkpoint", continueLabel: "Done" },
};

export function buildPfqStages(): PfqStageDef[] {
  return buildStageContinueLabels(PFQ_STAGE_ORDER, STAGE_META);
}

/**
 * Columns written when Continue leaves a stage. Checkpoint uses
 * `completed_at` via the checklist (same as PMQ) — not on Continue.
 */
export const PFQ_STAGE_REACHED_COLUMN: Partial<
  Record<PfqStageId, PfqStageSignalColumn>
> = {
  orient: "orient_reached_at",
  learn: "learn_reached_at",
  apply: "apply_reached_at",
  drill: "quiz_completed_at",
};

export type PfqStageSignalColumn =
  | "orient_reached_at"
  | "learn_reached_at"
  | "quiz_completed_at"
  | "apply_reached_at"
  | "completed_at";

export type PfqStageSignals = {
  orient_reached_at?: string | null;
  learn_reached_at?: string | null;
  video_reached_at?: string | null;
  audio_reached_at?: string | null;
  apply_reached_at?: string | null;
  quiz_completed_at?: string | null;
  completed_at?: string | null;
};

/**
 * Stages the DB confirms as reached for resume / optimistic progress.
 *
 * Legacy rule: a non-null `completed_at` means every stage was reached —
 * resolve on read, do not backfill columns.
 *
 * Inserted-stage rule: if a later pre-checkpoint timestamp is set, earlier
 * stages count as reached too. Covers learners who passed Learn → Drill
 * before Apply existed between them.
 */
export function getPfqReachedStageIds(
  row: PfqStageSignals | null | undefined,
): PfqStageId[] {
  if (!row) return [];
  if (row.completed_at) return [...PFQ_STAGE_ORDER];

  const explicit: Partial<Record<PfqStageId, boolean>> = {
    orient: Boolean(row.orient_reached_at),
    learn: Boolean(row.learn_reached_at),
    apply: Boolean(row.apply_reached_at),
    drill: Boolean(row.quiz_completed_at),
  };

  let furthest = -1;
  for (let i = 0; i < PFQ_STAGE_ORDER.length; i++) {
    const id = PFQ_STAGE_ORDER[i]!;
    if (id === "checkpoint") continue;
    if (explicit[id]) furthest = i;
  }

  if (furthest < 0) return [];
  return PFQ_STAGE_ORDER.slice(0, furthest + 1).filter(
    (id) => id !== "checkpoint",
  );
}

export function getPfqReachedCountFromProgress(
  row: PfqStageSignals | null | undefined,
): number {
  if (!row) return 0;
  if (row.completed_at) return PFQ_STAGE_COUNT;
  return getPfqReachedStageIds(row).length;
}

/** 10 objectives × 5 stages. */
export const PFQ_TOTAL_PROGRESS_UNITS = 10 * PFQ_STAGE_COUNT;
export const PFQ_PROGRESS_UNIT_PERCENT = 100 / PFQ_TOTAL_PROGRESS_UNITS;
