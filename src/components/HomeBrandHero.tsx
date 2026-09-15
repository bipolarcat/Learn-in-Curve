"use client";

import { type ReactNode } from "react";
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
  "Learn the fundamentals for the APM PFQ, or sharpen the scenario judgement the PMQ demands.";
const EYEBROW = "PROJECT MANAGEMENT EXAM REVISION";

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.72,
      delay: custom,
      ease: EASE,
    },
  }),
};

const staticWord = { opacity: 1, y: 0, filter: "blur(0px)" };

function StaggerWords({
  text,
  delay = 0,
  stagger = 0.055,
  className = "",
  wordClassName = "",
}: {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  wordClassName?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className} aria-hidden={true}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={`inline-block ${wordClassName}`.trim()}
          custom={delay + i * stagger}
          variants={wordVariants}
          initial={reduce ? false : "hidden"}
          animate={reduce ? staticWord : "show"}
          style={{ whiteSpace: "pre" }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
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

function FadeBlock({
  children,
  delay,
  className = "",
}: {
  children: ReactNode;
  delay: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.7, delay, ease: EASE }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Home brand hero — eyebrow above animals, restaged PFQ/PMQ copy, word-stagger
 * blur entrance + 21st BouncingText on “curve”. `HeroAnimalsScene` is untouched.
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
          <p className="mb-3 sm:mb-4" aria-label={EYEBROW}>
            <StaggerWords
              text={EYEBROW}
              delay={0.08}
              stagger={0.04}
              className="font-body text-[11px] font-bold uppercase tracking-[0.16em] text-teal sm:text-[12px] sm:tracking-[0.18em]"
            />
          </p>

          <div className="w-full">
            <HeroAnimalsScene />
          </div>

          <div className="mt-1 w-full sm:mt-2">
            <Headline />
          </div>

          <p
            className="mx-auto mb-7 max-w-[36rem] sm:mb-8"
            aria-label={SUBCOPY}
          >
            <StaggerWords
              text={SUBCOPY}
              delay={1.55}
              stagger={0.028}
              className="text-pretty text-[16px] leading-relaxed text-ink/80 sm:text-[18px]"
            />
          </p>

          <FadeBlock
            delay={2.15}
            className="hero-ctas relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
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
          </FadeBlock>
        </div>
      </div>
    </section>
  );
}
