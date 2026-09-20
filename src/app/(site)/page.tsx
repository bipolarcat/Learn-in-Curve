import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { HomeBrandHero } from "@/components/HomeBrandHero";
import { PmqLaunchProof } from "@/components/PmqLaunchProof";
import { FeatureStack } from "@/components/FeatureStack";
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

const TrialQuiz = dynamic(
  () =>
    import("@/components/TrialQuiz").then((m) => ({ default: m.TrialQuiz })),
  {
    loading: () => (
      <div className="mx-auto min-h-[24rem] max-w-[46rem]" aria-hidden />
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

      <PmqLaunchProof isSignedIn={isSignedIn} />

      <FeatureStack />

      {/* No aria-label here — TrialQuiz's own <section> already carries the landmark name. */}
      <section
        id="home-trial-quiz"
        className="relative overflow-x-clip pt-[clamp(2rem,5vw,3rem)] pb-[clamp(3rem,6vw,5rem)]"
      >
        <div className="wrap relative z-[1]">
          <div className="mx-auto w-full max-w-[46rem]">
            <TrialQuiz isSignedIn={isSignedIn} />
          </div>
        </div>
      </section>

      <SlyShowcase isSignedIn={isSignedIn} />
    </>
  );
}
