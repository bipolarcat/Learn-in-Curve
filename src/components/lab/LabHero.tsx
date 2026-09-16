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
 * Modern category label — quiet paper chip, no ticket/stamp chrome.
 */
function CategoryStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      className="mb-2.5 sm:mb-3"
      initial={reduce ? false : { y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
    >
      <span className="inline-flex max-w-full items-center justify-center rounded-full border border-black/[0.08] bg-paper/90 px-4 py-1.5 font-body text-[13px] font-medium leading-none tracking-[-0.01em] text-ink/80 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.03),0_4px_14px_rgb(var(--ink-rgb)_/_0.05)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:px-5 sm:py-2 sm:text-[14px] dark:border-white/[0.12]">
        Project Management Exam Revision
      </span>
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
      className="mb-4 overflow-visible font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:mb-5"
    >
      <span className="sm:whitespace-nowrap">
        Wherever you are
        <br className="sm:hidden" />{" "}
        on the <CurveAccent />
      </span>
      <br />
      PFQ or PMQ.
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
          <div className="relative -mt-0.5 mb-2.5 w-full sm:mb-3 [&_[data-hero-animals]]:!mb-0">
            <HeroAnimalsScene />
          </div>

          <CategoryStamp />

          <Headline />

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
