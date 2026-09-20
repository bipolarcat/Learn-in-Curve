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
 * Sly demo + exit CTAs with the same inline exam dropdown as the hero.
 */
export function LabSlySection({ isSignedIn }: LabSlySectionProps) {
  const [picker, setPicker] = useState<LabExamPickerIntent | null>(null);

  const toggle = (next: LabExamPickerIntent) => {
    setPicker((cur) => (cur === next ? null : next));
  };

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
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  data-lab-exam-cta
                  className={CTA_PRIMARY}
                  aria-expanded={picker === "mock"}
                  aria-haspopup="listbox"
                  onClick={() => toggle("mock")}
                >
                  <span className="relative z-[1] inline-flex items-center gap-1.5">
                    Take free mock
                    <CtaArrow />
                  </span>
                </button>
                <button
                  type="button"
                  data-lab-exam-cta
                  className={CTA_SECONDARY}
                  aria-expanded={picker === "course"}
                  aria-haspopup="listbox"
                  onClick={() => toggle("course")}
                >
                  <span className="relative z-[1] inline-flex items-center gap-1.5">
                    Start free course
                    <CtaArrow />
                  </span>
                </button>
              </div>

              <LabExamPicker
                intent={picker}
                onClose={() => setPicker(null)}
                isSignedIn={isSignedIn}
                analyticsLocation="lab-sly"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
