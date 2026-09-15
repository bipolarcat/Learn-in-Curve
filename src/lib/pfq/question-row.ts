import { parsePfqMockSet } from "./generator.ts";
import type { PfqQuestionRow } from "./types.ts";

/** Map a DB / JSON row into a typed PfqQuestionRow. */
export function asQuestionRow(raw: Record<string, unknown>): PfqQuestionRow {
  return {
    id: String(raw.id),
    learning_outcome: String(raw.learning_outcome),
    objective: Number(raw.objective),
    day: Number(raw.day),
    verb: String(raw.verb),
    type: raw.type === "multi_select" ? "multi_select" : "single",
    traps: Array.isArray(raw.traps) ? (raw.traps as string[]) : [],
    stem: String(raw.stem),
    items: Array.isArray(raw.items) ? (raw.items as string[]) : null,
    options: (raw.options ?? {}) as Record<string, string>,
    answer: String(raw.answer),
    explanation: String(raw.explanation),
    tip: typeof raw.tip === "string" && raw.tip.length > 0 ? raw.tip : null,
    active: raw.active !== false,
    mock_suitable: Boolean(raw.mock_suitable),
    mock_set: parsePfqMockSet(raw.mock_set),
    variant: Number(raw.variant ?? 1),
  };
}
