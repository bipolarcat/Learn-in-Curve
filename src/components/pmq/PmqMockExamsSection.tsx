"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { CtaArrow } from "@/components/stamp-chip";
import { productActionPrimary } from "@/components/ui/semantic";
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

const rowActionClass = `${productActionPrimary} ${styles.rowActionBtn} group shrink-0 !min-h-7 !rounded-none !px-1.5 !gap-1 !text-[11px] !font-[550] !tracking-[-0.012em] !bg-transparent !text-ink/50 !border-0 hover:!bg-transparent hover:!text-ink/70 disabled:opacity-70`;

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
      <span className={styles.rowTimer} aria-label={`Time remaining ${label}`}>
        {label}
      </span>
    </>
  );
}

export function MockExamRowStatus({
  status,
  tone,
  children,
}: {
  status: string;
  tone: "done" | "open" | "plain";
  children?: React.ReactNode;
}) {
  const referAt = status.endsWith("Refer") ? status.lastIndexOf("Refer") : -1;
  const body =
    status === "Passed" ? (
      <span className={styles.rowStatusPass}>{status}</span>
    ) : referAt >= 0 ? (
      <>
        {status.slice(0, referAt)}
        <span className={styles.rowStatusRefer}>Refer</span>
      </>
    ) : (
      status
    );

  return (
    <span
      className={`${styles.rowStatus} ${
        tone === "open" ? styles.rowStatusOpen : ""
      }`}
    >
      {body}
      {children}
    </span>
  );
}

/**
 * Exam 1 free (LIC-39). Exams 2–3 Pro, exam 4 AI Pro (LIC-40 / LIC-98).
 * Flat console paired with the 5-day plan — PFQ-parity Start / Resume / View result.
 */
export function PmqMockExamsSection({
  userTier,
  summaries,
}: PmqMockExamsSectionProps) {
  const router = useRouter();
  const [pendingExam, setPendingExam] = useState<MockExamSet | null>(null);
  const [pending, startTransition] = useTransition();

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

  function openExam(examSet: MockExamSet) {
    const tier = tierForExamSet(examSet);
    setPendingExam(examSet);
    startTransition(() => {
      router.push(pmqMockHref(tier, examSet));
    });
  }

  return (
    <section aria-labelledby="pmq-mocks-heading">
      <div className={styles.panel} data-mock-exams="">
        <div className={styles.titleBar}>
          <h2 id="pmq-mocks-heading" className={styles.title}>
            Mock <span className={styles.titleAccent}>exams</span>
          </h2>
          <p className={styles.subtitle} aria-label="Exam format">
            40 questions · 90 marks · pass mark varies by paper
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
            const rowPending = pending && pendingExam === examSet;

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
                          <span className={styles.lockProMark}>Pro</span> Bundle
                        </>
                      )}
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={examSet} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className="min-w-0 flex-1">
                    <p className={styles.rowTitle}>Mock exam {examSet}</p>
                    {state.status ? (
                      <MockExamRowStatus status={state.status} tone={state.tone}>
                        <MockExamConsoleTimer summary={summary} />
                      </MockExamRowStatus>
                    ) : null}
                  </div>
                </div>
                {state.enabled ? (
                  <button
                    type="button"
                    disabled={pending}
                    aria-busy={rowPending}
                    aria-label={`${state.action} mock exam ${examSet}`}
                    className={rowActionClass}
                    onClick={() => openExam(examSet)}
                  >
                    {rowPending ? (
                      <Spinner
                        variant="bars"
                        size={14}
                        className="text-ink"
                        aria-hidden
                      />
                    ) : (
                      <>
                        {state.action}
                        <CtaArrow className="!h-2.5 !w-2.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <span className={styles.rowLock}>{state.action}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
