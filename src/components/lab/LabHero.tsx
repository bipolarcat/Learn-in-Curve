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
 * Product label — Apple-sleek but present. Figtree; stronger than whisper,
 * still below Fraunces H1.
 */
function CategoryStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      className="mb-2.5 text-center font-body text-[15px] font-semibold leading-none tracking-[-0.015em] text-ink sm:mb-3 sm:text-[16px]"
      initial={reduce ? false : { y: 6, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2.5">
        <span>Project Management</span>
        <span className="text-ink/30" aria-hidden>
          ·
        </span>
        <span>Exam Revision</span>
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
      className="mb-4 overflow-visible text-balance font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:mb-5"
    >
      PFQ or PMQ.
      <br />
      Wherever you are on the <CurveAccent />
    </h1>
  );
}

/**
 * Lab hero — geometric paths + animals between category line and PFQ/PMQ.
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
          <CategoryStamp />

          <div className="relative -mt-0.5 mb-3 w-full sm:mb-4 [&_[data-hero-animals]]:!mb-0">
            <HeroAnimalsScene />
          </div>

          <Headline />

          <p className="mx-auto mb-8 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:mb-9 sm:text-[18px]">
            {SUBCOPY}
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center">
            <FreeMockExamLink
              className={stampCtaTealFlat}
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
