import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import {
  PFQ_PRACTICE_ENABLED,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import { stampCtaSecondary } from "@/components/stamp-chip";

export const metadata: Metadata = {
  title: "PFQ Practice — Pick an objective",
  robots: { index: false, follow: false },
};

export default async function PfqPracticeIndexPage() {
  if (!PFQ_PRACTICE_ENABLED) {
    redirect(PFQ_PRICING_HREF);
  }
  await requirePfqProOrRedirect();

  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <h1 className="m-0 font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-ink">
        Practice by objective
      </h1>
      <p className="m-0 max-w-xl font-body text-[15px] leading-relaxed text-ink/75">
        Untimed drills. Results update the coverage map by learning outcome
        (most recent answer wins).
      </p>
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
        {PFQ_OBJECTIVES.map((obj) => (
          <li key={obj.objective}>
            <Link
              href={`/pfq/practice/${obj.objective}`}
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
