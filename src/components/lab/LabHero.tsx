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

/**
 * Category badge — current LIC soft-pill language (hairline border + soft
 * layered shadow), not the old sticker-offset stamp. Hierarchy: quiet label
 * above Fraunces. Cues: SiteHeader / NotifyBand / Contents-pill chrome.
 */
function CategoryStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      aria-label={EYEBROW}
      className="mb-4 sm:mb-5"
      initial={reduce ? false : { y: 10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
    >
      <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-black/[0.08] bg-paper/90 px-3 py-1.5 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:gap-x-2.5 sm:px-3.5 sm:py-1.5 dark:border-white/[0.12]">
        <span className="flex shrink-0 items-center gap-1" aria-hidden>
          <span className="size-1 rounded-full bg-teal/80" />
          <span className="size-1 rounded-full bg-teal/40" />
        </span>
        <span className="text-center font-body text-[11px] font-semibold uppercase leading-snug tracking-[0.08em] text-ink/55 sm:text-[12px] sm:tracking-[0.1em]">
          <span className="whitespace-nowrap">Project management</span>
          <span className="mx-1.5 text-ink/25" aria-hidden>
            ·
          </span>
          <span className="whitespace-nowrap">Exam revision</span>
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
 * Lab hero — 21st background-paths motion + LIC type, stamps, and CTAs.
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
