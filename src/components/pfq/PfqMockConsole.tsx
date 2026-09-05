"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CtaArrow } from "@/components/stamp-chip";
import { productActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import {
  PFQ_MOCK_HREF,
  PFQ_PRACTICE_HREF,
  PFQ_TRAP_SCHOOL_HREF,
} from "@/lib/pfq/constants";
import {
  listPfqMockSetSummaries,
  type PfqMockSetSummary,
} from "@/lib/pfq/actions";
import { PFQ_MOCK_SETS, type PfqMockSet } from "@/lib/pfq/generator";
import {
  PFQ_DURATION_SECONDS,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";
import styles from "@/components/pmq/PmqMockExamsSection.module.css";

function emptySummary(mockSet: PfqMockSet): PfqMockSetSummary {
  return {
    mockSet,
    attempted: false,
    lastScore: null,
    lastSubmittedAt: null,
    attemptId: null,
  };
}

function statusLabel(summary: PfqMockSetSummary): string {
  if (
    summary.attempted &&
    typeof summary.lastScore === "number"
  ) {
    return `Last score ${summary.lastScore}/${PFQ_QUESTION_COUNT}`;
  }
  if (summary.attempted) {
    return "Attempted";
  }
  return "Not attempted yet";
}

/**
 * Three-paper Surpass-alike mock console — same chrome as PMQ mock exams panel.
 * Navigates to the runner with `?set=N`; does not start an attempt here.
 */
export function PfqMockConsole() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [summaries, setSummaries] = useState<PfqMockSetSummary[]>(() =>
    PFQ_MOCK_SETS.map(emptySummary),
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

  function openPath(path: string) {
    startTransition(() => {
      router.push(path);
    });
  }

  return (
    <section aria-labelledby="pfq-mock-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pfq-mock-heading" className={styles.title}>
            Sit the <span className={styles.titleAccent}>mock</span>
          </h2>
          <p className={styles.subtitle}>
            {PFQ_QUESTION_COUNT} questions · {minutes} minutes · pass{" "}
            {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT} · three papers
          </p>
        </div>
        <div className={styles.list}>
          {summaries.map((summary) => {
            const status = statusLabel(summary);
            const tone =
              summary.attempted && typeof summary.lastScore === "number"
                ? "done"
                : summary.attempted
                  ? "open"
                  : "plain";
            return (
              <div key={summary.mockSet} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className="min-w-0 flex-1">
                    <p className={styles.rowTitle}>
                      Mock paper {summary.mockSet}
                    </p>
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
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  aria-busy={pending}
                  aria-label={`Start mock paper ${summary.mockSet}`}
                  className={`${productActionPrimary} shrink-0 !min-h-8 !rounded-xl !px-3 !text-[12.5px] !font-semibold !bg-transparent !text-ink !border !border-ink/12 hover:!bg-ink/[0.04] disabled:cursor-wait disabled:opacity-70`}
                  onClick={() =>
                    openPath(`${PFQ_MOCK_HREF}?set=${summary.mockSet}`)
                  }
                >
                  {pending ? (
                    <Spinner
                      variant="bars"
                      size={14}
                      className="text-ink"
                      aria-hidden
                    />
                  ) : (
                    <>
                      Start
                      <CtaArrow />
                    </>
                  )}
                </button>
              </div>
            );
          })}
          <div className={styles.row}>
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
              className={`${productActionPrimary} shrink-0 !min-h-8 !rounded-xl !px-3 !text-[12.5px] !font-semibold !bg-transparent !text-ink !border !border-ink/12 hover:!bg-ink/[0.04] disabled:cursor-wait disabled:opacity-70`}
              onClick={() => openPath(PFQ_PRACTICE_HREF)}
            >
              Practise
              <CtaArrow />
            </button>
          </div>
          <div className={styles.row}>
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
              className={`${productActionPrimary} shrink-0 !min-h-8 !rounded-xl !px-3 !text-[12.5px] !font-semibold !bg-transparent !text-ink !border !border-ink/12 hover:!bg-ink/[0.04] disabled:cursor-wait disabled:opacity-70`}
              onClick={() => openPath(PFQ_TRAP_SCHOOL_HREF)}
            >
              Open
              <CtaArrow />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
