import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqMock } from "@/lib/pfq/tiers";
import { PFQ_MOCK_HREF, PFQ_PRICING_HREF } from "@/lib/pfq/constants";

/**
 * Require signed-in PFQ Pro. Starters land on the mock gate page (explains
 * why), not a bare pricing redirect.
 */
export async function requirePfqProOrRedirect(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${PFQ_MOCK_HREF}?set=1`);
  }

  const tier = await getPfqTier(supabase, user.id);
  if (!canAccessPfqMock(tier)) {
    redirect(`${PFQ_MOCK_HREF}?set=1`);
  }
}

/**
 * Lessons, Trap School, and free-sample practice: signed-in only.
 * Starters are allowed; commerce stays behind Pro gates elsewhere.
 */
export async function requirePfqSignedInOrRedirect(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PFQ_PRICING_HREF);
  }
}
