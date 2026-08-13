import type { Metadata } from "next";
import Link from "next/link";
import { PfqCoverageMap } from "@/components/pfq/PfqCoverageMap";
import { PfqTrapSchool } from "@/components/pfq/PfqTrapSchool";
import { CtaArrow, stampCtaPrimary } from "@/components/stamp-chip";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import {
  PFQ_OBJECTIVES,
  PFQ_OUTCOME_COUNT,
  PFQ_OUTCOME_TITLES,
  type PfqOutcomeCode,
} from "@/lib/pfq/outcomes";
import { formatPfqPriceGbp, PFQ_PRICING_HREF } from "@/lib/pfq/constants";
import type { PfqCoverageOutcome, PfqObjectiveResult } from "@/lib/pfq/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

/**
 * Interim landing until Claude rewrites PFQ_LANDING_COPY.md for paid-only.
 * Do not restore free-mock CTAs — the mock is Pro-gated.
 */
const PAGE_TITLE = "PFQ in 2 Days — APM Project Fundamentals Revision";
const PAGE_DESCRIPTION =
  "59 lessons, practice, a Surpass-alike mock and a coverage map of every APM PFQ learning outcome. One price, no subscription.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/pfq` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/pfq`,
    type: "website",
  },
};

function previewCoverage(): {
  coverage: PfqCoverageOutcome[];
  objectives: PfqObjectiveResult[];
} {
  const coverage: PfqCoverageOutcome[] = [];
  for (const obj of PFQ_OBJECTIVES) {
    for (const code of obj.outcomes) {
      coverage.push({
        code,
        title: PFQ_OUTCOME_TITLES[code as PfqOutcomeCode],
        objective: obj.objective,
        day: obj.day,
        state: "unattempted",
        marks: 1,
      });
    }
  }
  const objectives: PfqObjectiveResult[] = PFQ_OBJECTIVES.map((obj) => ({
    objective: obj.objective,
    title: obj.title,
    day: obj.day,
    available: obj.marks,
    scored: 0,
  }));
  return { coverage, objectives };
}

export default function PfqLandingPage() {
  const { coverage, objectives } = previewCoverage();

  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <header className="flex max-w-2xl flex-col gap-4">
        <p className="m-0 font-body text-[12px] font-semibold tracking-[0.04em] text-ink/45 uppercase">
          PFQ in 2 Days · {formatPfqPriceGbp()}
        </p>
        <h1 className="m-0 font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink text-balance">
          See which of the{" "}
          <span className="text-orange">{PFQ_OUTCOME_COUNT}</span> learning
          outcomes you can already answer.
        </h1>
        <p className="m-0 font-body text-[1.05rem] leading-relaxed text-ink/75">
          The APM Project Fundamentals Qualification assesses every published
          outcome, with one doubled. The course includes a 60-question timed
          mock and a coverage map — not just a percentage.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={PFQ_PRICING_HREF} className={stampCtaPrimary}>
            See pricing
            <CtaArrow />
          </Link>
        </div>
      </header>

      <PfqCoverageMap
        headlineCorrect={0}
        outcomeCount={PFQ_OUTCOME_COUNT}
        coverage={coverage}
        objectives={objectives}
        preview
      />

      <PfqTrapSchool />

      <p className="m-0 max-w-3xl border-t border-ink/10 pt-6 font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
