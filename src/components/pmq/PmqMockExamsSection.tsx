"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { pmqMockHref } from "@/lib/pmq/constants";
import {
  formatExamClock,
  mockExamConsoleSecondsRemaining,
  mockExamSelectorState,
  tierForExamSet,
} from "@/lib/pmq/mock-domain";
import { canAccessMockExam, tierForMockExam, type PmqTier } from "@/lib/pmq/tiers";
import type { MockExamSet, MockExamSetSummary } from "@/types/pmq";
import styles from "@/components/pmq/PmqMockExamsSection.module.css";

type PmqMockExamsSectionProps = {
  /**
   * The viewer's tier. Was a single `hasEntitlement` boolean, which could not
   * express "Pro gets papers 2-3 but not 4" — it unlocked all three together.
   */
  userTier: PmqTier;
  summaries: MockExamSetSummary[];
};

/** Product contract: four papers. Exam 1 Starter; 2–3 Pro; 4 AI Pro. */
const EXAM_SETS = [1, 2, 3, 4] as const satisfies readonly MockExamSet[];

function emptySummary(examSet: MockExamSet): MockExamSetSummary {
  return {
    examSet,
    questionCount: examSet === 1 ? 40 : 0,
    totalMarks: examSet === 1 ? 90 : 0,
    ready: examSet === 1,
    activeSessionId: null,
    latestResult: null,
    hasPassed: false,
    latestStatus: null,
    activePartDeadlineAt: null,
    activeBreakEndsAt: null,
    activeCurrentPart: null,
  };
}

function statusTone(status: string): "done" | "open" | "plain" {
  if (status === "Passed" || status.startsWith("Completed")) return "done";
  if (
    status === "In progress" ||
    status === "On break" ||
    status === "Marking" ||
    status === "Self-assessment"
  ) {
    return "open";
  }
  return "plain";
}

function MockExamConsoleTimer({ summary }: { summary: MockExamSetSummary }) {
  // Don't seed with Date.now() — SSR vs client clock skew hydrates mismatched aria/text.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (now == null) return;
    if (mockExamConsoleSecondsRemaining(summary, Date.now()) == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
    // Restart when the active session/deadline identity changes — not on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [
    now == null,
    summary.activeSessionId,
    summary.activePartDeadlineAt,
    summary.activeBreakEndsAt,
    summary.activeCurrentPart,
    summary.latestStatus,
  ]);

  if (now == null) return null;

  const seconds = mockExamConsoleSecondsRemaining(summary, now);
  if (seconds == null) return null;

  const label = formatExamClock(seconds);
  return (
    <>
      {" · "}
      <span
        className={styles.rowTimer}
        aria-label={`Time remaining ${label}`}
      >
        {label}
      </span>
    </>
  );
}

function ExamOpenRow({
  examSet,
  summary,
  status,
  tone,
  actionLabel,
  href,
}: {
  examSet: MockExamSet;
  summary: MockExamSetSummary;
  status: string;
  tone: "done" | "open" | "plain";
  actionLabel: string;
  href: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={
        pending
          ? `Opening Mock exam ${examSet}`
          : `Mock exam ${examSet}: ${actionLabel}`
      }
      className={`${styles.row} ${styles.rowInteractive}`}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      <div className={styles.rowMain}>
        <p className={styles.rowTitle}>Mock exam {examSet}</p>
        <span
          className={`${styles.rowStatus} ${
            tone === "done"
              ? styles.rowStatusDone
              : tone === "open"
                ? styles.rowStatusOpen
                : ""
          }`}
        >
          {status}
          <MockExamConsoleTimer summary={summary} />
        </span>
      </div>
      <div className={styles.rowAction}>
        {pending ? (
          <span className={styles.rowPending} aria-hidden>
            <Spinner variant="bars" size={12} className="text-orange" />
          </span>
        ) : (
          <>
            <span className="sr-only">{actionLabel}</span>
            <span className={styles.rowChevron} aria-hidden>
              →
            </span>
          </>
        )}
      </div>
    </button>
  );
}

