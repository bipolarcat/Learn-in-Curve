import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqLessons } from "@/lib/pfq/tiers";
import { PFQ_PRICING_HREF } from "@/lib/pfq/constants";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";

export const metadata: Metadata = {
  title: "PFQ in 2 Days — Learn",
  robots: { index: false, follow: false },
};

/**
 * Post-purchase landing. Full lesson renderer ships with the content prompt;
 * this route must exist now so Stripe success_url and the receipt email have a
 * real destination, and so pro users are not dumped back on pricing.
 */
export default async function PfqLearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/auth/sign-in?next=${encodeURIComponent("/pfq/learn")}`,
    );
  }

  const tier = await getPfqTier(supabase, user.id);
  if (!canAccessPfqLessons(tier)) {
    redirect(PFQ_PRICING_HREF);
  }

  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <h1 className="m-0 font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
        PFQ in <span className="text-orange">2 Days</span>
      </h1>
      <p className="m-0 max-w-xl font-body text-[15px] leading-relaxed text-ink/75">
        Your Pro access is active. Lessons are landing next — the timed mock and
        coverage map are ready now.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/pfq/mock" className={stampCtaPrimary}>
          Sit the mock
        </Link>
        <Link href="/pfq#trap-school" className={stampCtaSecondary}>
          Trap School
        </Link>
      </div>
      <p className="m-0 max-w-3xl border-t border-ink/10 pt-6 font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
