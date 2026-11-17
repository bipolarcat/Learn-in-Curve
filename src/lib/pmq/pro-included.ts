/**
 * Shared Pro / free-tier selling points.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SOURCE OF TRUTH — read before editing anything in this file
 *
 * Entitlement truth:  `src/lib/pmq/tiers.ts`   (what each tier actually unlocks)
 * Advertised claims:  `src/lib/pmq/plans.ts`   (`PMQ_PLANS`, rendered on /pricing)
 *
 * Every string here is a COMMERCIAL CLAIM shown next to a buy button. It must be
 * a subset of what `PMQ_PLANS` advertises AND deliverable per `tiers.ts`.
 * Claiming below reality is safe (over-delivery). Claiming above it is a
 * misleading action under the CPRs / DMCCA 2024 — at the point of sale.
 *
 * The tier matrix, from `tiers.ts`:
 *
 *              quiz sets   mock exams   insights   Sly   report
 *   starter    1           1            LO1 only   no    no
 *   pro        1-5         1-3          LO1–24     no    no
 *   ai_pro     1-8         1-4          LO1–24     yes   yes
 *
 * So Pro grants EXACTLY: more questions, more mocks, Insights (LO2–24), and
 * recall (LO2–24). It does NOT grant Sly or the end-of-course report — those
 * are AI Pro, which is `status: "waitlist"` and not on sale.
 *
 * Corrected 2026-07-31: this file previously sold "Meet Sly", "AI-marked written
 * answers" and "End-of-course report" as part of the £15 Pro Bundle, rendered
 * directly under the Get Pro button. None are granted to `pro`. It also claimed
 * "800+ questions" where /pricing says 1,200 total, and "~280 quizzes" on the
 * free tier where /pricing says 240. Do not reintroduce any of these.
 *
 * 2026-11-17: video/audio overviews removed from Pro (and the product).
 *
 * NOTE: the old header here named FEATURES.md as the source of truth. It isn't —
 * FEATURES.md is known stale. Use tiers.ts + plans.ts.
 */

export type ProIncludedIcon = "sly" | "report" | "questions" | "mock";

/**
 * Shown next to Pro buy CTAs when a “What’s included” panel is needed.
 * Mirrors `PMQ_PLANS.pro.features` exactly — if you change one, change the
 * other, or /pricing and the buy button disagree.
 */
export const PRO_INCLUDED: {
  title: string;
  body: string;
  icon: ProIncludedIcon;
}[] = [
  {
    title: "1,200 total practice questions",
    body: "Unlock the extra quiz sets across all 24 learning objectives.",
    icon: "questions",
  },
  {
    title: "3 total mock exams",
    body: "Three full papers in total, sat under real exam conditions.",
    icon: "mock",
  },
];

/**
 * Compact free-tier stamps for the courses catalogue PMQ card.
 * Starter per /pricing: 240 practice questions, 1 mock exam, core content for
 * all 24 LOs, common misconceptions, memory aids.
 */
export const PMQ_TICKET_SELL_POINTS = [
  "Daily streaks that pull you back every day",
  "24 LOs, full syllabus, nothing skipped",
  "240 practice questions, answer wrong, know why instantly",
  "Full 40-question mock exam included",
  "Exam command words, decoded",
  "Misconceptions busted before they cost you marks",
] as const;

/** Three capability beats under the Sly product window (not a uniform card grid). */
export const SLY_SHOWCASE_BEATS = [
  {
    label: "Finds weak spots",
    detail: "Reads how you struggle, then points at the topic that needs work.",
  },
  {
    label: "Coaches exam-style",
    detail: "APM PMQ framing — not generic chat, exam-focused every step.",
  },
  {
    label: "Stays on this topic",
    detail: "Scoped to the lesson in front of you, so revision stays sharp.",
  },
] as const;
