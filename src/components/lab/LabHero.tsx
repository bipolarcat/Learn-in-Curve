"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { LabBackgroundPaths } from "@/components/lab/LabBackgroundPaths";
import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { stampCtaTealFlat } from "@/components/stamp-chip";
import { BouncingText } from "@/components/ui/bouncing-text";

/** Apple / 21st Soft Blur In ease. */
const EASE = [0.22, 1, 0.36, 1] as const;

const SUBCOPY =
  "Stop re-reading. Start revising with 1,000+ practice questions and full mock exams for both APM qualifications.";

/**
 * Open category line — no badge chrome. Teal + open tracking.
 * Spacing to H1 is owned by the parent stack (`gap`), not margin hacks.
 */
function CategoryStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      className="text-center font-body text-[13px] font-bold leading-snug tracking-[0.12em] text-teal sm:text-[17px] sm:tracking-[0.1em]"
      initial={reduce ? false : { y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
    >
      Project Management Exam Revision
    </motion.p>
  );
}

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
      id="lab-hero-title"
      className="mb-4 overflow-visible font-display text-[2.125rem] font-semibold leading-none tracking-[-0.03em] text-ink sm:mb-5 flex flex-col items-center gap-1.5 lg:block lg:text-[clamp(2.05rem,5.2vw,3.65rem)] lg:leading-[1.08]"
    >
      {/*
        Mobile (<lg): 3 equal-gap rows, explicit rem sizes (no em / display:contents — both broke on real phones).
        Desktop (lg+): original one-line sentence + full-size PFQ.
      */}
      <span className="whitespace-nowrap">Wherever you are</span>
      <span className="whitespace-nowrap">
        <span className="hidden lg:inline"> </span>
        on the <CurveAccent />
      </span>
      <br className="hidden lg:inline" />
      <span className="whitespace-nowrap text-[1.7rem] lg:text-[1em]">
        PFQ or PMQ.
      </span>
    </h1>
  );
}

/**
 * Lab hero — geometric paths + animals, then category badge above the H1.
 * Cream dotted body shows through; live homepage untouched.
 */
export function LabHero() {
  return (
    <section
      id="lab-hero"
      aria-labelledby="lab-hero-title"
      className="relative flex min-h-[min(68vh,40rem)] items-start overflow-x-clip overflow-y-visible pb-10 pt-2 sm:pb-14 sm:pt-3 lg:pb-16 lg:pt-4"
    >
      <LabBackgroundPaths />

      <div className="wrap relative z-[1] w-full">
        <div className="mx-auto flex w-full max-w-[min(100%,40rem)] flex-col items-center text-center xl:max-w-[46rem]">
          <div className="relative -mt-0.5 mb-6 w-full sm:mb-10 [&_[data-hero-animals]]:!mb-0">
            <HeroAnimalsScene />
          </div>

          <div className="flex w-full flex-col items-center gap-1 sm:gap-0">
            <CategoryStamp />
            <Headline />
          </div>

          <p className="mx-auto mb-8 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:mb-9 sm:text-[18px]">
            {SUBCOPY}
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center">
            <FreeMockExamLink
              className={`${stampCtaTealFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`}
              from="home"
              location="lab-hero"
              label="Take a free mock"
              showArrow
            />
          </div>
        </div>
      </div>
    </section>
  );
}
