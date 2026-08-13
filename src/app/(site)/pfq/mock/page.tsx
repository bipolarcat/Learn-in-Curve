import type { Metadata } from "next";
import { PfqMockRunner } from "@/components/pfq/PfqMockRunner";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "PFQ Mock Exam — Timed 60 Questions",
  description:
    "Free timed APM PFQ practice mock: 60 questions, 60 minutes, flagging and review panel. Results show a 59-outcome coverage map.",
  alternates: { canonical: `${SITE_URL}/pfq/mock` },
  robots: { index: true, follow: true },
};

export default function PfqMockStartPage() {
  return (
    <div className="mx-auto w-full max-w-wrap px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <PfqMockRunner />
      <p className="mt-10 max-w-3xl font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
