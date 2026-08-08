import {
  LEARN_SAMPLE_POOL,
  type LearnSampleQuestion,
} from "@/content/learn/sample-pool";

/**
 * Deterministic sample picks for a /learn page.
 * Walks `loNumbers` in order, taking the next unused eligible question per LO,
 * then fills remaining slots from those LOs (still never paid/mock inventory).
 */
export function pickLearnSamples(
  loNumbers: number[],
  limit = 3,
): LearnSampleQuestion[] {
  const picked: LearnSampleQuestion[] = [];
  const used = new Set<string>();

  const takeNext = (lo: number): LearnSampleQuestion | undefined => {
    const candidates = LEARN_SAMPLE_POOL.filter(
      (q) => q.lo_number === lo && !used.has(q.id),
    ).sort((a, b) => a.id.localeCompare(b.id));
    return candidates[0];
  };

  // First pass: one per listed LO
  for (const lo of loNumbers) {
    if (picked.length >= limit) break;
    const next = takeNext(lo);
    if (!next) continue;
    used.add(next.id);
    picked.push(next);
  }

  // Second pass: fill from the same LO set
  while (picked.length < limit) {
    let added = false;
    for (const lo of loNumbers) {
      if (picked.length >= limit) break;
      const next = takeNext(lo);
      if (!next) continue;
      used.add(next.id);
      picked.push(next);
      added = true;
    }
    if (!added) break;
  }

  return picked;
}

/** Eligible count per LO after ring-fence exclusions (for reporting). */
export function eligibleCountForLo(loNumber: number): number {
  return LEARN_SAMPLE_POOL.filter((q) => q.lo_number === loNumber).length;
}
