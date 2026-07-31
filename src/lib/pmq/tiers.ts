/**
 * The single source of truth for what each tier unlocks.
 *
 * Every gate in the app must derive from this file. The reason is the bug this
 * replaced: entitlement used to be one boolean (`feature = 'ai_tutor'`) checked
 * independently in five places, so the pricing page could promise a split that
 * no gate enforced. If a new gate is added anywhere, it calls a function here —
 * it does not re-derive tier from a row lookup of its own.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * The ladder (decided 2026-07-30)
 *
 *              quiz sets      mock exams   video/audio   Sly   report
 *   starter    1              1            no            no    no
 *   pro        1-5            1-3          yes           no    no
 *   ai_pro     1-8            1-4          yes           yes   yes
 *
 * Starter is the ABSENCE of an entitlement row, never a stored value. A failed
 * write can therefore never leave someone half-provisioned — worst case they
 * are Starter, which is exactly what an unpaid user should be.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Cost model
 *
 * All mocks are AI-graded (~30p each). Starter's single graded mock is an
 * operating cost. Pro's three at ~90p sit inside the £8 price. There is NO
 * per-user credit ledger for grading — that logic was removed deliberately;
 * the tier cap IS the cost cap, because a tier can only ever unlock a fixed
 * number of papers.
 */

/** Highest quiz set number any LO is expected to have. Sets are per-LO; some stop earlier. */
export const PMQ_MAX_QUIZ_SET = 8;

export type PmqTier = "starter" | "pro" | "ai_pro";

/** Values stored in `feature_entitlements.feature`. Starter is never stored. */
export type PmqPaidTier = Exclude<PmqTier, "starter">;

export const PMQ_PAID_TIERS: PmqPaidTier[] = ["pro", "ai_pro"];

/** Ordering for "at least this tier" comparisons. Starter must stay 0. */
const TIER_RANK: Record<PmqTier, number> = {
  starter: 0,
  pro: 1,
  ai_pro: 2,
};

export function isPaidTier(value: unknown): value is PmqPaidTier {
  return value === "pro" || value === "ai_pro";
}

/**
 * Normalizes whatever came out of the database into a tier.
 * Anything unrecognized — null, a typo, a legacy value — becomes `starter`.
 * Failing closed matters: the alternative is an unknown string accidentally
 * unlocking paid content.
 */
export function toTier(featureValue: string | null | undefined): PmqTier {
  return isPaidTier(featureValue) ? featureValue : "starter";
}

export function tierAtLeast(tier: PmqTier, required: PmqTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[required];
}

/* ─────────────────────────── Quiz sets ─────────────────────────── */

/**
 * Which tier a practice quiz set belongs to.
 *   Set 1        → starter (context `practice_quiz`)
 *   Sets 2-5     → pro
 *   Sets 6-8     → ai_pro
 * Not every LO has all eight; this answers "who may open set N if it exists",
 * never "does set N exist".
 */
export function tierForQuizSet(setNumber: number): PmqTier {
  if (!Number.isInteger(setNumber) || setNumber < 1) return "ai_pro";
  if (setNumber === 1) return "starter";
  if (setNumber <= 5) return "pro";
  return "ai_pro";
}

export function canAccessQuizSet(tier: PmqTier, setNumber: number): boolean {
  return tierAtLeast(tier, tierForQuizSet(setNumber));
}

/** Highest quiz set this tier may open. Used for "unlock more" copy and counts. */
export function maxQuizSetForTier(tier: PmqTier): number {
  if (tier === "starter") return 1;
  if (tier === "pro") return 5;
  return PMQ_MAX_QUIZ_SET;
}

/* ─────────────────────────── Mock exams ─────────────────────────── */

export type PmqMockExamSet = 1 | 2 | 3 | 4;

/**
 * Which tier a mock paper belongs to.
 *   Exam 1    → starter
 *   Exams 2-3 → pro
 *   Exam 4    → ai_pro
 * Every paper is AI-graded, so this cap is also the spend cap per user.
 */
export function tierForMockExam(examSet: PmqMockExamSet): PmqTier {
  if (examSet === 1) return "starter";
  if (examSet === 4) return "ai_pro";
  return "pro";
}

export function canAccessMockExam(
  tier: PmqTier,
  examSet: PmqMockExamSet,
): boolean {
  return tierAtLeast(tier, tierForMockExam(examSet));
}

/** How many mock papers this tier includes — drives the pricing page count. */
export function mockExamCountForTier(tier: PmqTier): number {
  if (tier === "starter") return 1;
  if (tier === "pro") return 3;
  return 4;
}

/* ─────────────────────────── Feature flags ─────────────────────────── */

/** Video + audio overviews: Pro and above. */
export function canAccessMedia(tier: PmqTier): boolean {
  return tierAtLeast(tier, "pro");
}

/**
 * Sly, the AI tutor: AI Pro only.
 * Sly must stay completely hidden — not locked-with-a-teaser — for Starter and
 * Pro until the AI Pro Bundle is on sale. Showing a padlocked tutor advertises
 * something nobody can buy yet, which reads as a broken feature rather than a
 * future one.
 */
export function canAccessSly(tier: PmqTier): boolean {
  return tierAtLeast(tier, "ai_pro");
}

/** End-of-course report: AI Pro only. */
export function canAccessCourseReport(tier: PmqTier): boolean {
  return tierAtLeast(tier, "ai_pro");
}
