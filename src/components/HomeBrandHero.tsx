"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { CtaArrow, stampCtaTealFlat } from "@/components/stamp-chip";
import { marketingActionSecondary } from "@/components/ui/semantic";
import { BouncingText } from "@/components/ui/bouncing-text";
import { trackCtaClicked } from "@/lib/analytics/events";
import { isSoftNavClick } from "@/lib/soft-nav-back";

/** Primary hero CTA — teal solid, uses shared min-h-11 (no downward !min-h overrides). */
const HERO_COURSE_CTA =
  `${stampCtaTealFlat} !normal-case !tracking-[-0.01em]`;

/** Secondary mock CTA — outline/ghost weight so primary reads as the main action. */
const HERO_MOCK_CTA =
  `${marketingActionSecondary} !normal-case !tracking-[-0.01em]`;

const HEADLINE = "PFQ or PMQ. Wherever you are on the curve.";
const SUBCOPY =
  "Stop re-reading. Start revising with 1,000+ practice questions and full mock exams for the APM PFQ and PMQ.";
const EYEBROW = "Project Management Exam Revision";

/** Category line — lab style: body bold teal, open tracking (static). */
function CategoryStamp() {
  return (
    <p className="text-center font-body text-[15px] font-bold leading-none tracking-[0.12em] text-teal sm:text-[19px] sm:tracking-[0.1em]">
      {EYEBROW}
    </p>
  );
}

/**
 * “curve.” — short ease-out settle (no bounce/elastic overshoot).
 * Reduced-motion / persist paths unchanged.
 */
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
        fromY={-18}
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
 * Home brand hero — animals + copy; only “curve” animates in the headline.
 * Two ranked CTAs: free course (primary) + free mock (secondary).
 */
export function HomeBrandHero() {
  return (
    <section
      id="home-brand-hero"
      aria-labelledby="home-brand-hero-title"
      className="hero relative overflow-x-clip overflow-y-visible pb-4 pt-4 sm:pb-5 sm:pt-6 lg:pb-6 lg:pt-8"
    >
      <div className="relative">
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

            <p className="mx-auto mt-3.5 max-w-[36rem] text-pretty font-body text-[clamp(13.5px,4.2vw,16px)] leading-relaxed text-ink/80 sm:mt-4 sm:max-w-[42rem] sm:text-[18px]">
              {SUBCOPY}
            </p>
          </div>
        </div>
      </div>

      <div className="wrap relative z-10">
        <div className="hero-ctas mx-auto mt-3 flex w-full max-w-[58rem] flex-row flex-wrap items-center justify-center gap-2.5 sm:mt-3.5 sm:gap-3">
          <Link
            href="/courses"
            className={HERO_COURSE_CTA}
            onClick={(event) => {
              trackCtaClicked({
                variant: "Start the free course",
                location: "hero",
              });
              if (!isSoftNavClick(event)) return;
            }}
          >
            <span className="relative z-[1] inline-flex items-center gap-1.5">
              <span>Start the free course</span>
              <CtaArrow />
            </span>
          </Link>
          <FreeMockExamLink
            className={HERO_MOCK_CTA}
            from="home"
            href="/free-mock-exam/apm-pmq"
            label="Take free mock exam"
            location="hero"
            showArrow
          />
        </div>
      </div>
    </section>
  );
}
