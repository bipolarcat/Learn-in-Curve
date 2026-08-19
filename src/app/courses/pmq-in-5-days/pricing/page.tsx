import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAiTutorEntitlement } from "@/lib/pmq/queries";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";
import {
  PMQ_PRICING_HREF,
  PMQ_PRO_INTENT_PARAM,
  PMQ_PRO_INTENT_VALUE,
} from "@/lib/pmq/plans";
import { PmqPlanCards } from "@/components/pmq/PmqPlanCards";
import { PricingBackLink } from "@/components/pmq/PricingBackLink";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "Plans & pricing — PMQ in 5 days | Learn in Curve",
  description:
    "Start free with the complete APM PMQ syllabus. Upgrade for more practice, mock exams, and video and audio overviews — or wait for Sly, your AI tutor.",
  alternates: { canonical: `${SITE_URL}/courses/pmq-in-5-days/pricing` },
};

type PmqPricingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PmqPricingPage({
  searchParams,
}: PmqPricingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPro = user
    ? !!(await getAiTutorEntitlement(supabase, user.id, PMQ_COURSE_ID))
    : false;

  // Guests who hit "Get Pro Bundle" are sent to sign-up with this page (carrying
  // ?intent=pro) as `next`. Coming back signed in and still unentitled means they
  // were mid-purchase, so reopen checkout rather than making them find the button
  // again. Deliberately gated on `!hasPro` so an owner is never pushed to pay twice.
  const resumeProCheckout =
    !!user &&
    !hasPro &&
    (await searchParams)?.[PMQ_PRO_INTENT_PARAM] === PMQ_PRO_INTENT_VALUE;

  return (
    <section className="wrap py-10 sm:py-14">
      <div className="mx-auto max-w-[62rem]">
        <header className="mb-8 max-w-[42rem] sm:mb-10">
          <PricingBackLink
            current={
              <>
                PMQ in <span className="text-orange">5 days</span> Pricing
              </>
            }
          />

          <h1 className="text-left font-display text-[clamp(1.9rem,4.4vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.035em] text-balance text-ink">
            <span className="block text-orange">Start free.</span>
            <span className="block">Upgrade only if you love it.</span>
          </h1>
          <p className="mt-3.5 max-w-[38rem] text-left text-[15px] leading-relaxed text-pretty text-ink/72">
            Every plan includes the complete APM PMQ syllabus, covering all 24
            learning objectives. Upgrade to unlock more practice and reinforce
            your learning.
          </p>
        </header>

        <PmqPlanCards
          isSignedIn={!!user}
          hasPro={hasPro}
          proReturnPath={PMQ_PRICING_HREF}
          resumeProCheckout={resumeProCheckout}
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
