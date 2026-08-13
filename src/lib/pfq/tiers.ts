/**
 * The single source of truth for what each PFQ tier unlocks.
 *
 * Mirror of `src/lib/pmq/tiers.ts`, collapsed to two states:
 *   starter — absence of an entitlement row (marketing only)
 *   pro     — lessons, practice, mock, coverage map, Trap School
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

/** Lessons, practice bank, timed mock, coverage map. */
export function canAccessPfqCourse(tier: PfqTier): boolean {
  return pfqTierAtLeast(tier, "pro");
}

export function canAccessPfqMock(tier: PfqTier): boolean {
  return canAccessPfqCourse(tier);
}

export function canAccessPfqLessons(tier: PfqTier): boolean {
  return canAccessPfqCourse(tier);
}
