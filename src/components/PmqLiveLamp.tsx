"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

/**
 * Home PMQ “now live” lamp — Framer Motion whileInView (no GSAP scroll scrub).
 */
export function PmqLiveLamp() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="home-pmq-live"
      aria-labelledby="home-pmq-live-title"
      className="relative overflow-x-clip"
    >
      <LampContainer>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { delay: 0.3, duration: 0.8, ease: "easeInOut" }
          }
          className="flex max-w-[40rem] flex-col items-center text-center"
        >
          <h2
            id="home-pmq-live-title"
            className="m-0 text-balance font-display text-[clamp(1.85rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink"
          >
            PMQ in <span className="text-orange">5 Days</span> is now live.
          </h2>
          <p className="mt-4 m-0 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/70 sm:text-[17px]">
            Whether you&apos;re starting a career in project management, looking
            to upskill, or preparing for your APM PMQ exam, learn the skills and
            confidence to take the next step.
          </p>
        </motion.div>
      </LampContainer>
    </section>
  );
}
