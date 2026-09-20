import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { HomeBrandHero } from "@/components/HomeBrandHero";
import { LabExamPaths } from "@/components/lab/LabExamPaths";
import { TestingMethod } from "@/components/TestingMethod";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

/**
 * `PmqLiveLamp` and `QuizDemo` are intentionally left in the repo but unmounted
 * here — replaced 2026-07-31 by `PmqLaunchProof` and `TrialQuiz`.
 * 2026-09-20: `PmqLaunchProof` ↔ `LabExamPaths`; standalone `TrialQuiz` moved to `/lab`.
 */
const SlyShowcase = dynamic(
  () =>
    import("@/components/SlyShowcase").then((m) => ({
      default: m.SlyShowcase,
    })),
  {
    loading: () => <div className="min-h-[28rem] w-full" aria-hidden />,
  },
);

const LabActivityDemo = dynamic(
  () =>
    import("@/components/lab/LabActivityDemo").then((m) => ({
      default: m.LabActivityDemo,
    })),
  {
    loading: () => (
      <div
        className="mx-auto min-h-[22rem] w-full border-t border-ink/[0.06]"
        aria-hidden
      />
    ),
  },
);

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  return (
    <>
      <HomeBrandHero />

      <TestingMethod />

      <LabActivityDemo isSignedIn={isSignedIn} />

      <LabExamPaths isSignedIn={isSignedIn} />

      <SlyShowcase isSignedIn={isSignedIn} />
    </>
  );
}
