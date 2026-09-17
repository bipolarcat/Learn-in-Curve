"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";
import { ExploreCoursesLink } from "@/components/ExploreCoursesLink";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import {
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";
import { BouncingText } from "@/components/ui/bouncing-text";

/** Apple / 21st Soft Blur In ease. */
const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE =
  "PFQ or PMQ. Wherever you are on the curve.";
const SUBCOPY =
  "Stop re-reading. Start revising with 1,000+ practice questions and full mock exams for both APM qualifications.";
const EYEBROW = "PROJECT MANAGEMENT EXAM REVISION";

/** Visible by default — motion only shifts position, never gates opacity. */
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

/** Single-line stamp at all sizes — matches desktop; scales down on narrow. */
const eyebrowClassName =
  "whitespace-nowrap font-stamp text-[9px] font-bold uppercase tracking-[0.1em] text-teal sm:text-[12px] sm:tracking-[0.16em]";

/**
 * Brand stamp eyebrow — Space Mono + per-character vertical roll.
 * Always one line (desktop parity); never wrap mid-word on mobile.
 */
function StampEyebrow({
  text,
  delay = 0.35,
}: {
  text: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const chars = Array.from(text);

  if (reduce) {
    return <span className={eyebrowClassName}>{text}</span>;
  }

  return (
    <span
      aria-hidden
      className={`inline-flex flex-nowrap items-center justify-center ${eyebrowClassName}`}
      style={{ perspective: 800 }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          style={{ whiteSpace: "pre" }}
          initial={{ y: 5, rotateX: -18, opacity: 1 }}
          animate={{ y: 0, rotateX: 0, opacity: 1 }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.018,
            ease: EASE,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

/** “curve.” — 21st BouncingText (GSAP SplitText bounce), then a static period. */
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
  const leadStart = 0.55;

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
      id="home-brand-hero-title"
      className="mb-3 overflow-visible text-balance font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:mb-4"
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
 * Home brand hero — animals lead; Space Mono stamp eyebrow sits under the
 * scene. Then PFQ/PMQ lockup + 21st BouncingText on “curve”.
 */
export function HomeBrandHero() {
  return (
    <section
      id="home-brand-hero"
      aria-labelledby="home-brand-hero-title"
      className="hero relative overflow-x-clip overflow-y-visible pb-4 pt-4 sm:pb-5 sm:pt-6 lg:pb-6 lg:pt-8"
    >
      <div className="wrap relative z-[1]">
        <div className="mx-auto flex w-full max-w-[min(100%,52rem)] flex-col items-center text-center xl:max-w-[58rem]">
          <div className="relative w-full">
            <HeroAnimalsScene />
          </div>

          <p
            className="pointer-events-none mx-auto mb-1.5 mt-1.5 w-max max-w-none px-2 sm:mb-2 sm:mt-2"
            aria-label={EYEBROW}
          >
            <StampEyebrow text={EYEBROW} delay={0.15} />
          </p>

          <div className="w-full">
            <Headline />
          </div>

          <p className="mx-auto mb-7 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:mb-8 sm:text-[18px]">
            {SUBCOPY}
          </p>

          <div className="hero-ctas relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <FreeMockExamLink
              className={stampCtaTealFlat}
              from="home"
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
