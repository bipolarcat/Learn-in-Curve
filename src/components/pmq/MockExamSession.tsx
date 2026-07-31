"use client";

import { useCallback, useState } from "react";
import { DemoBanner } from "@/components/pmq/DemoBanner";
import { MockExamRunner } from "@/components/pmq/MockExamRunner";
import { PmqCourseHeader } from "@/components/pmq/PmqCourseHeader";
import { formatExamClock } from "@/lib/pmq/mock-domain";
import type {
  ExamSession,
  MockAttempt,
  MockExamConfig,
  MockExamSet,
  MockExamTier,
  PublicMockQuestion,
} from "@/types/pmq";

type MockExamSessionProps = {
  courseName: string;
  examSet: MockExamSet;
  isSignedIn: boolean;
  tier: MockExamTier;
  mockConfig: MockExamConfig;
  questions: PublicMockQuestion[];
  activeSession: ExamSession | null;
  initialAttempts: MockAttempt[];
  initialFlags: string[];
  isDemo: boolean;
};

/**
 * Client shell so overall exam time + current part live in the course sub-header.
 */
export function MockExamSession({
  courseName,
  examSet,
  isSignedIn,
  tier,
  mockConfig,
  questions,
  activeSession,
  initialAttempts,
  initialFlags,
  isDemo,
}: MockExamSessionProps) {
  const [overallSeconds, setOverallSeconds] = useState<number | null>(null);
  const [examPart, setExamPart] = useState<1 | 2 | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  const onTimerMeta = useCallback(
    (meta: {
      phase: string;
      overallRemaining: number;
      currentPart: 1 | 2;
    }) => {
      const live = meta.phase === "exam";
      setTimerActive(live);
      setOverallSeconds(live ? meta.overallRemaining : null);
      setExamPart(live ? meta.currentPart : null);
    },
    [],
  );

  const urgent = overallSeconds != null && overallSeconds <= 5 * 60;

  return (
    <>
      <DemoBanner isSignedIn={isSignedIn} />
      <PmqCourseHeader
        courseName={courseName}
        breadcrumb={[{ label: `Mock Exam ${examSet}` }]}
        showProgress={false}
        trailing={
          timerActive && overallSeconds != null && examPart != null ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <span className="text-[11px] font-semibold tracking-tight text-ink/55">
                Part {examPart}
              </span>
              <span
                className={`inline-flex h-6 items-center rounded-[0.375rem] bg-orange/[0.14] px-1.5 text-[11px] font-semibold tabular-nums tracking-tight text-orange ${
                  urgent ? "bg-rust/15 text-rust" : ""
                }`}
                aria-label={`Overall time remaining ${formatExamClock(overallSeconds)}`}
              >
                {formatExamClock(overallSeconds)}
              </span>
            </div>
          ) : null
        }
      />
      <main className="flex justify-center px-3 pb-24 pt-1.5 sm:px-5 sm:pt-2">
        <div className="w-full max-w-wrap">
          <MockExamRunner
            tier={tier}
            examSet={examSet}
            mockConfig={mockConfig}
            questions={questions}
            activeSession={activeSession}
            initialAttempts={initialAttempts}
            initialFlags={initialFlags}
            isDemo={isDemo}
            onTimerMeta={onTimerMeta}
          />
        </div>
      </main>
    </>
  );
}
