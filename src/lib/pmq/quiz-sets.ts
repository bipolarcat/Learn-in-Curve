/**
 * Practice quiz set numbering:
 *   Set 1 → context `practice_quiz` (free)
 *   Set N (N ≥ 2) → context `quiz_set_N` (Pro)
 *
 * Per-LO set counts vary (some LOs have 3, others more). Derive from the DB —
 * never hardcode a global maximum.
 */

export type PracticeQuizContext = "practice_quiz" | `quiz_set_${number}`;

export function isPracticeQuizContext(
  context: string,
): context is PracticeQuizContext {
  if (context === "practice_quiz") return true;
  return /^quiz_set_([2-9]|[1-9]\d+)$/.test(context);
}

/** Set 1 → practice_quiz; set ≥ 2 → quiz_set_N. */
export function quizSetContext(setNumber: number): PracticeQuizContext {
  if (!Number.isInteger(setNumber) || setNumber < 1) {
    throw new Error(`Invalid quiz set number: ${setNumber}`);
  }
  if (setNumber === 1) return "practice_quiz";
  return `quiz_set_${setNumber}`;
}

export function parseQuizSetNumber(context: string): number | null {
  if (context === "practice_quiz") return 1;
  const match = /^quiz_set_(\d+)$/.exec(context);
  if (!match) return null;
  const n = Number(match[1]);
  return n >= 2 ? n : null;
}

/** How many practice sets exist for a section given distinct question contexts. */
export function totalSetsFromContexts(contexts: Iterable<string>): number {
  let max = 0;
  for (const ctx of contexts) {
    const n = parseQuizSetNumber(ctx);
    if (n != null) max = Math.max(max, n);
    else if (ctx === "practice_quiz") max = Math.max(max, 1);
  }
  return max;
}
