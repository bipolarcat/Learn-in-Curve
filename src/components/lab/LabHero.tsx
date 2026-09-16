"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { LabBackgroundPaths } from "@/components/lab/LabBackgroundPaths";
import { ExploreCoursesLink } from "@/components/ExploreCoursesLink";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import {
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";
import { BouncingText } from "@/components/ui/bouncing-text";

/** Apple / 21st Soft Blur In ease. */
const EASE = [0.22, 1, 0.36, 1] as const;

const TITLE = "Project management exam revision";
const SUBHEAD = "PFQ or PMQ. Wherever you are on the curve.";
const SUBCOPY =
  "Stop rereading. Start revising with 1,000+ practice questions and full mock exams for both APM qualifications.";

const wordVariants: Variants = {
  hidden: { opacity: 1, y: 10 },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      delay: custom,
      ease: EASE,
    },
  }),
};

const staticWord = { opacity: 1, y: 0 };

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
        fromY={-48}
      >
        curve
      </BouncingText>
      .
    </span>
  );
}

/**
 * Option C — category line is the H1 (Fraunces, full emphasis).
 * PFQ/PMQ demoted to a supporting subhead so the exam-revision message leads.
 */
function LeadTitle() {
  const reduce = useReducedMotion();
  const line1 = ["Project", "management"];
  const line2 = ["exam", "revision"];
  const leadStagger = 0.055;
  const leadStart = 0.12;

  const renderWords = (words: string[], indexOffset: number) =>
    words.map((word, i) => (
      <motion.span
        key={`${word}-${indexOffset + i}`}
        className="inline-block"
        custom={leadStart + (indexOffset + i) * leadStagger}
        variants={wordVariants}
        initial={reduce ? false : "hidden"}
        animate={reduce ? staticWord : "show"}
        style={{ whiteSpace: "pre" }}
      >
        {word}
        {"\u00A0"}
      </motion.span>
    ));

  return (
    <h1
      id="lab-hero-title"
      className="mb-3 overflow-visible text-balance font-display text-[clamp(2.35rem,6.2vw,4.1rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:mb-3.5"
      aria-label={TITLE}
    >
      <span aria-hidden className="inline overflow-visible">
        {renderWords(line1, 0)}
        <br />
        {renderWords(line2, line1.length)}
      </span>
    </h1>
  );
}

function Subhead() {
  const reduce = useReducedMotion();
  const words = ["PFQ", "or", "PMQ.", "Wherever", "you", "are", "on", "the"];
  const leadStart = 0.48;
  const leadStagger = 0.04;

  return (
    <p
      className="mb-5 max-w-[28rem] text-balance font-display text-[clamp(1.15rem,2.6vw,1.45rem)] font-medium leading-[1.25] tracking-[-0.02em] text-ink/70 sm:mb-6"
      aria-label={SUBHEAD}
    >
      <span aria-hidden>
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block"
            custom={leadStart + i * leadStagger}
            variants={wordVariants}
            initial={reduce ? false : "hidden"}
            animate={reduce ? staticWord : "show"}
            style={{ whiteSpace: "pre" }}
          >
            {word}
            {"\u00A0"}
          </motion.span>
        ))}
        <CurveAccent />
      </span>
    </p>
  );
}

/**
 * Lab hero — 21st background-paths motion + LIC type and CTAs.
 * Cream dotted body shows through; live homepage untouched.
 */
export function LabHero() {
  return (
    <section
      id="lab-hero"
      aria-labelledby="lab-hero-title"
      className="relative flex min-h-[min(78vh,44rem)] items-center overflow-x-clip overflow-y-visible py-10 sm:py-14 lg:py-16"
    >
      <LabBackgroundPaths />

      <div className="wrap relative z-[1] w-full">
        <div className="mx-auto flex w-full max-w-[min(100%,40rem)] flex-col items-center text-center xl:max-w-[46rem]">
          <LeadTitle />
          <Subhead />

          <p className="mx-auto mb-8 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:mb-9 sm:text-[18px]">
            {SUBCOPY}
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <FreeMockExamLink
              className={stampCtaTealFlat}
              from="home"
              location="lab-hero"
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
