"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Matches body cream + ink dot grid so lamp masks don’t punch solid plates. */
const creamGridClass =
  "bg-cream [background-image:radial-gradient(circle_at_1.25px_1.25px,var(--dot-grid)_1.25px,transparent_0)] [background-size:20px_20px]";

type LampContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const beamEase = { delay: 0.3, duration: 0.8, ease: "easeInOut" as const };

/**
 * Aceternity lamp + Framer Motion whileInView.
 * Mobile: solid line + radial washes (phones drop blur/conic). Desktop keeps conics.
 */
export function LampContainer({ children, className }: LampContainerProps) {
  const reduceMotion = useReducedMotion();
  const t = reduceMotion ? { duration: 0 } : beamEase;

  return (
    <div
      className={cn(
        "relative z-0 flex w-full flex-col items-center overflow-x-clip bg-transparent",
        className,
      )}
    >
      <div className="h-8 w-full shrink-0 sm:h-10" aria-hidden />

      {/*
        Horizon stage — fixed height so the line isn’t lost in a flex-1
        absolute stack on short phone viewports.
      */}
      <div className="relative isolate z-0 h-[11rem] w-full sm:h-[14rem]">
        {/* Always-visible wash — no blur, no conic (phones) */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0.35, scaleX: 0.55 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={t}
          className="pointer-events-none absolute left-1/2 top-0 z-10 h-36 w-[min(30rem,92vw)] origin-top -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse 100% 85% at 50% 0%, rgb(213 80 31 / 0.55) 0%, rgb(213 80 31 / 0.22) 45%, transparent 72%)",
          }}
          aria-hidden
        />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0.25, scaleX: 0.5 }}
          whileInView={{ opacity: 0.9, scaleX: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={t}
          className="pointer-events-none absolute left-1/2 top-0 z-10 h-48 w-[min(100vw,40rem)] origin-top -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse 85% 70% at 50% 0%, rgb(213 80 31 / 0.32) 0%, transparent 68%)",
          }}
          aria-hidden
        />

        {/* Desktop conic beams (hidden on small screens — unreliable on iOS) */}
        <div className="pointer-events-none absolute inset-0 z-0 hidden scale-y-125 sm:block" aria-hidden>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={t}
            className="absolute inset-auto right-1/2 top-0 h-56 overflow-visible"
            style={{
              backgroundImage:
                "conic-gradient(from 70deg at center top, #D5501F, transparent, transparent)",
            }}
          >
            <div
              className={`absolute bottom-0 left-0 z-20 h-40 w-full [mask-image:linear-gradient(to_top,white,transparent)] ${creamGridClass}`}
            />
            <div
              className={`absolute bottom-0 left-0 z-20 h-full w-40 [mask-image:linear-gradient(to_right,white,transparent)] ${creamGridClass}`}
            />
          </motion.div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={t}
            className="absolute inset-auto left-1/2 top-0 h-56"
            style={{
              backgroundImage:
                "conic-gradient(from 290deg at center top, transparent, transparent, #D5501F)",
            }}
          >
            <div
              className={`absolute bottom-0 right-0 z-20 h-full w-40 [mask-image:linear-gradient(to_left,white,transparent)] ${creamGridClass}`}
            />
            <div
              className={`absolute bottom-0 right-0 z-20 h-40 w-full [mask-image:linear-gradient(to_top,white,transparent)] ${creamGridClass}`}
            />
          </motion.div>
          <div className="absolute left-1/2 top-0 z-30 h-28 w-64 -translate-x-1/2 -translate-y-4 rounded-full bg-orange/80 blur-2xl" />
        </div>

        {/* Soft bloom — bonus when the GPU keeps blur */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-20 h-20 w-[min(20rem,70vw)] -translate-x-1/2 -translate-y-2 rounded-full bg-orange/60 blur-xl sm:h-28 sm:blur-2xl"
          aria-hidden
        />

        {/* Horizon line — solid, always on top */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0.5, scaleX: 0.5 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={t}
          className="pointer-events-none absolute left-1/2 top-0 z-50 h-[3px] w-[min(30rem,92vw)] origin-center -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange sm:h-0.5"
          style={{
            boxShadow:
              "0 0 10px rgb(213 80 31 / 0.7), 0 0 24px rgb(213 80 31 / 0.4)",
          }}
          aria-hidden
        />
      </div>

      <div className="relative z-50 -mt-6 flex w-full flex-col items-center px-5 pb-12 sm:-mt-8 sm:pb-14">
        {children}
      </div>
    </div>
  );
}
