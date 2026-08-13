import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqLessons } from "@/lib/pfq/tiers";
import {
  PFQ_MOCK_HREF,
  PFQ_PRACTICE_ENABLED,
  PFQ_PRACTICE_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import { PfqCoverageMap } from "@/components/pfq/PfqCoverageMap";
import { buildCoverageFromSignals } from "@/lib/pfq/coverage";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import type { PfqCoverageSignal } from "@/lib/pfq/types";

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

  let coverageBlock: ReturnType<typeof buildCoverageFromSignals> | null = null;
  try {
    const admin = createServiceClient();
    const { data } = await admin
      .from("pfq_coverage_signals")
      .select("learning_outcome, correct, source, question_id, updated_at")
      .eq("user_id", user.id);
    const signals: PfqCoverageSignal[] = (data ?? []).map((row) => ({
      learning_outcome: String(row.learning_outcome),
      correct: Boolean(row.correct),
      source: row.source as PfqCoverageSignal["source"],
      question_id: (row.question_id as string | null) ?? null,
      updated_at: String(row.updated_at),
    }));
    coverageBlock = buildCoverageFromSignals(signals);
  } catch {
    coverageBlock = buildCoverageFromSignals([]);
  }

  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <div className="flex flex-col gap-4">
        <h1 className="m-0 font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
          PFQ in <span className="text-orange">2 Days</span>
        </h1>
        <p className="m-0 max-w-xl font-body text-[15px] leading-relaxed text-ink/75">
          Your Pro access is active. Lessons are landing next — practice, the
          timed mock, and the coverage map are ready now.
        </p>
        <div className="flex flex-wrap gap-3">
          {PFQ_PRACTICE_ENABLED ? (
            <Link href={PFQ_PRACTICE_HREF} className={stampCtaPrimary}>
              Practise by objective
            </Link>
          ) : null}
          <Link href={PFQ_MOCK_HREF} className={stampCtaSecondary}>
            Sit the mock
          </Link>
          <Link href="/pfq#trap-school" className={stampCtaSecondary}>
            Trap School
          </Link>
        </div>
      </div>

      {coverageBlock ? (
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
            Coverage map
          </h2>
          <PfqCoverageMap
            headlineCorrect={coverageBlock.headlineCorrect}
            outcomeCount={coverageBlock.outcomeCount}
            coverage={coverageBlock.coverage}
            objectives={coverageBlock.objectives}
            combined
          />
          {PFQ_PRACTICE_ENABLED ? (
            <div className="flex flex-wrap gap-2">
              {PFQ_OBJECTIVES.map((obj) => (
                <Link
                  key={obj.objective}
                  href={`/pfq/practice/${obj.objective}`}
                  className={stampCtaSecondary}
                >
                  LO{obj.objective}
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <p className="m-0 max-w-3xl border-t border-ink/10 pt-6 font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
