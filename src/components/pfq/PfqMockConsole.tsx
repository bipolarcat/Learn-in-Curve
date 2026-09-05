"use client";

import { useTransition } from "react";
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
  PFQ_DURATION_SECONDS,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";
import styles from "@/components/pmq/PmqMockExamsSection.module.css";

/**
 * Single Surpass-alike mock console — same chrome as PMQ mock exams panel.
 */
export function PfqMockConsole() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const minutes = Math.round(PFQ_DURATION_SECONDS / 60);

  return (
    <section aria-labelledby="pfq-mock-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pfq-mock-heading" className={styles.title}>
            Sit the <span className={styles.titleAccent}>mock</span>
          </h2>
          <p className={styles.subtitle}>
            {PFQ_QUESTION_COUNT} questions · {minutes} minutes · pass{" "}
            {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT}
          </p>
        </div>
        <div className={styles.list}>
          <div className={styles.row}>
            <div className={styles.rowMain}>
              <div className="min-w-0 flex-1">
                <p className={styles.rowTitle}>Full PFQ practice paper</p>
                <p className="m-0 mt-0.5 text-[12px] font-medium leading-snug tracking-tight text-ink/50 text-pretty">
                  One question per learning outcome (LO 10.4 twice). Results
                  show a coverage map. No negative marking.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={pending}
              aria-busy={pending}
              className={`${productActionPrimary} shrink-0 !min-h-8 !rounded-xl !px-3 !text-[12.5px] !font-semibold disabled:cursor-wait disabled:opacity-70`}
              onClick={() => {
                startTransition(() => {
                  router.push(PFQ_MOCK_HREF);
                });
              }}
            >
              {pending ? (
                <Spinner
                  variant="bars"
                  size={14}
                  className="text-paper"
                  aria-hidden
                />
              ) : (
                <>
                  Open mock
                  <CtaArrow />
                </>
              )}
            </button>
          </div>
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
              onClick={() => {
                startTransition(() => {
                  router.push(PFQ_PRACTICE_HREF);
                });
              }}
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
                  Negative stems, near-misses, multi-selects — format traps that
                  cost marks even when you know the syllabus.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={pending}
              className={`${productActionPrimary} shrink-0 !min-h-8 !rounded-xl !px-3 !text-[12.5px] !font-semibold !bg-transparent !text-ink !border !border-ink/12 hover:!bg-ink/[0.04] disabled:cursor-wait disabled:opacity-70`}
              onClick={() => {
                startTransition(() => {
                  router.push(PFQ_TRAP_SCHOOL_HREF);
                });
              }}
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
