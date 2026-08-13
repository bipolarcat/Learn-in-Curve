import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqMock } from "@/lib/pfq/tiers";
import { PFQ_PRICING_HREF } from "@/lib/pfq/constants";

/** Require signed-in PFQ Pro. Everyone else → pricing (not 403). */
export async function requirePfqProOrRedirect(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PFQ_PRICING_HREF);
  }

  const tier = await getPfqTier(supabase, user.id);
  if (!canAccessPfqMock(tier)) {
    redirect(PFQ_PRICING_HREF);
  }
}
