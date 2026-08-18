import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import {
  PFQ_CHECKOUT_ENABLED,
  PFQ_PRO_INTENT_PARAM,
  PFQ_PRO_INTENT_VALUE,
  formatPfqPriceGbp,
} from "@/lib/pfq/constants";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { PfqPlanCards } from "@/components/pfq/PfqPlanCards";
import { PricingBackLink } from "@/components/pmq/PricingBackLink";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PFQ_PRICE_LABEL = formatPfqPriceGbp();

export const metadata: Metadata = {
  title: "Plans & pricing — PFQ in 2 Days | Learn in Curve",
  description: `Pro Bundle ${PFQ_PRICE_LABEL} for the APM Project Fundamentals Qualification — lessons, practice, timed mock, coverage map. AI Pro launching soon.`,
  alternates: { canonical: `${SITE_URL}/pfq/pricing` },
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
  const hasPro = tier === "pro";

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
          <PricingBackLink />

          <p className="mb-2 font-body text-[12px] font-semibold tracking-[0.08em] text-ink/45 uppercase">
            PFQ in 2 Days
          </p>
          <h1 className="text-left font-display text-[clamp(1.9rem,4.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.035em] text-balance text-ink">
            <span className="block text-orange">Plans for PFQ in 2 Days.</span>
            <span className="block">One payment. No subscription.</span>
          </h1>
          <p className="mt-3.5 max-w-[38rem] text-left text-[15px] leading-relaxed text-pretty text-ink/72">
            Unlock the full PFQ course — 59 lessons, 306 tagged practice
            questions, a timed mock, and a coverage map. AI Pro is on the
            waitlist.
          </p>
        </header>

        <PfqPlanCards
          isSignedIn={!!user}
          hasPro={hasPro}
          resumeProCheckout={resumeCheckout}
        />

        <p className="mt-8 w-full border-t border-ink/10 pt-5 text-[12px] leading-relaxed text-pretty text-ink/55">
          Prices in GBP and include any applicable tax. Checkout is not live
          until the 14-day cancellation waiver wording is reviewed. Read the{" "}
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

        <p className="mt-4 w-full text-[12px] leading-relaxed text-pretty text-ink/55">
          The APM exam itself is booked and paid separately with APM, and
          currently costs £278.40 for non-members. This course prepares you for
          it. It is not the exam and it is not a qualification.
        </p>

        <p className="mt-4 w-full text-[12px] leading-relaxed text-pretty text-ink/55">
          {PFQ_ATP_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
