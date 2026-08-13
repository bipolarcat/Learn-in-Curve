import type { Metadata } from "next";
import { PfqMockRunner } from "@/components/pfq/PfqMockRunner";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";

type Props = {
  params: Promise<{ attemptId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { attemptId } = await params;
  return {
    title: "PFQ Mock Attempt",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://www.learnincurve.com/pfq/mock/${attemptId}`,
    },
  };
}

export default async function PfqMockAttemptPage({ params }: Props) {
  const { attemptId } = await params;
  return (
    <div className="mx-auto w-full max-w-wrap px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <PfqMockRunner attemptId={attemptId} />
      <p className="mt-10 max-w-3xl font-body text-[12px] leading-relaxed text-ink/55">
        {PFQ_ATP_DISCLAIMER}
      </p>
    </div>
  );
}
