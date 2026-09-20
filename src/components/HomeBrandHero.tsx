"use client";

import { useReducedMotion } from "framer-motion";
import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { stampCtaTealFlat } from "@/components/stamp-chip";
import { BouncingText } from "@/components/ui/bouncing-text";

const HERO_MOCK_CTA =
  `${stampCtaTealFlat} hero-mock-cta !normal-case !tracking-[-0.01em] !min-h-9 !gap-1.5 !px-3.5 !py-2 sm:!min-h-10 sm:!px-4 [&_svg]:!h-3 [&_svg]:!w-3`;

const HEADLINE =
  "PFQ or PMQ. Wherever you are on the curve.";
/**
 * Subcopy wraps (nowrap rows, measured to avoid orphans):
 * - <sm: 3 rows, R3 = “APM PFQ and PMQ.”
 * - sm–800: 2 rows, first longer
 * - ≥800: 2 rows, lead + “APM PFQ and PMQ.”
 */
const SUB_MOBILE = [
  "Stop re-reading. Start revising with 1,000+ practice",
  "questions and full mock exams for the",
  "APM PFQ and PMQ.",
] as const;
const SUB_TABLET = [
  "Stop re-reading. Start revising with 1,000+ practice questions",
  "and full mock exams for the APM PFQ and PMQ.",
] as const;
const SUB_DESKTOP = [
  "Stop re-reading. Start revising with 1,000+ practice questions and full mock exams for the",
  "APM PFQ and PMQ.",
] as const;
const EYEBROW = "Project Management Exam Revision";

function SubcopyRows({
  rows,
  className,
}: {
  rows: readonly string[];
  className: string;
}) {
  return (
    <span className={className}>
      {rows.map((row) => (
        <span key={row} className="block whitespace-nowrap">
          {row}
        </span>
      ))}
    </span>
  );
}

/** Category line — lab style: body bold teal, open tracking (static). */
function CategoryStamp() {
  return (
    <p className="text-center font-body text-[15px] font-bold uppercase leading-none tracking-[0.12em] text-teal sm:text-[19px] sm:tracking-[0.1em]">
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
 * Home brand hero — animals + copy; only “curve” animates in the headline.
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

            <p className="mx-auto mt-3.5 max-w-[36rem] font-body text-[clamp(13.5px,4.2vw,16px)] leading-relaxed text-ink/80 sm:mt-4 sm:max-w-none sm:text-[18px]">
              <SubcopyRows rows={SUB_MOBILE} className="sm:hidden" />
              <SubcopyRows
                rows={SUB_TABLET}
                className="hidden sm:block min-[800px]:hidden"
              />
              <SubcopyRows
                rows={SUB_DESKTOP}
                className="hidden min-[800px]:block"
              />
            </p>
          </div>
        </div>
      </div>

      <div className="wrap relative z-10">
        <div className="hero-ctas mx-auto mt-3 flex w-full max-w-[min(100%,52rem)] flex-wrap items-center justify-center gap-3 sm:mt-3.5 sm:gap-4 xl:max-w-[58rem]">
          <FreeMockExamLink
            className={HERO_MOCK_CTA}
            from="home"
            href="/free-mock-exam/apm-pmq"
            label="Take Free Mock Exam"
            location="hero"
            showArrow
          />
        </div>
      </div>
    </section>
  );
}
