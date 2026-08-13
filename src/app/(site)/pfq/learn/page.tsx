import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { canAccessPfqLessons } from "@/lib/pfq/tiers";
import {
  PFQ_LESSONS_ENABLED,
  PFQ_MOCK_HREF,
  PFQ_PRACTICE_ENABLED,
  PFQ_PRACTICE_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import { PfqCoverageMap } from "@/components/pfq/PfqCoverageMap";
import { PfqLessonMap } from "@/components/pfq/PfqLessonMap";
import { buildCoverageFromSignals } from "@/lib/pfq/coverage";
import { getPfqLessonProgressMap } from "@/lib/pfq/lesson-actions";
import { PFQ_LESSONS } from "@/lib/pfq/content";
import type { PfqCoverageSignal } from "@/lib/pfq/types";

export const metadata: Metadata = {
  title: "PFQ in 2 Days — Learn",
  robots: { index: false, follow: false },
};

/**
 * Post-purchase hub: lesson map (Day 1/2 with mark weights) + measured coverage.
 * Lesson completion is separate from coverage (self-assessed vs measured).
 */
export default async function PfqLearnPage() {
  if (!PFQ_LESSONS_ENABLED) {
    redirect(PFQ_PRICING_HREF);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent("/pfq/learn")}`);
  }

  const tier = await getPfqTier(supabase, user.id);
  if (!canAccessPfqLessons(tier)) {
    redirect(PFQ_PRICING_HREF);
  }

  // Touch corpus so a malformed file fails the page/build, not silently.
  void PFQ_LESSONS.length;

  const progress = await getPfqLessonProgressMap(user.id);

  let coverageBlock: ReturnType<typeof buildCoverageFromSignals> =
    buildCoverageFromSignals([]);
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
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <div className="flex flex-col gap-4">
        <h1 className="m-0 font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
          PFQ in <span className="text-orange">2 Days</span>
        </h1>
        <p className="m-0 max-w-xl font-body text-[15px] leading-relaxed text-ink/75">
          Ten objectives, 59 outcomes, 60 marks. Day 1 and Day 2 are 30 marks
          each — revise by weight, not by card order.
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
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
          Lesson map
        </h2>
        <PfqLessonMap progress={progress} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
          Coverage map
        </h2>
        <p className="m-0 max-w-xl font-body text-[14px] leading-relaxed text-ink/65">
          Measured answers only (practice and mock). Lesson checkpoints do not
          move this number.
        </p>
        <PfqCoverageMap
          headlineCorrect={coverageBlock.headlineCorrect}
          outcomeCount={coverageBlock.outcomeCount}
          coverage={coverageBlock.coverage}
          objectives={coverageBlock.objectives}
          combined
        />
      </section>

      <p className="m-0 max-w-3xl border-t border-ink/10 pt-6 font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
