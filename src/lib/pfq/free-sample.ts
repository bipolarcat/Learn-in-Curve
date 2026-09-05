import { PFQ_EXPECTED_OUTCOMES } from "./outcomes.ts";
import type { PfqQuestionRow } from "./types.ts";

export const PFQ_FREE_SAMPLE_SIZE = 50;

let cachedIds: string[] | null = null;

/**
 * Deterministic free-sample pick: for the first 50 outcomes in syllabus order,
 * choose an active practice-only row (mock_set null) with lowest variant, then
 * lowest id. Skip an outcome if no such row exists.
 */
export function selectPfqFreeSampleIds(rows: PfqQuestionRow[]): string[] {
  const activePractice = rows.filter(
    (q) => q.active !== false && q.mock_set == null,
  );
  const byOutcome = new Map<string, PfqQuestionRow[]>();
  for (const q of activePractice) {
    const list = byOutcome.get(q.learning_outcome) ?? [];
    list.push(q);
    byOutcome.set(q.learning_outcome, list);
  }

  const ids: string[] = [];
  const targets = PFQ_EXPECTED_OUTCOMES.slice(0, PFQ_FREE_SAMPLE_SIZE);
  for (const code of targets) {
    const candidates = byOutcome.get(code);
    if (!candidates?.length) continue;
    candidates.sort(
      (a, b) =>
        a.variant - b.variant || a.id.localeCompare(b.id),
    );
    ids.push(candidates[0]!.id);
  }
  return ids;
}

export async function getPfqFreeSampleQuestionIds(
  fetchRows: () => Promise<PfqQuestionRow[]>,
): Promise<string[]> {
  if (cachedIds) return cachedIds;
  const rows = await fetchRows();
  cachedIds = selectPfqFreeSampleIds(rows);
  return cachedIds;
}

/** Test helper — clears the module-level free-sample id cache. */
export function __clearPfqFreeSampleCacheForTests(): void {
  cachedIds = null;
}
