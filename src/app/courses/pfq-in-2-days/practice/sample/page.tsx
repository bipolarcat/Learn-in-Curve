import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PfqPracticeRunner } from "@/components/pfq/PfqPracticeRunner";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import {
  PFQ_PRACTICE_ENABLED,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { requirePfqSignedInOrRedirect } from "@/lib/pfq/require-pro";
import { buildTitle } from "@/lib/seo/title";

export const metadata: Metadata = {
  title: buildTitle("PFQ Free Sample Practice"),
  robots: { index: false, follow: false },
};

export default async function PfqFreeSamplePracticePage() {
  if (!PFQ_PRACTICE_ENABLED) {
    redirect(PFQ_PRICING_HREF);
  }

  await requirePfqSignedInOrRedirect();

  return (
    <div className="mx-auto w-full max-w-wrap px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <PfqPracticeRunner mode="free-sample" objectiveTitle="Free sample" />
      <p className="mt-10 max-w-3xl font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
