"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { PmqStartLink } from "@/components/PmqStartLink";
import { PfqStartLink } from "@/components/pfq/PfqStartLink";
import { SlyShowcase } from "@/components/SlyShowcase";
import {
  CtaArrow,
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";

const EASE = [0.22, 1, 0.36, 1] as const;

const CTA_PRIMARY =
  `${stampCtaTealFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;
const CTA_SECONDARY =
  `${stampCtaSecondaryFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;
const CHOOSER_CHIP =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-ink/20 bg-paper px-4 font-body text-[13px] font-semibold tracking-[-0.01em] text-ink transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-out-quint)] hover:border-ink/35 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 active:scale-[0.97] sm:min-h-9 sm:text-[14px]";

type ChooserIntent = "mock" | "course" | null;

type LabSlySectionProps = {
  isSignedIn: boolean;
};

/**
 * Sly demo + exit CTAs so the lab landing doesn’t dead-end after the tutor taster.
 */
export function LabSlySection({ isSignedIn }: LabSlySectionProps) {
  const [intent, setIntent] = useState<ChooserIntent>(null);
  const chooserId = useId();
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <SlyShowcase isSignedIn={isSignedIn} />

      <section
        aria-label="Continue after trying Sly"
        className="relative -mt-4 overflow-x-clip pb-[clamp(2.5rem,6vw,4rem)] sm:-mt-6"
      >
        <div className="wrap relative z-[1]">
          <div className="mx-auto flex max-w-[40rem] flex-col items-center gap-3 text-center">
            <p className="font-body text-[14px] leading-snug text-ink/60 sm:text-[15px]">
              Ready to revise for real? Take a free mock or start the free
              course.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <button
                type="button"
                className={CTA_PRIMARY}
                aria-expanded={intent === "mock"}
                aria-controls={chooserId}
                onClick={() =>
                  setIntent((v) => (v === "mock" ? null : "mock"))
                }
              >
                <span className="relative z-[1] inline-flex items-center gap-1.5">
                  Take free mock
                  <CtaArrow />
                </span>
              </button>
              <button
                type="button"
                className={CTA_SECONDARY}
                aria-expanded={intent === "course"}
                aria-controls={chooserId}
                onClick={() =>
                  setIntent((v) => (v === "course" ? null : "course"))
                }
              >
                <span className="relative z-[1] inline-flex items-center gap-1.5">
                  Start free course
                  <CtaArrow />
                </span>
              </button>
            </div>

            {intent ? (
              <motion.div
                id={chooserId}
                role="group"
                aria-label={
                  intent === "mock"
                    ? "Choose exam for free mock"
                    : "Choose exam for free course"
                }
                className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-paper/80 px-3 py-2.5 shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.04)]"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {intent === "mock" ? (
                  <>
                    <FreeMockExamLink
                      className={CHOOSER_CHIP}
                      from="home"
                      location="lab-sly-mock"
                      href="/free-mock-exam/apm-pmq"
                      label="APM PMQ"
                      analyticsLabel="Free PMQ mock"
                    />
                    <FreeMockExamLink
                      className={CHOOSER_CHIP}
                      from="home"
                      location="lab-sly-mock"
                      href="/free-mock-exam/apm-pfq"
                      label="APM PFQ"
                      analyticsLabel="Free PFQ mock"
                    />
                  </>
                ) : (
                  <>
                    <PmqStartLink
                      isSignedIn={isSignedIn}
                      className={CHOOSER_CHIP}
                      from="home"
                      showArrow={false}
                      analyticsLocation="lab-sly-course"
                      analyticsVariant="Start PMQ course"
                    >
                      APM PMQ
                    </PmqStartLink>
                    <PfqStartLink
                      isSignedIn={isSignedIn}
                      className={CHOOSER_CHIP}
                      from="home"
                      showArrow={false}
                      analyticsLocation="lab-sly-course"
                      analyticsVariant="Start PFQ course"
                    >
                      APM PFQ
                    </PfqStartLink>
                  </>
                )}
              </motion.div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
