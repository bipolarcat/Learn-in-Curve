import { shuffleInPlace, shuffleOptionOrder } from "./shuffle.ts";
import type { PfqQuestionRow } from "./types.ts";

/**
 * Draw one question per distinct learning_outcome, then one extra from an
 * outcome that still has unused questions (the handbook doubles one outcome —
 * which one must not be hardcoded).
 */
export function drawPfqMockQuestionIds(
  bank: PfqQuestionRow[],
  random = Math.random,
): string[] {
  // Practice-only rows (mock_suitable=false) must never enter the timed paper.
  const active = bank.filter(
    (q) => q.active !== false && q.mock_suitable === true,
  );
  const byOutcome = new Map<string, PfqQuestionRow[]>();
  for (const q of active) {
    const list = byOutcome.get(q.learning_outcome) ?? [];
    list.push(q);
    byOutcome.set(q.learning_outcome, list);
  }

  const primary: PfqQuestionRow[] = [];
  const leftovers: PfqQuestionRow[] = [];

  for (const [, list] of byOutcome) {
    const shuffled = shuffleInPlace(list, random);
    const first = shuffled[0];
    if (first) primary.push(first);
    leftovers.push(...shuffled.slice(1));
  }

  if (leftovers.length === 0) {
    throw new Error(
      "PFQ bank has no duplicate outcome questions — need 60 draws from 59 outcomes",
    );
  }

  const duplicate = leftovers[Math.floor(random() * leftovers.length)]!;
  const drawn = shuffleInPlace([...primary, duplicate], random);
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
