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

const EYEBROW_LINES = ["PROJECT MANAGEMENT", "EXAM REVISION"] as const;
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

/** Hero stamp lockup — large enough to lead the composition, not a whisper. */
const eyebrowClassName =
  "font-stamp text-[clamp(1.05rem,3.6vw,1.65rem)] font-bold uppercase leading-[1.15] tracking-[0.14em] text-teal sm:tracking-[0.2em]";

function StampEyebrowLine({
  text,
  delay,
}: {
  text: string;
  delay: number;
}) {
  const reduce = useReducedMotion();
  const chars = Array.from(text);

  if (reduce) {
    return <span className={`block ${eyebrowClassName}`}>{text}</span>;
  }

  return (
    <span
      aria-hidden
      className={`inline-flex flex-nowrap items-center justify-center ${eyebrowClassName}`}
      style={{ perspective: 900 }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${text}-${char}-${i}`}
          className="inline-block"
          style={{ whiteSpace: "pre" }}
          initial={{ y: 10, rotateX: -22, opacity: 1 }}
          animate={{ y: 0, rotateX: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.02,
            ease: EASE,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

function StampEyebrow() {
  return (
    <span className="flex flex-col items-center gap-1 sm:gap-1.5">
      {EYEBROW_LINES.map((line, lineIndex) => (
        <StampEyebrowLine
          key={line}
          text={line}
          delay={0.12 + lineIndex * 0.22}
        />
      ))}
    </span>
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
        <div className="mx-auto flex w-full max-w-[min(100%,44rem)] flex-col items-center text-center xl:max-w-[50rem]">
          <p className="mb-5 w-full px-2 sm:mb-7" aria-label={EYEBROW}>
            <StampEyebrow />
          </p>

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
