"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { PmqStartLink } from "@/components/PmqStartLink";
import { stampCtaPrimary } from "@/components/stamp-chip";

type PmqLaunchProofProps = {
  isSignedIn: boolean;
};

const PMQ_LETTERS = ["P", "M", "Q"];

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.09,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

/**
 * Home "PMQ in 5 Days is live" — launch announcement, deliberately statistic-free.
 *
 * No learner count, no question count: a number on a landing page is a specific
 * commercial claim that has to stay provable and current (see `plans.ts`), and
 * this section exists to announce, not to substantiate. Counts live on the
 * pricing card where they are checked by `tests/plan-counts.test.mjs`.
 *
 * 2026-08-01: "PMQ" gets a per-letter entrance (Sim's call) — the only motion
 * in this section now. `prefers-reduced-motion` renders the letters in place,
 * no animation, per the site's non-negotiable reduced-motion rule.
 */
export function PmqLaunchProof({ isSignedIn }: PmqLaunchProofProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="home-pmq-live"
      aria-labelledby="home-pmq-live-title"
      className="relative overflow-x-clip pt-12 pb-[clamp(2rem,4vw,3rem)] sm:pt-[clamp(1.5rem,4vw,2.5rem)]"
    >
      <div className="wrap relative z-[1]">
        <div className="mx-auto flex max-w-[40rem] flex-col items-center text-center">
          <h2
            id="home-pmq-live-title"
            className="m-0 text-balance font-display text-[clamp(1.85rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink"
          >
            <span aria-label="PMQ">
              {reduceMotion
                ? PMQ_LETTERS.join("")
                : PMQ_LETTERS.map((letter, i) => (
                    <motion.span
                      key={letter + i}
                      custom={i}
                      variants={letterVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.8 }}
                      className="inline-block"
                      aria-hidden
                    >
                      {letter}
                    </motion.span>
                  ))}
            </span>{" "}
            in <span className="text-orange">5 Days</span> is live.
          </h2>
          <p className="m-0 mt-4 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/70 sm:text-[17px]">
            The full APM PMQ course is open. Create a free account and start
            revising today.
          </p>
          <div className="mt-8">
            <PmqStartLink
              isSignedIn={isSignedIn}
              from="home"
              className={stampCtaPrimary}
            >
              Start free with APM PMQ
            </PmqStartLink>
          </div>
        </div>
      </div>
    </section>
  );
}
