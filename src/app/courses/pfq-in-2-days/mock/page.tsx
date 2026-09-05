import type { Metadata } from "next";
import { Suspense } from "react";
import { PfqMockRunner } from "@/components/pfq/PfqMockRunner";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import { PFQ_MOCK_HREF } from "@/lib/pfq/constants";
import type { PfqMockSet } from "@/lib/pfq/generator";
import { Spinner } from "@/components/ui/spinner";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "PFQ Mock Exam — Timed 60 Questions",
  description:
    "Timed APM PFQ practice mock: 60 questions, 60 minutes, flagging and review panel. Results show a 59-outcome coverage map.",
  alternates: { canonical: `${SITE_URL}${PFQ_MOCK_HREF}` },
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ set?: string }>;
};

function parseMockSet(raw: string | undefined): PfqMockSet | undefined {
  if (raw === "1" || raw === "2" || raw === "3") {
    return Number(raw) as PfqMockSet;
  }
  return undefined;
}

export default async function PfqMockStartPage({ searchParams }: Props) {
  await requirePfqProOrRedirect();
  const params = await searchParams;
  const mockSet = parseMockSet(params.set);

  return (
    <div className="mx-auto w-full max-w-wrap px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 py-12 text-ink/60">
            <Spinner variant="ring" size={28} />
            <p className="m-0 font-body text-sm">Loading mock…</p>
          </div>
        }
      >
        <PfqMockRunner mockSet={mockSet} />
      </Suspense>
      <p className="mt-10 max-w-3xl font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
