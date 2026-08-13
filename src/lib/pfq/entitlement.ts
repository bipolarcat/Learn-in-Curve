import type { SupabaseClient } from "@supabase/supabase-js";
import { PFQ_COURSE_ID } from "@/lib/pfq/constants";
import { PFQ_PAID_TIERS, toPfqTier, type PfqTier } from "@/lib/pfq/tiers";

export type PfqFeatureEntitlement = {
  id: string;
  user_id: string;
  course_id: string;
  feature: string;
  source: string | null;
  granted_at: string;
  stripe_payment_id: string | null;
};

/**
 * Raw entitlement row for PFQ Pro, or null when starter (no row).
 * Prefer `getPfqTier` at gates.
 */
export async function getPfqEntitlement(
  supabase: SupabaseClient,
  userId: string,
  courseId: string = PFQ_COURSE_ID,
): Promise<PfqFeatureEntitlement | null> {
  const { data, error } = await supabase
    .from("feature_entitlements")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("feature", PFQ_PAID_TIERS)
    .maybeSingle();

  if (error) {
    console.error("[pfq] feature_entitlements query failed:", error.message);
    return null;
  }
  return (data as PfqFeatureEntitlement | null) ?? null;
}

/**
 * Entry point every PFQ gate must use.
 * Signed-out / no row / unrecognized feature → starter.
 */
export async function getPfqTier(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  courseId: string = PFQ_COURSE_ID,
): Promise<PfqTier> {
  if (!userId) return "starter";
  const entitlement = await getPfqEntitlement(supabase, userId, courseId);
  return toPfqTier(entitlement?.feature);
}
