"use client";

import { useCallback, useState } from "react";
import { CourseHeader } from "@/components/course/CourseHeader";
import { PfqMockRunner } from "@/components/pfq/PfqMockRunner";
import { formatPfqExamClock } from "@/lib/pfq/mock-console";
import { PFQ_LEARN_HREF, PFQ_SLUG } from "@/lib/pfq/constants";
import type { PfqMockSet } from "@/lib/pfq/generator";
import type { PfqTier } from "@/lib/pfq/tiers";

type PfqMockSessionProps = {
  userTier: PfqTier;
  mockSet?: PfqMockSet;
  attemptId?: string;
};

/**
 * Client shell so overall exam time lives in the course sub-header — same
 * pattern as PMQ `MockExamSession`.
 */
export function PfqMockSession({
  userTier,
  mockSet: mockSetProp,
  attemptId,
}: PfqMockSessionProps) {
  const [overallSeconds, setOverallSeconds] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [examSet, setExamSet] = useState<PfqMockSet | undefined>(mockSetProp);

  const onTimerMeta = useCallback(
    (meta: {
      phase: "boot" | "start" | "exam" | "results";
      remaining: number;
      mockSet: PfqMockSet | null;
    }) => {
      const live = meta.phase === "exam";
      setTimerActive(live);
      setOverallSeconds(live ? meta.remaining : null);
      if (meta.mockSet) setExamSet(meta.mockSet);
    },
    [],
  );

  const urgent = overallSeconds != null && overallSeconds <= 5 * 60;
  const crumbLabel = examSet ? `Mock Exam ${examSet}` : "Mock exam";

  return (
    <>
      <CourseHeader
        slug={PFQ_SLUG}
        courseName="PFQ in 2 Days"
        breadcrumb={[{ label: crumbLabel }]}
        showProgress={false}
        userTier={userTier}
        overviewHref={PFQ_LEARN_HREF}
        trailing={
          timerActive && overallSeconds != null ? (
            <span
              className={`inline-flex h-6 items-center rounded-[0.375rem] bg-orange/[0.14] px-1.5 text-[11px] font-semibold tabular-nums tracking-tight text-orange ${
                urgent ? "bg-rust/15 text-rust" : ""
              }`}
              aria-label={`Time remaining ${formatPfqExamClock(overallSeconds)}`}
            >
              {formatPfqExamClock(overallSeconds)}
            </span>
          ) : null
        }
      />
      <div className="flex justify-center px-3 pb-24 pt-1.5 sm:px-5 sm:pt-2">
        <div className="w-full max-w-wrap">
          <PfqMockRunner
            attemptId={attemptId}
            mockSet={mockSetProp}
            onTimerMeta={onTimerMeta}
          />
        </div>
      </div>
    </>
  );
}
