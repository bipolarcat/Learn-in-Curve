/**
 * PFQ 4-stage pathway (parity §3a). Trap school stays a global module — no
 * per-objective traps stage.
 */

import {
  buildStageContinueLabels,
  type CourseStageDef,
} from "../course/stages.ts";

export type PfqStageId = "orient" | "learn" | "drill" | "checkpoint";

export type PfqStageDef = CourseStageDef<PfqStageId>;

export const PFQ_STAGE_ORDER: PfqStageId[] = [
  "orient",
  "learn",
  "drill",
  "checkpoint",
];

export const PFQ_STAGE_COUNT = PFQ_STAGE_ORDER.length;

const STAGE_META: Record<
  PfqStageId,
  { label: string; continueLabel: string }
> = {
  orient: { label: "Orient", continueLabel: "Continue to Learn" },
  learn: { label: "Learn", continueLabel: "Continue to Drill" },
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
  drill: "quiz_completed_at",
};

export type PfqStageSignalColumn =
  | "orient_reached_at"
  | "learn_reached_at"
  | "quiz_completed_at"
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
 * Legacy rule (parity §3a): a non-null `completed_at` means every stage was
 * reached — resolve on read, do not backfill columns. Covers pre-pathway rows
 * (e.g. section `f8a2c1e0-4d3b-4a9e-9c06-2e1d0b9a8c7d`).
 */
export function getPfqReachedStageIds(
  row: PfqStageSignals | null | undefined,
): PfqStageId[] {
  if (!row) return [];
  if (row.completed_at) return [...PFQ_STAGE_ORDER];

  const reached: PfqStageId[] = [];
  if (row.orient_reached_at) reached.push("orient");
  if (row.learn_reached_at) reached.push("learn");
  if (row.quiz_completed_at) reached.push("drill");
  return reached;
}

export function getPfqReachedCountFromProgress(
  row: PfqStageSignals | null | undefined,
): number {
  if (!row) return 0;
  if (row.completed_at) return PFQ_STAGE_COUNT;
  return [
    row.orient_reached_at,
    row.learn_reached_at,
    row.quiz_completed_at,
    row.completed_at,
  ].filter(Boolean).length;
}

/** 10 objectives × 4 stages. */
export const PFQ_TOTAL_PROGRESS_UNITS = 10 * PFQ_STAGE_COUNT;
export const PFQ_PROGRESS_UNIT_PERCENT = 100 / PFQ_TOTAL_PROGRESS_UNITS;
