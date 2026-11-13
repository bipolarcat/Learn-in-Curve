import type { FreeMockExamId, LoBreakdownRow } from "./types";

/**
 * Lesson for the weakest row, when this exam has lessons.
 * PMQ LOs are 1-24. PFQ objectives are 1-10. PMP has domains, not lessons.
 * Kept for deep-links; the free-mock results CTAs no longer use this path.
 */
export function weakAreaLessonPath(
  examId: FreeMockExamId,
  weakest: LoBreakdownRow | undefined,
): string | null {
  const n = weakest?.lo_number;
  if (typeof n !== "number" || !Number.isInteger(n)) return null;
  if (examId === "apm-pmq" && n >= 1 && n <= 24) {
    return `/courses/pmq-in-5-days/lo/${n}`;
  }
  if (examId === "apm-pfq" && n >= 1 && n <= 10) {
    return `/courses/pfq-in-2-days/learn/${n}`;
  }
  return null;
}

/** Course overview fallback when there is no lesson for the weakest row. */
export function weakAreaDestination(
  examId: FreeMockExamId,
  weakest: LoBreakdownRow | undefined,
): string {
  return (
    weakAreaLessonPath(examId, weakest) ??
    (examId === "apm-pfq"
      ? "/courses/pfq-in-2-days"
      : examId === "pmp"
        ? "/mock-me"
        : "/courses/pmq-in-5-days")
  );
}
