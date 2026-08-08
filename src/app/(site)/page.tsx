import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { NotifyBand } from "@/components/NotifyBand";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ExploreCoursesLink } from "@/components/ExploreCoursesLink";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";
import { PmqLaunchProof } from "@/components/PmqLaunchProof";
import { FeatureStack } from "@/components/FeatureStack";
import {
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";
import type { CSSProperties } from "react";

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
      {/* Primary brand hero — PM + AI promise */}
      <section
        id="home-brand-hero"
        aria-labelledby="home-brand-hero-title"
        className="hero relative overflow-x-clip pb-4 pt-4 sm:pb-5 sm:pt-6 lg:pb-6 lg:pt-8"
      >
        <div className="wrap relative z-[1]">
          <div className="mx-auto flex w-full max-w-[min(100%,52rem)] flex-col items-center text-center xl:max-w-[58rem]">
            <div className="w-full">
              <HeroAnimalsScene />
            </div>
            <h1
              id="home-brand-hero-title"
              className="hero-enter mb-2 text-balance font-display text-[clamp(2.1rem,4.6vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink"
              style={{ "--hero-i": 1 } as CSSProperties}
            >
              Master Project Management &amp;{" "}
              <span className="text-orange">AI</span>
            </h1>
            <p
              className="hero-enter mx-auto mb-8 max-w-[36rem] text-pretty text-[17px] leading-relaxed text-ink/80 sm:text-[19px]"
              style={{ "--hero-i": 2 } as CSSProperties}
            >
              Exam revision that works: thousands of practice questions, full
              timed mock exams, and an AI tutor that knows your syllabus. Free to
              start.
            </p>
            <div
              className="hero-enter hero-ctas relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
              style={{ "--hero-i": 3 } as CSSProperties}
            >
              <FreeMockExamLink className={stampCtaTealFlat} />
              <ExploreCoursesLink className={stampCtaSecondaryFlat} />
            </div>
          </div>
        </div>
      </section>

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

      <section id="newsletter" className="newsletter relative pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div className="wrap relative z-[1]">
          <ScrollReveal>
            <NotifyBand />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
