/**
 * The single source of truth for what each PFQ tier unlocks.
 *
 * Mirror of `src/lib/pmq/tiers.ts`. Every gate in the app derives from this
 * file. Nothing re-derives a tier from its own row lookup: that was the bug
 * `pmq/tiers.ts` was written to kill, where the pricing page promised a split
 * no gate enforced.
 *
 * ---------------------------------------------------------------------------
 * The ladder (decided 2026-09-15, LIC-157)
 *
 *                insights      practice sets   mocks   Sly   report
 *   starter      objective 1   set 1 only      none    no    no
 *   pro          all 10        all sets        all 3   no    no
 *   ai_pro       all 10        all sets        all 3   yes   yes
 *
 * "Insights" is the learner-facing name for the lesson BODY, stored as
 * `body_markdown` on each core_content block (see src/lib/pfq/content.ts).
 * The field is not renamed: PMQ shares both the key and the renderer
 * (src/components/pmq/CoreContentBlock.tsx), so a rename would be a 34-file
 * content migration on a live course for no functional gain. Insights is the
 * word on the pricing page and in the UI; body_markdown is the word in code.
 *
 * Objective 1's insights are free on purpose: a free user has to be able to see
 * what they are buying before the other nine are locked.
 *
 * Everything else on a lesson stays free on every objective: learning
 * outcomes, where-this-fits, exam coverage note, key takeaways, key
 * definitions, misconceptions, memory aids, progress checkpoints. That is the
 * scaffolding. Insights is the teaching.
 *
 * ---------------------------------------------------------------------------
 * Prices live in `src/lib/courses/registry-data.ts`, never here.
 *
 * Pro is £10 and buyable. AI Pro is £20, and is priced but NOT buyable: Sly has
 * not shipped, so the card is a waitlist. The tier and its gates exist now so
 * that the day Sly lands, the only new thing is a checkout path. `ai_pro` can
 * still be granted by hand for testing, and the gates will honour it.
 *
 * Starter is the ABSENCE of an entitlement row, never a stored value. A failed
 * payment write therefore leaves someone unpaid rather than half-provisioned.
 */

/** Objectives in the PFQ syllabus. Insights are free on this one only. */
export const PFQ_FREE_INSIGHTS_OBJECTIVE = 1;

/** Practice sets at or below this number are free to signed-in starters. */
export const PFQ_FREE_QUIZ_SET = 1;

/** Timed mock papers in the bank. Starter gets none of them. */
export const PFQ_MOCK_PAPERS = 3;

export type PfqTier = "starter" | "pro" | "ai_pro";

/** Values stored in `feature_entitlements.feature`. Starter is never stored. */
export type PfqPaidTier = Exclude<PfqTier, "starter">;

export const PFQ_PAID_TIERS: PfqPaidTier[] = ["pro", "ai_pro"];

/** Ordering for "at least this tier" comparisons. Starter must stay 0. */
const TIER_RANK: Record<PfqTier, number> = {
  starter: 0,
  pro: 1,
  ai_pro: 2,
};

export function isPfqPaidTier(value: unknown): value is PfqPaidTier {
  return value === "pro" || value === "ai_pro";
}

/**
 * Normalizes a DB feature value into a PFQ tier.
 * Anything unrecognized becomes starter. Fail closed: the alternative is an
 * unknown string accidentally unlocking paid content.
 */
export function toPfqTier(featureValue: string | null | undefined): PfqTier {
  return isPfqPaidTier(featureValue) ? featureValue : "starter";
}

export function pfqTierAtLeast(tier: PfqTier, required: PfqTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[required];
}

/** Full paid course bundle. Prefer the specific gates below. */
export function canAccessPfqCourse(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

/**
 * Lesson insights, i.e. the `body_markdown` teaching text, for one objective.
 *
 * Objective 1 is open to everyone including signed-out visitors. Objectives
 * 2 to 10 need Pro. Takes the objective NUMBER, not an index: callers pass
 * `lesson.objective_number`, which is 1-based in the content files.
 */
export function canAccessPfqInsights(
  tier: PfqTier,
  objectiveNumber: number,
): boolean {
  if (!Number.isInteger(objectiveNumber) || objectiveNumber < 1) return false;
  if (objectiveNumber === PFQ_FREE_INSIGHTS_OBJECTIVE) return true;
  return pfqTierAtLeast(tier, "pro");
}

/**
 * Lesson scaffolding: outcomes, takeaways, definitions, misconceptions, memory
 * aids, checkpoints. Free on every objective for every tier, signed in or not.
 * Exists as a function so a future paywall move is a one-line change here
 * rather than a hunt through components.
 */
export function canAccessPfqLessons(_tier: PfqTier): boolean {
  return true;
}

/** Timed mock papers. All 3 are Pro. Starter gets none. */
export function canAccessPfqMock(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

/** Full practice bank (sets 2+). Set 1 is separate, see canAccessPfqQuizSet. */
export function canAccessPfqFullPractice(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

/** Set 1 is free for any signed-in starter. Set 2+ needs Pro. */
export function canAccessPfqQuizSet(tier: PfqTier, setNumber: number): boolean {
  if (!Number.isInteger(setNumber) || setNumber < 1) return false;
  if (setNumber <= PFQ_FREE_QUIZ_SET) return true;
  return canAccessPfqFullPractice(tier);
}

/** Coverage map / readiness signals. Pro. */
export function canAccessPfqCoverageMap(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

/** Trap School is free for every tier. */
export function canAccessPfqTrapSchool(_tier: PfqTier): boolean {
  return true;
}

/**
 * Sly, the AI tutor. AI Pro only.
 * Nobody holds ai_pro by purchase yet (no checkout), so this returns false for
 * every real user today. That is intended, not a bug.
 */
export function canAccessPfqTutor(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "ai_pro");
}

/** End-of-course report. AI Pro only. Storage decided when Sly ships. */
export function canAccessPfqCompletionReport(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "ai_pro");
}
