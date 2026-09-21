import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import {
  PFQ_PRACTICE_ENABLED,
  PFQ_PRICING_HREF,
  PFQ_PRACTICE_HREF,
} from "@/lib/pfq/constants";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import { requirePfqSignedInOrRedirect } from "@/lib/pfq/require-pro";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqFullPractice } from "@/lib/pfq/tiers";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import { buildTitle } from "@/lib/seo/title";

export const metadata: Metadata = {
  title: buildTitle("PFQ Practice: Pick an objective"),
  robots: { index: false, follow: false },
};

export default async function PfqPracticeIndexPage() {
  if (!PFQ_PRACTICE_ENABLED) {
    redirect(PFQ_PRICING_HREF);
  }
  await requirePfqSignedInOrRedirect();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(PFQ_PRICING_HREF);
  }

  const tier = await getPfqTier(supabase, user.id);
  const showFullBank = canAccessPfqFullPractice(tier);

  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <h1 className="m-0 font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
        Practice
      </h1>
      <p className="m-0 max-w-xl font-body text-[15px] leading-relaxed text-ink/75">
        Untimed drills in sets of five. Set 1 is free on every objective. More
        sets and both mock exams unlock with Pro. Results update the coverage
        map by learning outcome (most recent answer wins).
      </p>

      <section className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper p-4 sm:p-5">
        <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
          Free sample
        </h2>
        <p className="m-0 max-w-xl font-body text-[14px] leading-relaxed text-ink/70">
          Five questions from each of the ten objectives, fifty in all.
          Immediate feedback, then a short report on what you missed.
        </p>
        <Link
          href={`${PFQ_PRACTICE_HREF}/sample`}
          className={`${stampCtaPrimary} w-fit`}
        >
          Start free sample
        </Link>
      </section>

      <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
        Practice by objective
      </h2>
      {!showFullBank ? (
        <p className="m-0 max-w-xl font-body text-[14px] leading-relaxed text-ink/70">
          Five free questions on each objective. Generate more sets with{" "}
          <Link
            href={PFQ_PRICING_HREF}
            className="underline decoration-ink/25 underline-offset-2 hover:text-ink"
          >
            Pro
          </Link>
          .
        </p>
      ) : null}
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {PFQ_OBJECTIVES.map((obj) => (
          <li key={obj.objective}>
            <Link
              href={`${PFQ_PRACTICE_HREF}/${obj.objective}`}
              className={stampCtaSecondary}
            >
              LO{obj.objective} · {obj.title}
            </Link>
          </li>
        ))}
      </ul>

      <p className="m-0 max-w-3xl border-t border-ink/10 pt-6 font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
