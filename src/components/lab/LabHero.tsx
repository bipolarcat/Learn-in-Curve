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

const EYEBROW = "PROJECT MANAGEMENT EXAM REVISION";
const HEADLINE = "PFQ or PMQ. Wherever you are on the curve.";
const SUBCOPY =
  "Stop re-reading. Start revising with 1,000+ practice questions and full mock exams for both APM qualifications.";

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

/**
 * Open category line — no badge. Quiet ink kicker above the Fraunces H1.
 */
function CategoryStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      aria-label={EYEBROW}
      className="mb-3.5 max-w-[32rem] text-balance text-center font-body text-[18px] font-medium leading-snug tracking-[0.02em] text-ink sm:mb-5 sm:max-w-none sm:text-[22px] sm:tracking-[0.03em]"
      initial={reduce ? false : { y: 8 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
    >
      Project management exam revision
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
  const reduce = useReducedMotion();
  const line1 = ["PFQ", "or", "PMQ."];
  const line2 = ["Wherever", "you", "are", "on", "the"];
  const leadStagger = 0.06;
  const leadStart = 0.45;

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
      className="mb-4 overflow-visible text-balance font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:mb-5"
      aria-label={HEADLINE}
    >
      <span aria-hidden className="inline overflow-visible">
        {renderWords(line1, 0)}
        <br />
        {renderWords(line2, line1.length)}
        <CurveAccent />
      </span>
    </h1>
  );
}

/**
 * Lab hero — 21st background-paths motion + LIC type, badge, and CTAs.
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
          <CategoryStamp />

          <Headline />

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
