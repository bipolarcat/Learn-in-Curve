import {
  PFQ_FREE_SAMPLE_PER_OBJECTIVE,
  selectPfqFreeSampleIds,
} from "@/lib/pfq/free-sample";
import type { PfqQuestionRow } from "@/lib/pfq/types";

/** Same size as the starter allowance: one free set of 5 per learning objective. */
export const PFQ_QUIZ_SET_SIZE = PFQ_FREE_SAMPLE_PER_OBJECTIVE;

export function pfqPracticeSetCount(practiceCount: number): number {
  if (practiceCount <= 0) return 0;
  return Math.ceil(practiceCount / PFQ_QUIZ_SET_SIZE);
}

function practiceRowsForObjective(
  rows: PfqQuestionRow[],
  objective: number,
): PfqQuestionRow[] {
  return rows.filter(
    (q) =>
      q.active !== false &&
      q.objective === objective &&
      q.mock_set == null,
  );
}

/**
 * Deterministic sets for one objective.
 * Set 1 is the free-sample pick (5, or fewer if the bank is thin).
 * Remaining practice rows chunk into sets of 5, variant then outcome then id.
 */
export function pfqPracticeSetIds(
  rows: PfqQuestionRow[],
  objective: number,
): string[][] {
  const practice = practiceRowsForObjective(rows, objective);
  if (practice.length === 0) return [];

  const practiceIds = new Set(practice.map((q) => q.id));
  const set1 = selectPfqFreeSampleIds(rows).filter((id) => practiceIds.has(id));
  const free = new Set(set1);

  const rest = practice
    .filter((q) => !free.has(q.id))
    .sort(
      (a, b) =>
        a.variant - b.variant ||
        a.learning_outcome.localeCompare(b.learning_outcome) ||
        a.id.localeCompare(b.id),
    )
    .map((q) => q.id);

  const sets: string[][] = [];
  if (set1.length > 0) sets.push(set1);
  for (let i = 0; i < rest.length; i += PFQ_QUIZ_SET_SIZE) {
    sets.push(rest.slice(i, i + PFQ_QUIZ_SET_SIZE));
  }
  return sets.filter((set) => set.length > 0);
}
