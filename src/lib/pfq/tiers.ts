/**
 * The single source of truth for what each PFQ tier unlocks.
 *
 * Mirror of `src/lib/pmq/tiers.ts`, collapsed to two states:
 *   starter — absence of an entitlement row
 *   pro     — full practice bank + timed mocks + coverage map
 *
 * Free for everyone (signed-in or not, depending on the route):
 *   lessons + Trap School
 *
 * Free quiz set 1 (5 questions per objective) is available to signed-in
 * starters. Sets 2+ and both timed mock papers are Pro.
 *
 * There is no ai_pro on PFQ. Do not add one. Every gate calls a function in
 * this file — nothing re-derives tier from its own row lookup.
 *
 * Starter is never stored. A failed payment write leaves someone unpaid rather
 * than half-provisioned.
 */

export type PfqTier = "starter" | "pro";

/** Value stored in `feature_entitlements.feature` for PFQ. Starter is never stored. */
export type PfqPaidTier = Exclude<PfqTier, "starter">;

export const PFQ_PAID_TIERS: PfqPaidTier[] = ["pro"];

const TIER_RANK: Record<PfqTier, number> = {
  starter: 0,
  pro: 1,
};

export function isPfqPaidTier(value: unknown): value is PfqPaidTier {
  return value === "pro";
}

/**
 * Normalizes a DB feature value into a PFQ tier.
 * Anything unrecognized becomes starter — fail closed.
 */
export function toPfqTier(featureValue: string | null | undefined): PfqTier {
  return isPfqPaidTier(featureValue) ? featureValue : "starter";
}

export function pfqTierAtLeast(tier: PfqTier, required: PfqTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[required];
}

/** Full paid course bundle (practice bank + mocks). Prefer the specific gates. */
export function canAccessPfqCourse(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

/** Timed mock papers (both papers). */
export function canAccessPfqMock(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

/** Full practice bank (sets 2+). Set 1 is separate. */
export function canAccessPfqFullPractice(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

/** Set 1 is free for any signed-in starter. Set 2+ needs Pro. */
export function canAccessPfqQuizSet(tier: PfqTier, setNumber: number): boolean {
  if (!Number.isInteger(setNumber) || setNumber < 1) return false;
  if (setNumber === 1) return true;
  return canAccessPfqFullPractice(tier);
}

/** Lessons are free for every tier. */
export function canAccessPfqLessons(_tier: PfqTier): boolean {
  return true;
}

/** Trap School is free for every tier. */
export function canAccessPfqTrapSchool(_tier: PfqTier): boolean {
  return true;
}
