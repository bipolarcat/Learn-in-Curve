import { optionsForAttempt } from "./shuffle.ts";
import type { PfqPublicQuestion, PfqQuestionRow } from "./types.ts";

/** Strip answer + explanation before any client response. */
export function toPublicPfqQuestion(
  q: PfqQuestionRow,
  optionOrder: string[],
): PfqPublicQuestion {
  return {
    id: q.id,
    learning_outcome: q.learning_outcome,
    objective: q.objective,
    day: q.day,
    verb: q.verb,
    type: q.type,
    traps: q.traps,
    stem: q.stem,
    items: q.items,
    options: optionsForAttempt(q.options, optionOrder),
    option_order: optionOrder,
  };
}

export function assertNoSecretsInPublicPayload(payload: unknown): void {
  const json = JSON.stringify(payload);
  if (/"answer"\s*:/.test(json) || /"explanation"\s*:/.test(json)) {
    throw new Error("Public PFQ payload must not include answer or explanation");
  }
}
