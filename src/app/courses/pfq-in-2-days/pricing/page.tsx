import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import {
  PFQ_CHECKOUT_ENABLED,
  PFQ_PRICING_HREF,
  PFQ_PRO_INTENT_PARAM,
  PFQ_PRO_INTENT_VALUE,
  formatPfqPriceGbp,
} from "@/lib/pfq/constants";
import { pfqTierAtLeast } from "@/lib/pfq/tiers";
import { PfqPlanCards } from "@/components/pfq/PfqPlanCards";
import { PricingBackLink } from "@/components/pmq/PricingBackLink";
import { buildTitle } from "@/lib/seo/title";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PFQ_PRICE_LABEL = formatPfqPriceGbp();

export const metadata: Metadata = {
  title: buildTitle("Plans & pricing: PFQ in 2 Days"),
  description: `Free to start, then Pro Bundle ${PFQ_PRICE_LABEL} for full insights, 565 practice questions, three timed mocks and a coverage map. AI Pro launching soon.`,
  alternates: { canonical: `${SITE_URL}${PFQ_PRICING_HREF}` },
};

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PfqPricingPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tier = await getPfqTier(supabase, user?.id);
  const hasPro = pfqTierAtLeast(tier, "pro");

  const params = await searchParams;
  const resumeCheckout =
    !!user &&
    !hasPro &&
    params?.[PFQ_PRO_INTENT_PARAM] === PFQ_PRO_INTENT_VALUE &&
    PFQ_CHECKOUT_ENABLED;

  return (
    <section className="wrap py-10 sm:py-14">
      <div className="mx-auto max-w-[62rem]">
        <header className="mb-8 max-w-[42rem] sm:mb-10">
          <PricingBackLink
            current={
              <>
                PFQ in <span className="text-orange">2 days</span> Pricing
              </>
            }
          />

          <h1 className="text-left font-display text-[clamp(1.9rem,4.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.035em] text-balance text-ink">
            <span className="block text-orange">Start free.</span>
            <span className="block">Upgrade only if you love it.</span>
          </h1>
        </header>

        <h2 className="mb-5 font-display text-[clamp(1.2rem,2.6vw,1.45rem)] font-bold leading-none tracking-[-0.03em] text-ink sm:mb-6">
          PFQ in <span className="text-orange">2 days</span>
        </h2>

        <PfqPlanCards
          isSignedIn={!!user}
          userTier={tier}
          resumeProCheckout={resumeCheckout}
        />

        <p className="mt-8 w-full border-t border-ink/10 pt-5 text-[12px] leading-relaxed text-pretty text-ink/55">
          Prices in GBP and include any applicable tax. Question and mock-exam
          counts describe what a plan unlocks across the whole course. Read the{" "}
          <Link
            href="/terms"
            className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
