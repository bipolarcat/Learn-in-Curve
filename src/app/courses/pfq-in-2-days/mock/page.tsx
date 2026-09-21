import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockedFeature } from "@/components/LockedFeature";
import { PfqCheckoutButton } from "@/components/pfq/PfqCheckoutButton";
import { PfqMockSession } from "@/components/pfq/PfqMockSession";
import { listPfqMockSetSummaries } from "@/lib/pfq/actions";
import { getPfqTier } from "@/lib/pfq/entitlement";
import { createClient } from "@/lib/supabase/server";
import {
  formatPfqPriceGbp,
  PFQ_LEARN_HREF,
  PFQ_MOCK_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { parsePfqMockSet, type PfqMockSet } from "@/lib/pfq/generator";
import { canAccessPfqMock } from "@/lib/pfq/tiers";
import { stampCtaSecondary } from "@/components/stamp-chip";
import { authHrefWithNext } from "@/lib/auth-next";
import { buildTitle } from "@/lib/seo/title";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: buildTitle("PFQ Mock Exam: Timed 60 Questions"),
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
  const params = await searchParams;
  const mockSet = parseMockSet(params.set);
  if (!mockSet) {
    redirect(PFQ_LEARN_HREF);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      authHrefWithNext(
        "/auth/sign-in",
        `${PFQ_MOCK_HREF}?set=${mockSet}`,
      ),
    );
  }

  const tier = await getPfqTier(supabase, user.id);
  if (!canAccessPfqMock(tier)) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <LockedFeature unlocked={false} label="Part of Pro">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Timed mock papers are part of Pro
          </h1>
          <p className="my-3 text-sm leading-relaxed text-pretty text-ink/75">
            Free includes 50 practice questions across all ten objectives.
            Pro unlocks all three timed 60-question mock papers, the full
            practice bank, and insights on every objective.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PfqCheckoutButton
              isSignedIn
              returnPath={`${PFQ_MOCK_HREF}?set=${mockSet}`}
              label={`Get Pro — ${formatPfqPriceGbp()}`}
              className="btn btn-primary inline-flex !min-h-9 !w-auto !rounded-xl !px-3.5 !text-[13px]"
            />
            <Link href={PFQ_PRICING_HREF} className={stampCtaSecondary}>
              Compare plans
            </Link>
          </div>
        </LockedFeature>
      </main>
    );
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

  return <PfqMockSession userTier={tier} mockSet={mockSet} />;
}