/**
 * Exam 1 free (LIC-39). Exams 2–3 Pro, exam 4 AI Pro (LIC-40 / LIC-98).
 * Flat console paired with the 5-day plan — quiet SaaS density, same selector logic.
 */
export function PmqMockExamsSection({
  userTier,
  summaries,
}: PmqMockExamsSectionProps) {
  const exams = useMemo(
    () =>
      EXAM_SETS.map((examSet) => {
        const summary =
          summaries.find((row) => row.examSet === examSet) ??
          emptySummary(examSet);
        // Per-paper, not per-bucket: paper 4 belongs to AI Pro.
        const unlocked = canAccessMockExam(userTier, examSet);
        return { examSet, summary, unlocked };
      }),
    [summaries, userTier],
  );

  const activeProExam =
    exams.find(
      (exam) => exam.examSet !== 1 && exam.summary.activeSessionId,
    )?.examSet ?? null;

  return (
    <section aria-labelledby="pmq-mocks-heading">
      <div className={styles.panel} data-mock-exams="">
        <div className={styles.titleBar}>
          <h2 id="pmq-mocks-heading" className={styles.title}>
            Mock <span className={styles.titleAccent}>exams</span>
          </h2>
          <p className={styles.subtitle} aria-label="Exam format">
            40 questions · 90 marks · Pass 54/90
          </p>
        </div>

        <div className={styles.meta}>
          <p className={styles.notice}>
            One sitting only. Block enough time before you start. Once the timer
            ends, your exam is over.
          </p>
        </div>

        <ul className={styles.list} aria-label="Mock exam papers">
          {exams.map(({ examSet, summary, unlocked }) => {
            const state = mockExamSelectorState(
              summary,
              unlocked,
              examSet === 1 ? null : activeProExam,
            );
            const tone = statusTone(state.status);
            const actionLabel = state.action.replace(/ →$/, "");
            const tier = tierForExamSet(examSet);

            const main = (
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>Mock exam {examSet}</p>
                <span
                  className={`${styles.rowStatus} ${
                    tone === "done"
                      ? styles.rowStatusDone
                      : tone === "open"
                        ? styles.rowStatusOpen
                        : ""
                  }`}
                >
                  {state.status}
                  <MockExamConsoleTimer summary={summary} />
                </span>
              </div>
            );

            if (!unlocked) {
              const needTier = tierForMockExam(examSet);
              const lockLabel =
                needTier === "ai_pro" ? "AI Pro Bundle" : "Pro Bundle";
              return (
                <li
                  key={examSet}
                  className={`${styles.row} ${styles.rowLocked}`}
                  aria-label={`Mock exam ${examSet}, locked — ${lockLabel}`}
                >
                  <div className={styles.rowMain}>
                    <p className={styles.rowTitle}>
                      Mock exam {examSet}
                      <Lock
                        className={styles.rowLockIcon}
                        fill="currentColor"
                        strokeWidth={0}
                        aria-hidden
                      />
                    </p>
                  </div>
                  <div className={styles.rowAction}>
                    <span className={styles.rowLock}>
                      {needTier === "ai_pro" ? (
                        <>
                          <span className={styles.lockAiProMark}>AI Pro</span>{" "}
                          Bundle
                        </>
                      ) : (
                        <>
                          <span className={styles.lockProMark}>Pro</span>{" "}
                          Bundle
                        </>
                      )}
                    </span>
                  </div>
                </li>
              );
            }

            if (!state.enabled) {
              return (
                <li key={examSet} className={styles.row}>
                  {main}
                  <div className={styles.rowAction}>
                    <span className={styles.rowLock}>{actionLabel}</span>
                  </div>
                </li>
              );
            }

            return (
              <li key={examSet}>
                <ExamOpenRow
                  examSet={examSet}
                  summary={summary}
                  status={state.status}
                  tone={tone}
                  actionLabel={actionLabel}
                  href={pmqMockHref(tier, examSet)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
