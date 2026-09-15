import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PfqPracticeQuizSection } from "@/components/pfq/PfqPracticeQuizSection";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import {
  PFQ_PRACTICE_ENABLED,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import { requirePfqSignedInOrRedirect } from "@/lib/pfq/require-pro";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { getPfqPracticeInventory } from "@/lib/pfq/practice-actions";

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

  await requirePfqSignedInOrRedirect();

  const { objective: raw } = await params;
  const objective = Number(raw);
  const meta = PFQ_OBJECTIVES.find((o) => o.objective === objective);
  if (!meta || !Number.isInteger(objective)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(PFQ_PRICING_HREF);
  }

  const [tier, inventory] = await Promise.all([
    getPfqTier(supabase, user.id),
    getPfqPracticeInventory({ objective }),
  ]);

  return (
    <div className="mx-auto w-full max-w-wrap px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <PfqPracticeQuizSection
        objective={meta.objective}
        objectiveTitle={meta.title}
        userTier={tier}
        totalSets={inventory.ok ? inventory.totalSets : 0}
      />
      <p className="mt-10 max-w-3xl font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
