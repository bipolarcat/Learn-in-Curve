"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CtaArrow } from "@/components/stamp-chip";
import { productActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import {
  PFQ_PRACTICE_HREF,
  PFQ_TRAP_SCHOOL_HREF,
} from "@/lib/pfq/constants";
import {
  listPfqMockSetSummaries,
  type PfqMockSetSummary,
} from "@/lib/pfq/actions";
import { PFQ_MOCK_SETS, type PfqMockSet } from "@/lib/pfq/generator";
import {
  emptyPfqMockSummary,
  formatExamClock,
  pfqMockConsoleSecondsRemaining,
  pfqMockSelectorState,
} from "@/lib/pfq/mock-console";
import {
  PFQ_DURATION_SECONDS,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";
import styles from "@/components/pmq/PmqMockExamsSection.module.css";

const rowActionClass = `${productActionPrimary} ${styles.rowActionBtn} group shrink-0 !min-h-7 !rounded-none !px-1.5 !gap-1 !text-[11px] !font-[550] !tracking-[-0.012em] !bg-transparent !text-ink/50 !border-0 hover:!bg-transparent hover:!text-ink/70 disabled:cursor-wait disabled:opacity-70`;

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
  }, [now == null, summary.activeAttemptId, summary.endsAt]);

  if (now == null) return null;
  const seconds = pfqMockConsoleSecondsRemaining(summary, now);
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

/**
 * Three-paper Surpass-alike mock console — PMQ overview parity for status,
 * live timer while in progress, and Start / Resume / View result actions.
 */
export function PfqMockConsole() {
  const router = useRouter();
  const [pendingSet, setPendingSet] = useState<PfqMockSet | "aux" | null>(null);
  const [pending, startTransition] = useTransition();
  const [summaries, setSummaries] = useState<PfqMockSetSummary[]>(() =>
    PFQ_MOCK_SETS.map(emptyPfqMockSummary),
  );
  const minutes = Math.round(PFQ_DURATION_SECONDS / 60);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listPfqMockSetSummaries();
      if (cancelled || !result.ok) return;
      setSummaries(result.summaries);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeOtherSet = useMemo(() => {
    const active = summaries.find((s) => s.activeAttemptId);
    return active?.mockSet ?? null;
  }, [summaries]);

  function openPath(path: string, key: PfqMockSet | "aux") {
    setPendingSet(key);
    startTransition(() => {
      router.push(path);
    });
  }

  return (
    <section aria-labelledby="pfq-mock-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pfq-mock-heading" className={styles.title}>
            Mock <span className={styles.titleAccent}>exams</span>
          </h2>
          <p className={styles.subtitle}>
            {PFQ_QUESTION_COUNT} questions · {minutes} minutes · pass{" "}
            {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT} · three papers
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
            const state = pfqMockSelectorState(summary, activeOtherSet);
            const rowPending = pending && pendingSet === summary.mockSet;
            return (
              <li key={summary.mockSet} className={styles.row}>
                <div className={styles.rowMain}>
                  <p className={styles.rowTitle}>
                    Mock exam {summary.mockSet}
                    {state.status ? (
                      <span
                        className={`${styles.rowStatus} ${
                          state.tone === "done"
                            ? styles.rowStatusDone
                            : state.tone === "open"
                              ? styles.rowStatusOpen
                              : ""
                        }`}
                      >
                        {state.status}
                        <PfqMockConsoleTimer summary={summary} />
                      </span>
                    ) : null}
                  </p>
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
                        className="text-ink/50"
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
          <li className={styles.row}>
            <div className={styles.rowMain}>
              <div className="min-w-0 flex-1">
                <p className={styles.rowTitle}>Practise by objective</p>
                <p className="m-0 mt-0.5 text-[12px] font-medium leading-snug tracking-tight text-ink/50 text-pretty">
                  Untimed drills that feed the same coverage map as the mock.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={pending}
              className={rowActionClass}
              onClick={() => openPath(PFQ_PRACTICE_HREF, "aux")}
            >
              Practise
              <CtaArrow className="!h-2.5 !w-2.5" />
            </button>
          </li>
          <li className={styles.row}>
            <div className={styles.rowMain}>
              <div className="min-w-0 flex-1">
                <p className={styles.rowTitle}>Trap School</p>
                <p className="m-0 mt-0.5 text-[12px] font-medium leading-snug tracking-tight text-ink/50 text-pretty">
                  Negative stems, near-misses, multi-selects. Format traps that
                  cost marks even when you know the syllabus.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={pending}
              className={rowActionClass}
              onClick={() => openPath(PFQ_TRAP_SCHOOL_HREF, "aux")}
            >
              Open
              <CtaArrow className="!h-2.5 !w-2.5" />
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}
