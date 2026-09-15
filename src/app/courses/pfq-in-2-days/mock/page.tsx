import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PfqMockSession } from "@/components/pfq/PfqMockSession";
import { listPfqMockSetSummaries } from "@/lib/pfq/actions";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { createClient } from "@/lib/supabase/server";
import { PFQ_LEARN_HREF, PFQ_MOCK_HREF } from "@/lib/pfq/constants";
import { parsePfqMockSet, type PfqMockSet } from "@/lib/pfq/generator";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "PFQ Mock Exam — Timed 60 Questions",
  description:
    "Timed APM PFQ practice mock: 60 questions, 60 minutes. One sitting; the timer keeps running if you leave.",
  alternates: { canonical: `${SITE_URL}${PFQ_MOCK_HREF}` },
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ set?: string }>;
};

function parseMockSet(raw: string | undefined): PfqMockSet | undefined {
  return parsePfqMockSet(raw) ?? undefined;
}

export default async function PfqMockStartPage({ searchParams }: Props) {
  await requirePfqProOrRedirect();
  const params = await searchParams;
  const mockSet = parseMockSet(params.set);
  if (!mockSet) {
    redirect(PFQ_LEARN_HREF);
  }

  const summariesResult = await listPfqMockSetSummaries();
  if (summariesResult.ok) {
    const summary = summariesResult.summaries.find((s) => s.mockSet === mockSet);
    if (summary?.activeAttemptId) {
      redirect(`${PFQ_MOCK_HREF}/${summary.activeAttemptId}`);
    }
    if (summary?.latestAttemptId) {
      redirect(`${PFQ_MOCK_HREF}/${summary.latestAttemptId}`);
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tier = await getPfqTier(supabase, user?.id);

  return <PfqMockSession userTier={tier} mockSet={mockSet} />;
}
