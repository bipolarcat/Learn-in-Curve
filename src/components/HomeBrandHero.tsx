"use client";

import { useReducedMotion } from "framer-motion";
import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";
import { ExploreCoursesLink } from "@/components/ExploreCoursesLink";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import {
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";
import { BouncingText } from "@/components/ui/bouncing-text";

const HEADLINE =
  "PFQ or PMQ. Wherever you are on the curve.";
const SUBCOPY =
  "Stop re-reading. Start revising with 1,000+ practice questions and full mock exams for the APM PFQ and PMQ.";
const EYEBROW = "Project Management Exam Revision";

/** Category line — lab style: body bold teal, open tracking (static). */
function CategoryStamp() {
  return (
    <p className="text-center font-body text-[13px] font-bold leading-none tracking-[0.12em] text-teal sm:text-[17px] sm:tracking-[0.1em]">
      {EYEBROW}
    </p>
  );
}

/** “curve.” — only animated text in the hero (21st BouncingText). */
function CurveAccent() {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className="inline text-orange">curve.</span>;
  }

  return (
    <span className="inline-block overflow-visible text-orange">
      <BouncingText
        className="inline-block"
        repeat={false}
        persist
        fromY={-72}
      >
        curve
      </BouncingText>
      .
    </span>
  );
}

function Headline() {
  return (
    <h1
      id="home-brand-hero-title"
      className="overflow-visible text-balance font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink"
      aria-label={HEADLINE}
    >
      <span aria-hidden className="inline overflow-visible">
        PFQ or PMQ.
        <br />
        Wherever you are on{" "}
        {/* Mobile: keep “on” on line 2; break before “the curve.” */}
        <br className="sm:hidden" />
        the <CurveAccent />
      </span>
    </h1>
  );
}

/**
 * Home brand hero — animals lead; static copy; only “curve” animates.
 */
export function HomeBrandHero() {
  return (
    <section
      id="home-brand-hero"
      aria-labelledby="home-brand-hero-title"
      className="hero relative overflow-x-clip overflow-y-visible pb-4 pt-4 sm:pb-5 sm:pt-6 lg:pb-6 lg:pt-8"
    >
      <div className="wrap relative z-[1]">
        <div className="mx-auto flex w-full max-w-[min(100%,52rem)] flex-col items-center text-center xl:max-w-[58rem]">
          {/* Move animals only via margin — do not touch HeroAnimalsScene motion. */}
          <div className="relative mb-4 w-full sm:mb-5 [&_[data-hero-animals]]:!mb-0">
            <HeroAnimalsScene />
          </div>

          <div className="flex w-full flex-col items-center gap-2 sm:gap-2.5">
            <CategoryStamp />
            <Headline />
          </div>

          <p className="mx-auto mt-5 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:mt-6 sm:text-[18px]">
            {SUBCOPY}
          </p>

          <div className="hero-ctas relative z-10 mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
            <FreeMockExamLink
              className={stampCtaTealFlat}
              from="home"
              label="Take a free mock"
              showArrow
            />
            <ExploreCoursesLink
              className={stampCtaSecondaryFlat}
              showArrow={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
