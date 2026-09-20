"use client";

import { useState } from "react";
import {
  LabExamPicker,
  type LabExamPickerIntent,
} from "@/components/lab/LabExamPicker";
import { SlyShowcase } from "@/components/SlyShowcase";
import {
  CtaArrow,
  stampCtaSecondaryFlat,
  stampCtaTealFlat,
} from "@/components/stamp-chip";

const CTA_PRIMARY =
  `${stampCtaTealFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;
const CTA_SECONDARY =
  `${stampCtaSecondaryFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;

type LabSlySectionProps = {
  isSignedIn: boolean;
};

/**
 * Sly demo + exit CTAs — opens the same iOS exam picker as the hero.
 */
export function LabSlySection({ isSignedIn }: LabSlySectionProps) {
  const [picker, setPicker] = useState<LabExamPickerIntent | null>(null);

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
      </section>

      <LabExamPicker
        open={picker !== null}
        intent={picker ?? "course"}
        onClose={() => setPicker(null)}
        isSignedIn={isSignedIn}
        analyticsLocation="lab-sly"
      />
    </div>
  );
}
