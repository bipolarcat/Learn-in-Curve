import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPfqTier } from "@/lib/pfq/entitlement";
import {
  PFQ_CHECKOUT_ENABLED,
  PFQ_LEARN_HREF,
  PFQ_PRO_INTENT_PARAM,
  PFQ_PRO_INTENT_VALUE,
  PFQ_PRO_PRICE_CENTS,
  formatPfqPriceGbp,
} from "@/lib/pfq/constants";
import { PfqCheckoutButton } from "@/components/pfq/PfqCheckoutButton";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { stampCtaPrimary } from "@/components/stamp-chip";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const PFQ_PRICE_LABEL = formatPfqPriceGbp(PFQ_PRO_PRICE_CENTS);

export const metadata: Metadata = {
  title: "PFQ in 2 Days — Pricing | Learn in Curve",
  description: `Everything you need for the APM Project Fundamentals Qualification for ${PFQ_PRICE_LABEL} — lessons, practice, timed mock, coverage map. One payment, no subscription.`,
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
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <header className="flex max-w-xl flex-col gap-4">
        <p className="m-0 font-body text-[12px] font-semibold tracking-[0.04em] text-ink/45 uppercase">
          One course · one price
        </p>
        <h1 className="m-0 font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink">
          PFQ in <span className="text-orange">2 Days</span>
        </h1>
        <p className="m-0 font-display text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.03em] text-ink">
          {formatPfqPriceGbp(PFQ_PRO_PRICE_CENTS)}
        </p>
        <p className="m-0 font-body text-[1.05rem] leading-relaxed text-ink/75">
          Everything you need to pass the APM Project Fundamentals Qualification,
          and nothing you don&apos;t.
        </p>
      </header>

      <ul className="m-0 max-w-xl list-disc space-y-2 pl-5 font-body text-[15px] leading-relaxed text-ink/80">
        <li>
          59 lessons, one for every learning outcome in the APM syllabus
        </li>
        <li>
          Around 300 practice questions, each mapped to the outcome it tests
        </li>
        <li>
          A full 60-question mock exam, timed and formatted like the real one
        </li>
        <li>
          A coverage map that tells you which outcomes you can answer and which
          you can&apos;t
        </li>
        <li>Trap School: the question formats that cost people marks</li>
      </ul>

      <p className="m-0 max-w-xl font-body text-[15px] font-semibold text-ink">
        One payment. No subscription. Yours for good.
      </p>

      {hasPro ? (
        <Link href={PFQ_LEARN_HREF} className={stampCtaPrimary}>
          Open your course
        </Link>
      ) : (
        <PfqCheckoutButton
          isSignedIn={!!user}
          autoStart={resumeCheckout}
        />
      )}

      {!PFQ_CHECKOUT_ENABLED && !hasPro ? (
        <p className="m-0 max-w-xl font-body text-[13px] leading-relaxed text-ink/55">
          Checkout is built against Stripe test mode but not enabled for live
          charges until the 14-day cancellation waiver wording is reviewed.
        </p>
      ) : null}

      <p className="m-0 max-w-xl border-t border-ink/10 pt-6 font-body text-[14px] leading-relaxed text-ink/70">
        The APM exam itself is booked and paid separately with APM, and currently
        costs £278.40 for non-members. This course prepares you for it. It is not
        the exam and it is not a qualification.
      </p>

      <p className="m-0 max-w-xl font-body text-[12px] leading-relaxed text-ink/55">
        Prices in GBP. By paying you agree to our{" "}
        <Link
          href="/terms"
          className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
        >
          Terms
        </Link>{" "}
        (including the refund policy) and{" "}
        <Link
          href="/privacy"
          className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
        >
          Privacy Policy
        </Link>
        . Digital content starts immediately once you tick the checkout box
        acknowledging that you lose the standard 14-day cancellation right.
      </p>

      <p className="m-0 max-w-3xl font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
