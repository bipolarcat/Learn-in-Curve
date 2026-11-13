import type { FreeMockExamId, LoBreakdownRow } from "./types";

/** PMQ pricing. The results screen's only pricing link. */
export const SEE_PRO_HREF = "/courses/pmq-in-5-days/pricing";

/**
 * Lesson for the weakest row, when this exam has lessons.
 * PMQ LOs are 1-24. PFQ objectives are 1-10. PMP has domains, not lessons.
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

/** Where "Fix your weak areas" goes once the learner has an account. */
export function weakAreaDestination(
  examId: FreeMockExamId,
  weakest: LoBreakdownRow | undefined,
): string {
  return (
    weakAreaLessonPath(examId, weakest) ??
    (examId === "apm-pfq" ? "/courses/pfq-in-2-days" : "/courses/pmq-in-5-days")
  );
}
