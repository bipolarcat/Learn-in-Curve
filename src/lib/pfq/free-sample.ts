import { PFQ_OBJECTIVES } from "./outcomes.ts";
import type { PfqQuestionRow } from "./types.ts";

/** Free (starter) allowance: 5 practice questions per learning objective. */
export const PFQ_FREE_SAMPLE_PER_OBJECTIVE = 5;

/** 10 objectives x 5 = 50 free questions. Everything else is Pro. */
export const PFQ_FREE_SAMPLE_SIZE =
  PFQ_OBJECTIVES.length * PFQ_FREE_SAMPLE_PER_OBJECTIVE;

let cachedIds: string[] | null = null;

/**
 * Deterministic free-sample pick: 5 practice-only rows per objective, spread
 * across that objective's outcomes round-robin (syllabus order), taking the
 * lowest variant first and breaking ties on id. Mock rows (mock_set set) and
 * inactive rows are never eligible. An objective yields fewer than 5 only when
 * the bank cannot supply them.
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
  for (const list of byOutcome.values()) {
    list.sort((a, b) => a.variant - b.variant || a.id.localeCompare(b.id));
  }

  const ids: string[] = [];
  for (const objective of PFQ_OBJECTIVES) {
    const picked: string[] = [];
    const depth = Math.max(
      0,
      ...objective.outcomes.map((code) => byOutcome.get(code)?.length ?? 0),
    );
    for (let pass = 0; pass < depth; pass += 1) {
      for (const code of objective.outcomes) {
        if (picked.length >= PFQ_FREE_SAMPLE_PER_OBJECTIVE) break;
        const row = byOutcome.get(code)?.[pass];
        if (row) picked.push(row.id);
      }
      if (picked.length >= PFQ_FREE_SAMPLE_PER_OBJECTIVE) break;
    }
    ids.push(...picked);
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
