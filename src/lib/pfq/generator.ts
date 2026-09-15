import { shuffleInPlace, shuffleOptionOrder } from "./shuffle.ts";
import type { PfqQuestionRow } from "./types.ts";

export type PfqMockSet = 1 | 2 | 3;

/** Three timed papers, all Pro. */
export const PFQ_MOCK_SETS = [1, 2, 3] as const;

/** Accept number or numeric string — PostgREST often returns int as string. */
export function parsePfqMockSet(raw: unknown): PfqMockSet | null {
  if (raw === 1 || raw === 2 || raw === 3) return raw;
  if (raw === "1" || raw === "2" || raw === "3") {
    return Number(raw) as PfqMockSet;
  }
  return null;
}

function assertMockPaperShape(drawn: PfqQuestionRow[], mockSet: PfqMockSet): void {
  if (drawn.length !== 60) {
    throw new Error(
      `PFQ mock set ${mockSet}: expected 60 questions, got ${drawn.length}`,
    );
  }
  const outcomes = new Set(drawn.map((q) => q.learning_outcome));
  if (outcomes.size !== 59) {
    throw new Error(
      `PFQ mock set ${mockSet}: expected 59 distinct outcomes (one doubled), got ${outcomes.size}`,
    );
  }
  const multiSelect = drawn.filter((q) => q.type === "multi_select").length;
  if (multiSelect !== 6) {
    throw new Error(
      `PFQ mock set ${mockSet}: expected exactly 6 multi_select questions, got ${multiSelect}`,
    );
  }
}

/**
 * Draw the fixed 60-question paper for a mock set: filter by mock_set,
 * shuffle order, assert paper shape (60 / 59 LOs / 6 multi_select).
 */
export function drawPfqMockQuestionIds(
  bank: PfqQuestionRow[],
  mockSet: PfqMockSet,
  random = Math.random,
): string[] {
  const pool = bank.filter(
    (q) =>
      q.active !== false &&
      q.mock_suitable === true &&
      q.mock_set === mockSet,
  );
  const drawn = shuffleInPlace([...pool], random);
  assertMockPaperShape(drawn, mockSet);
  return drawn.map((q) => q.id);
}

export function buildOptionOrdersForAttempt(
  questionIds: string[],
  random = Math.random,
): Record<string, string[]> {
  const orders: Record<string, string[]> = {};
  for (const id of questionIds) {
    orders[id] = shuffleOptionOrder(random);
  }
  return orders;
}
