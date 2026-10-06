import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqMock } from "@/lib/pfq/tiers";
import {
  PFQ_LEARN_HREF,
  PFQ_MOCK_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";

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
export async function requirePfqSignedInOrRedirect(
  nextPath: string = PFQ_LEARN_HREF,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Sign in, then come straight back. Sending signed-out visitors to pricing
    // showed paying buyers (e.g. opening the receipt on another device) a buy
    // button for something they already own. /auth/sign-in sanitises `next`.
    redirect(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  }
}
