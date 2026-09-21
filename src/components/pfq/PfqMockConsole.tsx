"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { CtaArrow } from "@/components/stamp-chip";
import { productActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import {
  listPfqMockSetSummaries,
  type PfqMockSetSummary,
} from "@/lib/pfq/actions";
import { PFQ_MOCK_SETS } from "@/lib/pfq/generator";
import {
  emptyPfqMockSummary,
  formatPfqExamClock,
  pfqMockConsoleSecondsRemaining,
  pfqMockSelectorState,
} from "@/lib/pfq/mock-console";
import {
  PFQ_DURATION_SECONDS,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";
import { canAccessPfqMock, type PfqTier } from "@/lib/pfq/tiers";
import { MockExamRowStatus } from "@/components/pmq/PmqMockExamsSection";
import { showProLockHint } from "@/components/pmq/ProLockHint";
import styles from "@/components/pmq/PmqMockExamsSection.module.css";

const rowActionClass = `${productActionPrimary} ${styles.rowActionBtn} group shrink-0 !min-h-7 !rounded-none !px-1.5 !gap-1 !text-[11px] !font-[550] !tracking-[-0.012em] !bg-transparent !text-ink/50 !border-0 hover:!bg-transparent hover:!text-ink/70 disabled:opacity-70`;

function PfqMockConsoleTimer({ summary }: { summary: PfqMockSetSummary }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (now == null) return;
    if (pfqMockConsoleSecondsRemaining(summary, Date.now()) == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
    // Restart when the active sitting/deadline identity changes — not on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [now == null, summary.activeAttemptId, summary.endsAt]);

  if (now == null) return null;
  const seconds = pfqMockConsoleSecondsRemaining(summary, now);
  if (seconds == null) return null;

  const label = formatPfqExamClock(seconds);
  return (
    <>
      {" · "}
      <span className={styles.rowTimer} aria-label={`Time remaining ${label}`}>
        {label}
      </span>
    </>
  );
}

/**
 * Two-paper mock console — PMQ overview parity: status line, live timer
 * chip while in progress, Start / Resume / View result.
 */
export function PfqMockConsole({
  userTier = "starter",
  summaries: summariesProp,
}: {
  userTier?: PfqTier;
  summaries?: PfqMockSetSummary[];
}) {
  const router = useRouter();
  const [pendingSet, setPendingSet] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [liveSummaries, setLiveSummaries] = useState<PfqMockSetSummary[] | null>(
    null,
  );
  const summaries = useMemo(
    () =>
      liveSummaries ??
      summariesProp ??
      PFQ_MOCK_SETS.map((set) => emptyPfqMockSummary(set)),
    [liveSummaries, summariesProp],
  );
  const minutes = Math.round(PFQ_DURATION_SECONDS / 60);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listPfqMockSetSummaries();
      if (cancelled || !result.ok) return;
      setLiveSummaries(result.summaries);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeOtherSet = useMemo(() => {
    const active = summaries.find((s) => s.activeAttemptId);
    return active?.mockSet ?? null;
  }, [summaries]);

  function openPath(path: string, set: number) {
    setPendingSet(set);
    startTransition(() => {
      router.push(path);
    });
  }

  return (
    <section aria-labelledby="pfq-mock-heading">
      <div className={styles.panel} data-mock-exams="pfq">
        <div className={styles.titleBar}>
          <h2 id="pfq-mock-heading" className={styles.title}>
            Mock <span className={styles.titleAccent}>exams</span>
          </h2>
          <p className={styles.subtitle} aria-label="Exam format">
            {PFQ_QUESTION_COUNT} questions · {minutes} minutes · pass{" "}
            {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT}
          </p>
        </div>
        <div className={styles.meta}>
          <p className={styles.notice}>
            One sitting only. Block enough time before you start. Once the timer
            ends, your exam is over.
          </p>
        </div>
        <ul className={styles.list} aria-label="Mock exam papers">
          {summaries.map((summary) => {
            const unlocked = canAccessPfqMock(userTier);
            if (!unlocked) {
              return (
                <li key={summary.mockSet}>
                  <button
                    type="button"
                    className={`${styles.row} ${styles.rowLocked} cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55`}
                    onClick={() => showProLockHint("mock")}
                    aria-label={`Mock exam ${summary.mockSet}, locked — Pro. Unlock with the Pro bundle.`}
                  >
                    <div className={styles.rowMain}>
                      <p className={styles.rowTitle}>
                        Mock exam {summary.mockSet}
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
                        <span className={styles.lockProMark}>Pro</span> Bundle
                      </span>
                    </div>
                  </button>
                </li>
              );
            }

            const state = pfqMockSelectorState(summary, activeOtherSet);
            const rowPending = pending && pendingSet === summary.mockSet;
            return (
              <li key={summary.mockSet} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className="min-w-0 flex-1">
                    <p className={styles.rowTitle}>
                      Mock exam {summary.mockSet}
                    </p>
                    {state.status ? (
                      <MockExamRowStatus status={state.status} tone={state.tone}>
                        <PfqMockConsoleTimer summary={summary} />
                      </MockExamRowStatus>
                    ) : null}
                  </div>
                </div>
                {state.enabled ? (
                  <button
                    type="button"
                    disabled={pending}
                    aria-busy={rowPending}
                    aria-label={`${state.action} mock exam ${summary.mockSet}`}
                    className={rowActionClass}
                    onClick={() => openPath(state.href, summary.mockSet)}
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
