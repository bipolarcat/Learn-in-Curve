"use client";

import { type CSSProperties, type ReactNode } from "react";
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

/**
 * “curve.” — Soft-blur letter land, then a hand-drawn orange path strokes
 * under the word (the brand literally drawing its own curve). A quiet
 * afterglow settles so it keeps breathing without shouting.
 */
function CurveAccent({ delay = 0 }: { delay?: number }) {
  const reduce = useReducedMotion();
  const letters = Array.from("curve");

  if (reduce) {
    return (
      <span className="relative inline-block text-orange">
        curve
        <span className="absolute inset-x-0 -bottom-[0.12em] h-[0.12em] rounded-full bg-orange/70" />
        .
      </span>
    );
  }

  return (
    <span className="relative inline-block text-orange">
      <span className="relative z-[1] inline-flex" aria-hidden>
        {letters.map((char, i) => (
          <motion.span
            key={char + i}
            className="inline-block"
            initial={{ opacity: 0, y: 18, filter: "blur(14px)", scale: 0.94 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{
              duration: 0.78,
              delay: delay + i * 0.045,
              ease: EASE,
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>

      {/* Hand-drawn curve underline — strokes after letters land */}
      <motion.svg
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.18em] left-[-2%] w-[104%] overflow-visible"
        viewBox="0 0 120 14"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.35, duration: 0.2 }}
      >
        <motion.path
          d="M3.5 9.2 C 22 2.4, 38 12.6, 58 7.1 S 96 1.8, 116.5 8.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            delay: delay + 0.42,
            duration: 0.95,
            ease: EASE,
          }}
        />
      </motion.svg>

      {/* Soft afterglow pulse — one settle, then idle breath */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-[-6%] -bottom-[0.28em] h-[0.55em] rounded-full"
        style={
          {
            background:
              "radial-gradient(ellipse at center, rgb(var(--orange-rgb) / 0.28), transparent 70%)",
          } as CSSProperties
        }
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{
          opacity: [0, 0.85, 0.35, 0.55],
          scaleX: [0.6, 1.05, 1, 1],
        }}
        transition={{
          delay: delay + 1.15,
          duration: 2.4,
          ease: EASE,
          times: [0, 0.35, 0.7, 1],
        }}
      />

      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.55, duration: 0.35 }}
      >
        .
      </motion.span>
    </span>
  );
}

function Headline() {
  const reduce = useReducedMotion();
  // Word timings — “curve.” is its own accent, not in the word loop.
  const lead = "PFQ or PMQ. Wherever you are on the";
  const leadWords = lead.split(" ");
  const leadStagger = 0.06;
  const leadStart = 0.55;
  const curveDelay = leadStart + leadWords.length * leadStagger + 0.08;

  return (
    <h1
      id="home-brand-hero-title"
      className="mb-3 max-w-[22ch] text-balance font-display text-[clamp(2.05rem,5.2vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:mb-4 sm:max-w-none"
      aria-label={HEADLINE}
    >
      <span aria-hidden className="inline">
        {leadWords.map((word, i) => (
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
        <CurveAccent delay={curveDelay} />
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
 * Home brand hero — eyebrow above animals, restaged PFQ/PMQ copy, orchestrated
 * blur-stagger + custom “curve” draw. `HeroAnimalsScene` is mounted as-is.
 */
export function HomeBrandHero() {
  return (
    <section
      id="home-brand-hero"
      aria-labelledby="home-brand-hero-title"
      className="hero relative overflow-x-clip pb-4 pt-4 sm:pb-5 sm:pt-6 lg:pb-6 lg:pt-8"
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
