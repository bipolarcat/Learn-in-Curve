import type { Metadata } from "next";
import { PfqMockSession } from "@/components/pfq/PfqMockSession";
import { loadPfqAttempt } from "@/lib/pfq/actions";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { createClient } from "@/lib/supabase/server";
import { PFQ_MOCK_HREF } from "@/lib/pfq/constants";
import { buildTitle } from "@/lib/seo/title";

type Props = {
  params: Promise<{ attemptId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { attemptId } = await params;
  return {
    title: buildTitle("PFQ Mock Attempt"),
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://www.learnincurve.com${PFQ_MOCK_HREF}/${attemptId}`,
    },
  };
}

export default async function PfqMockAttemptPage({ params }: Props) {
  await requirePfqProOrRedirect();
  const { attemptId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [tier, loaded] = await Promise.all([
    getPfqTier(supabase, user?.id),
    loadPfqAttempt({ attemptId }),
  ]);
  const mockSet = loaded.ok ? loaded.mockSet ?? undefined : undefined;

  return (
    <PfqMockSession userTier={tier} attemptId={attemptId} mockSet={mockSet} />
  );
}
