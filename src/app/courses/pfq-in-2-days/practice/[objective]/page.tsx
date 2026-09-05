import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PfqPracticeRunner } from "@/components/pfq/PfqPracticeRunner";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import {
  PFQ_PRACTICE_ENABLED,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";

type Props = {
  params: Promise<{ objective: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { objective } = await params;
  const n = Number(objective);
  const meta = PFQ_OBJECTIVES.find((o) => o.objective === n);
  return {
    title: meta
      ? `Practice LO${n} — ${meta.title}`
      : "PFQ Practice",
    robots: { index: false, follow: false },
  };
}

export default async function PfqPracticeObjectivePage({ params }: Props) {
  if (!PFQ_PRACTICE_ENABLED) {
    redirect(PFQ_PRICING_HREF);
  }

  await requirePfqProOrRedirect();

  const { objective: raw } = await params;
  const objective = Number(raw);
  const meta = PFQ_OBJECTIVES.find((o) => o.objective === objective);
  if (!meta || !Number.isInteger(objective)) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-wrap px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <PfqPracticeRunner
        objective={meta.objective}
        objectiveTitle={meta.title}
      />
      <p className="mt-10 max-w-3xl font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
