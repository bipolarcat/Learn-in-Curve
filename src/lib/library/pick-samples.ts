import {
  LIBRARY_SAMPLE_POOL,
  type LibrarySampleQuestion,
} from "@/content/library/sample-pool";
import { LIBRARY_PAGES } from "@/content/library";

/**
 * Deterministic sample picks for a /library page.
 *
 * Why the slug matters: picking `candidates[0]` per LO meant any two pages
 * sharing a learning objective rendered the *same* question. At one point LO23
 * appeared on three pages at once. Duplicated blocks across pages are both a
 * worse reading experience and a thin-content signal to search engines.
 *
 * So each page claims a different question from a shared LO. For a given LO we
 * take the slugs of every page that lists it, sort them for stability, and use
 * the current page's position as an offset into the candidate list. Fully
 * deterministic (no randomness, identical output every build) and collision-free
 * as long as the pool for that LO is at least as deep as the number of pages
 * using it. Beyond that it wraps, which is a graceful degradation rather than a
 * crash — `librarySampleCollisions()` reports when that is about to happen.
 */
function pageOffsetForLo(loNumber: number, pageSlug: string | undefined): number {
  if (!pageSlug) return 0;
  const claimants = LIBRARY_PAGES.filter((p) =>
    p.sampleQuestionLos.includes(loNumber),
  )
    .map((p) => p.slug)
    .sort();
  const index = claimants.indexOf(pageSlug);
  return index < 0 ? 0 : index;
}

export function pickLibrarySamples(
  loNumbers: number[],
  limit = 3,
  pageSlug?: string,
): LibrarySampleQuestion[] {
  const picked: LibrarySampleQuestion[] = [];
  const used = new Set<string>();

  const candidatesFor = (lo: number) =>
    LIBRARY_SAMPLE_POOL.filter((q) => q.lo_number === lo).sort((a, b) =>
      a.id.localeCompare(b.id),
    );

  const takeNext = (lo: number): LibrarySampleQuestion | undefined => {
    const candidates = candidatesFor(lo);
    if (candidates.length === 0) return undefined;
    const offset = pageOffsetForLo(lo, pageSlug);
    // Start at this page's claim, then walk forward so a page still gets a
    // question when its preferred slot is already used within this same page.
    for (let i = 0; i < candidates.length; i += 1) {
      const q = candidates[(offset + i) % candidates.length];
      if (!used.has(q.id)) return q;
    }
    return undefined;
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
  return LIBRARY_SAMPLE_POOL.filter((q) => q.lo_number === loNumber).length;
}

/**
 * LOs claimed by more pages than the pool can serve without repeating.
 * Empty array means no page shares a sample question with another page.
 * Use after adding a page or regenerating the pool.
 */
export function librarySampleCollisions(): {
  loNumber: number;
  pages: number;
  available: number;
}[] {
  const counts = new Map<number, number>();
  for (const p of LIBRARY_PAGES) {
    for (const lo of p.sampleQuestionLos) {
      counts.set(lo, (counts.get(lo) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([loNumber, pages]) => ({
      loNumber,
      pages,
      available: eligibleCountForLo(loNumber),
    }))
    .filter((r) => r.pages > r.available)
    .sort((a, b) => a.loNumber - b.loNumber);
}
