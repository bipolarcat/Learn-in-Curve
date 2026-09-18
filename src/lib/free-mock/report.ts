/**
 * Free-mock summary band + gated report helpers (no scoring changes).
 */

import {
  buildCategoryBreakdown,
  isQuestionCorrect,
  toLoBreakdownRows,
  weakestCategories,
  type FreeMockAnswer,
  type LoBreakdownRow,
} from "@/lib/free-mock/scoring";
import type { FreeMockItem } from "@/lib/free-mock/types";

export type ReadinessBand = "pass" | "borderline" | "not-ready";

export type FormatLossRow = {
  format: "multiple choice" | "scenario" | "select-from-list";
  correct: number;
  total: number;
  lost: number;
};

export type QuestionTimingRow = {
  questionId: string;
  index: number;
  elapsedMs: number;
  targetMs: number;
  overPace: boolean;
  correct: boolean;
  format: FormatLossRow["format"];
  categoryKey: string;
  categoryLabel: string;
};

function formatLabel(type: FreeMockItem["type"]): FormatLossRow["format"] {
  if (type === "dropdown") return "select-from-list";
  if (type === "scenario_mcq") return "scenario";
  return "multiple choice";
}

export function readinessBand(score: number, maxScore: number): ReadinessBand {
  if (maxScore <= 0) return "not-ready";
  const ratio = score / maxScore;
  if (ratio >= 0.7) return "pass";
  if (ratio >= 0.5) return "borderline";
  return "not-ready";
}

export function readinessBandLabel(band: ReadinessBand): string {
  if (band === "pass") return "Pass-ready";
  if (band === "borderline") return "Borderline";
  return "Not ready yet";
}

export function buildFormatLoss(
  items: FreeMockItem[],
  answers: Record<string, FreeMockAnswer>,
): FormatLossRow[] {
  const map = new Map<FormatLossRow["format"], FormatLossRow>();
  for (const item of items) {
    const format = formatLabel(item.type);
    const row = map.get(format) ?? {
      format,
      correct: 0,
      total: 0,
      lost: 0,
    };
    row.total += 1;
    if (isQuestionCorrect(item, answers[item.id])) row.correct += 1;
    else row.lost += 1;
    map.set(format, row);
  }
  const order: FormatLossRow["format"][] = [
    "multiple choice",
    "scenario",
    "select-from-list",
  ];
  return order
    .map((format) => map.get(format))
    .filter((row): row is FormatLossRow => Boolean(row));
}

export function buildQuestionTimings(
  items: FreeMockItem[],
  answers: Record<string, FreeMockAnswer>,
  questionTimings: Record<string, number>,
  targetPaceMs: number,
): QuestionTimingRow[] {
  return items.map((item, index) => {
    const elapsedMs = Math.max(0, Math.round(questionTimings[item.id] ?? 0));
    return {
      questionId: item.id,
      index,
      elapsedMs,
      targetMs: targetPaceMs,
      overPace: elapsedMs > targetPaceMs,
      correct: isQuestionCorrect(item, answers[item.id]),
      format: formatLabel(item.type),
      categoryKey: item.category.key,
      categoryLabel: item.category.label,
    };
  });
}

export function recommendedNextSteps(
  weakest: LoBreakdownRow[],
  breakdownNoun: string,
  mark: string,
): string[] {
  const steps: string[] = [];
  for (const row of weakest.slice(0, 2)) {
    steps.push(
      `Revise ${row.lo_code} (${row.lo_title}) — you scored ${row.correct}/${row.total} on this ${breakdownNoun}.`,
    );
  }
  steps.push(
    `Sit another timed ${mark} readiness check after you close the gaps above.`,
  );
  while (steps.length < 3) {
    steps.push(
      `Review the formats that cost you marks, then re-attempt under the same timer.`,
    );
  }
  return steps.slice(0, 3);
}

export function scoreAttempt(
  items: FreeMockItem[],
  answers: Record<string, FreeMockAnswer>,
) {
  let score = 0;
  for (const item of items) {
    if (isQuestionCorrect(item, answers[item.id])) score += 1;
  }
  const categoryBreakdown = buildCategoryBreakdown(items, answers);
  const loBreakdown = toLoBreakdownRows(categoryBreakdown);
  const weakest = toLoBreakdownRows(weakestCategories(categoryBreakdown, 3));
  return { score, maxScore: items.length, loBreakdown, weakest };
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
