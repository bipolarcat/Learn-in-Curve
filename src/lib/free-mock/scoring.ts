/**
 * Score helpers for free mock readiness checks (1 point per fully-correct item).
 */

import type {
  CategoryBreakdownRow,
  FreeMockAnswer,
  FreeMockItem,
  LoBreakdownRow,
} from "@/lib/free-mock/types";

export type { FreeMockAnswer, CategoryBreakdownRow, LoBreakdownRow };

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function mcqSelectedText(
  item: FreeMockItem,
  letter: string,
): string | null {
  if (!item.options?.length) return null;
  const index = LETTERS.indexOf(letter);
  if (index < 0 || index >= item.options.length) return null;
  return item.options[index] ?? null;
}

export function isQuestionCorrect(
  item: FreeMockItem,
  answer: FreeMockAnswer | undefined,
): boolean {
  if (!answer) return false;
  if (item.type === "dropdown") {
    if (answer.kind !== "dropdown" || !item.correct_answers) return false;
    const keys = Object.keys(item.correct_answers);
    if (keys.length === 0) return false;
    return keys.every(
      (key) => answer.values[key] === item.correct_answers?.[key],
    );
  }
  if (answer.kind !== "mcq" || !item.correct_answer) return false;
  const selected = mcqSelectedText(item, answer.letter);
  return selected != null && selected === item.correct_answer;
}

function categorySortIndex(key: string): number {
  const match = /^LO(\d+)$/i.exec(key);
  if (match) return Number(match[1]);
  if (key === "People") return 1;
  if (key === "Process") return 2;
  if (key === "Business Environment") return 3;
  return 100;
}

export function buildCategoryBreakdown(
  items: FreeMockItem[],
  answers: Record<string, FreeMockAnswer>,
): CategoryBreakdownRow[] {
  const map = new Map<string, CategoryBreakdownRow>();
  for (const item of items) {
    const row = map.get(item.category.key) ?? {
      key: item.category.key,
      label: item.category.label,
      correct: 0,
      total: 0,
      sortIndex: categorySortIndex(item.category.key),
    };
    row.total += 1;
    if (isQuestionCorrect(item, answers[item.id])) row.correct += 1;
    map.set(item.category.key, row);
  }
  return [...map.values()].sort((a, b) => {
    if (a.sortIndex !== b.sortIndex) return a.sortIndex - b.sortIndex;
    return a.label.localeCompare(b.label);
  });
}

/** Map category rows into the legacy lead JSON shape (lo_* fields). */
export function toLoBreakdownRows(
  rows: CategoryBreakdownRow[],
): LoBreakdownRow[] {
  return rows.map((row) => ({
    lo_number: row.sortIndex,
    lo_code: row.key,
    lo_title: row.label,
    correct: row.correct,
    total: row.total,
  }));
}

/** Lowest accuracy first; ties broken by lower correct count, then sort index. */
export function weakestCategories(
  breakdown: CategoryBreakdownRow[],
  limit = 3,
): CategoryBreakdownRow[] {
  return [...breakdown]
    .sort((a, b) => {
      const ar = a.correct / a.total;
      const br = b.correct / b.total;
      if (ar !== br) return ar - br;
      if (a.correct !== b.correct) return a.correct - b.correct;
      return a.sortIndex - b.sortIndex;
    })
    .slice(0, limit);
}

/** @deprecated Use buildCategoryBreakdown. */
export function buildLoBreakdown(
  items: FreeMockItem[],
  answers: Record<string, FreeMockAnswer>,
): LoBreakdownRow[] {
  return toLoBreakdownRows(buildCategoryBreakdown(items, answers));
}

/** @deprecated Use weakestCategories. */
export function weakestLos(
  breakdown: LoBreakdownRow[],
  limit = 3,
): LoBreakdownRow[] {
  return [...breakdown]
    .sort((a, b) => {
      const ar = a.correct / a.total;
      const br = b.correct / b.total;
      if (ar !== br) return ar - br;
      if (a.correct !== b.correct) return a.correct - b.correct;
      return a.lo_number - b.lo_number;
    })
    .slice(0, limit);
}
