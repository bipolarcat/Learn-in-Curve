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
 * Exam-ticket kicker — perforated stub (not another soft pill).
 * Cue: 21st Animated Badge live pulse + LIC stamp type / cream ticket.
 */
function CategoryStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      className="mb-3 sm:mb-3.5"
      initial={reduce ? false : { y: 10, opacity: 0, filter: "blur(4px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
    >
      <span
        className="lab-exam-ticket relative inline-flex max-w-[min(100%,22rem)] items-stretch rounded-md border border-ink/15 bg-paper text-left shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_8px_24px_rgb(var(--ink-rgb)_/_0.07)] sm:max-w-none"
        aria-label="Project Management Exam Revision"
      >
        {/* Punch holes — cream circles over cream page = ticket notches */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-1.5 top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full bg-cream ring-1 ring-ink/10"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1.5 top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full bg-cream ring-1 ring-ink/10"
        />

        {/* Stub */}
        <span className="relative flex shrink-0 items-center gap-2 rounded-l-[5px] bg-teal px-2.5 py-2 sm:px-3">
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            {!reduce ? (
              <span className="absolute inset-0 rounded-full bg-gold/80 motion-safe:animate-ping" />
            ) : null}
            <span className="relative h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          <span className="font-stamp text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-paper sm:text-[10px] sm:tracking-[0.16em]">
            PM
          </span>
        </span>

        {/* Tear line */}
        <span
          aria-hidden
          className="w-0 shrink-0 self-stretch border-l border-dashed border-ink/30"
        />

        {/* Body */}
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-r-[5px] px-3 py-2 sm:px-3.5 sm:py-2.5">
          <span className="font-stamp text-[8px] font-bold uppercase leading-none tracking-[0.18em] text-orange sm:text-[9px]">
            Exam lane
          </span>
          <span className="font-body text-[12px] font-semibold leading-tight tracking-[-0.015em] text-ink sm:text-[13px]">
            Project Management{" "}
            <span className="text-ink/35" aria-hidden>
              ·
            </span>{" "}
            Exam Revision
          </span>
        </span>
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
