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
 *              quiz sets   mock exams   video/audio   Sly   report
 *   starter    1           1            no            no    no
 *   pro        1-5         1-3          yes           no    no
 *   ai_pro     1-8         1-4          yes           yes   yes
 *
 * So Pro grants EXACTLY four things over Starter: more questions, more mocks,
 * video per LO, audio per LO. It does NOT grant Sly or the end-of-course report
 * — those are AI Pro, which is `status: "waitlist"` and not on sale.
 *
 * Corrected 2026-07-31: this file previously sold "Meet Sly", "AI-marked written
 * answers" and "End-of-course report" as part of the £8 Pro Bundle, rendered
 * directly under the Get Pro button. None are granted to `pro`. It also claimed
 * "800+ questions" where /pricing says 960 additional, and "~280 quizzes" on the
 * free tier where /pricing says 240. Do not reintroduce any of these.
 *
 * NOTE: the old header here named FEATURES.md as the source of truth. It isn't —
 * FEATURES.md is known stale. Use tiers.ts + plans.ts.
 */

export type ProIncludedIcon = "sly" | "video" | "report" | "questions" | "mock";

/**
 * Shown in the "What's included" panel under the Get Pro Bundle button
 * (`ProMediaLockedPreview`). Mirrors `PMQ_PLANS.pro.features` exactly — if you
 * change one, change the other, or /pricing and the buy button disagree.
 */
export const PRO_INCLUDED: {
  title: string;
  body: string;
  icon: ProIncludedIcon;
}[] = [
  {
    title: "960 additional practice questions",
    body: "Unlock the extra quiz sets across all 24 learning objectives.",
    icon: "questions",
  },
  {
    title: "2 additional mock exams",
    body: "Three full papers in total, sat under real exam conditions.",
    icon: "mock",
  },
  {
    title: "Video overview for every LO",
    body: "A video recap for every single learning objective.",
    icon: "video",
  },
  {
    title: "Audio overview for every LO",
    body: "Listen back to any learning objective, hands-free.",
    icon: "video",
  },
];

/**
 * Compact free-tier stamps for the courses catalogue PMQ card.
 * Starter per /pricing: 240 practice questions, 1 mock exam, core content for
 * all 24 LOs, common misconceptions, memory aids.
 */
export const PMQ_TICKET_SELL_POINTS = [
  "Streaks + XP that pull you back every day",
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
