"use client";

import { useState } from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { LabBackgroundPaths } from "@/components/lab/LabBackgroundPaths";
import { HeroAnimalsScene } from "@/components/HeroAnimalsScene";
import {
  LabExamPicker,
  type LabExamPickerIntent,
} from "@/components/lab/LabExamPicker";
import {
  CtaArrow,
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";

/** Apple / 21st Soft Blur In ease. */
const EASE = [0.22, 1, 0.36, 1] as const;

const CTA_PRIMARY =
  `${stampCtaTealFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;
const CTA_SECONDARY =
  `${stampCtaSecondaryFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;

type LabHeroProps = {
  isSignedIn: boolean;
};

function CategoryStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      className="text-center font-body text-[13px] font-bold leading-snug tracking-[0.12em] text-teal sm:text-[17px] sm:tracking-[0.1em]"
      initial={reduce ? false : { y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
    >
      Exam in eight weeks or less
    </motion.p>
  );
}

function CurveAccent() {
  return <span className="text-orange">curve.</span>;
}

function Headline() {
  return (
    <h1
      id="lab-hero-title"
      className="mb-4 font-display font-semibold tracking-[-0.03em] text-ink sm:mb-5 grid grid-cols-1 justify-items-center gap-y-2 text-[2.75rem] leading-none lg:block lg:text-[clamp(2.05rem,5.2vw,3.65rem)] lg:leading-[1.08] lg:tracking-[-0.03em]"
    >
      <span className="whitespace-nowrap">PFQ or PMQ.</span>
      <br className="hidden lg:inline" />
      <span className="whitespace-nowrap">
        Pass on the
        <span className="hidden lg:inline"> </span>
      </span>
      <span className="whitespace-nowrap">
        <CurveAccent />
      </span>
    </h1>
  );
}

/**
 * Lab landing hero — urgency ICP, 100+ trust, dual CTAs opening iOS exam sheet.
 */
export function LabHero({ isSignedIn }: LabHeroProps) {
  const [picker, setPicker] = useState<LabExamPickerIntent | null>(null);

  return (
    <section
      id="lab-hero"
      aria-labelledby="lab-hero-title"
      className="relative flex min-h-[min(68vh,40rem)] items-start overflow-x-clip overflow-y-visible pb-10 pt-2 sm:pb-14 sm:pt-3 lg:pb-16 lg:pt-4"
    >
      <LabBackgroundPaths />

      <div className="wrap relative z-[1] w-full">
        <div className="mx-auto flex w-full max-w-[min(100%,40rem)] flex-col items-center text-center xl:max-w-[46rem]">
          <div className="relative -mt-0.5 mb-6 w-full sm:mb-10 [&_[data-hero-animals]]:!mb-0">
            <HeroAnimalsScene />
          </div>

          <div className="flex w-full flex-col items-center gap-1 sm:gap-0">
            <CategoryStamp />
            <Headline />
          </div>

          <p className="mx-auto mb-4 max-w-[36rem] text-pretty font-body text-[16px] leading-relaxed text-ink/80 sm:mb-5 sm:text-[18px]">
            Stop re-reading. Take a free mock, find your weak spots, then start
            the free course — built for PMs sitting the APM PFQ or PMQ soon.
          </p>

          <p
            className="mb-7 font-body text-[13px] font-semibold tracking-tight text-ink/55 sm:mb-8 sm:text-[14px]"
            data-lab-trust
          >
            Trusted by 100+ learners
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              className={CTA_PRIMARY}
              aria-haspopup="dialog"
              aria-expanded={picker === "mock"}
              onClick={() => setPicker("mock")}
            >
              <span className="relative z-[1] inline-flex items-center gap-1.5">
                Take free mock
                <CtaArrow />
              </span>
            </button>
            <button
              type="button"
              className={CTA_SECONDARY}
              aria-haspopup="dialog"
              aria-expanded={picker === "course"}
              onClick={() => setPicker("course")}
            >
              <span className="relative z-[1] inline-flex items-center gap-1.5">
                Start free course
                <CtaArrow />
              </span>
            </button>
          </div>
        </div>
      </div>

      <LabExamPicker
        open={picker !== null}
        intent={picker ?? "course"}
        onClose={() => setPicker(null)}
        isSignedIn={isSignedIn}
        analyticsLocation="lab-hero"
      />
    </section>
  );
}
