import { PfqDayPlan } from "@/components/pfq/PfqDayPlan";
import { PfqPlanContinue } from "@/components/pfq/PfqPlanContinue";
import { PfqMockConsole } from "@/components/pfq/PfqMockConsole";
import { PFQ_ATP_DISCLAIMER } from "@/lib/legal-copy";
import { PFQ_OBJECTIVES, PFQ_PASS_MARK, PFQ_QUESTION_COUNT } from "@/lib/pfq/outcomes";
import { PFQ_TRAP_SCHOOL } from "@/lib/pfq/trap-school-content";
import { PFQ_TRAP_SCHOOL_HREF } from "@/lib/pfq/constants";
import Link from "next/link";
import styles from "@/components/pmq/PmqExamGuideSections.module.css";

type PfqOverviewProps = {
  completedObjectives: number[];
  nextObjective: number | null;
  nextStarted: boolean;
  stageReachedBySectionId: Record<string, number>;
};

function defaultDay(nextObjective: number | null): 1 | 2 {
  if (nextObjective == null) return 1;
  return (
    PFQ_OBJECTIVES.find((o) => o.objective === nextObjective)?.day ?? 1
  );
}

/** Top-weighted objectives for study-time advice (marks on the real paper). */
const WEIGHT_ROWS = [...PFQ_OBJECTIVES]
  .slice()
  .sort((a, b) => b.marks - a.marks)
  .slice(0, 5);

/**
 * Enrolled study overview — same rhythm as `PmqOverview`.
 * Marketing page stays at `/courses/pfq-in-2-days`; this is `/learn`.
 */
export function PfqOverview({
  completedObjectives,
  nextObjective,
  nextStarted,
  stageReachedBySectionId,
}: PfqOverviewProps) {
  const started =
    completedObjectives.length > 0 || nextStarted;

  return (
    <div className="relative z-[1] flex w-full min-w-0 justify-center overflow-x-clip px-3 sm:px-5">
      <div className="grid w-full min-w-0 max-w-wrap grid-cols-1 gap-6 pb-28 pt-4 sm:gap-[2.125rem] sm:pb-24 sm:pt-6">
        <section aria-labelledby="pfq-plan-heading">
          <PfqDayPlan
            mode="linked"
            completedObjectives={completedObjectives}
            defaultExpandedDay={defaultDay(nextObjective)}
            stageReachedBySectionId={stageReachedBySectionId}
            titleAction={
              <PfqPlanContinue
                nextObjective={nextObjective}
                started={started}
              />
            }
          />
        </section>

        <PfqMockConsole />

        <section aria-labelledby="pfq-exam-structure-heading">
          <div className={styles.panel}>
            <div className={styles.titleBar}>
              <h2 id="pfq-exam-structure-heading" className={styles.title}>
                How the <span className={styles.titleAccent}>exam</span> works
              </h2>
            </div>
            <p className={styles.lede}>
              {PFQ_QUESTION_COUNT} questions, 1 mark each, 60 minutes, four
              options. Delivered online in Surpass. Every sitting covers every
              published learning outcome exactly once (LO 10.4 twice) — there is
              no sampling.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                59 outcomes, one question each, plus LO 10.4 twice = exactly 60.
              </li>
              <li className={styles.listItem}>
                Pass mark is fixed at {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT}{" "}
                (60%) for every sitting.
              </li>
              <li className={styles.listItem}>
                No negative marking. Unanswered scores zero; APM advises
                guessing when unsure.
              </li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="pfq-weight-heading">
          <div className={styles.panel}>
            <div className={styles.titleBar}>
              <h2 id="pfq-weight-heading" className={styles.title}>
                Where the <span className={styles.titleAccent}>marks</span> sit
              </h2>
            </div>
            <p className={styles.lede}>
              Study by paper weight, not by card order. LO4 alone is 11 marks;
              LO3 is 1 mark.
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Objective</th>
                    <th scope="col">Marks</th>
                    <th scope="col">Day</th>
                  </tr>
                </thead>
                <tbody>
                  {WEIGHT_ROWS.map((row) => (
                    <tr key={row.objective}>
                      <td>
                        LO{row.objective} · {row.title}
                      </td>
                      <td>{row.marks}</td>
                      <td>Day {row.day}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section aria-labelledby="pfq-traps-heading">
          <div className={styles.panel}>
            <div className={styles.titleBar}>
              <h2 id="pfq-traps-heading" className={styles.title}>
                Format <span className={styles.titleAccent}>traps</span>
              </h2>
            </div>
            <p className={styles.lede}>{PFQ_TRAP_SCHOOL.why.body}</p>
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
              <Link
                href={PFQ_TRAP_SCHOOL_HREF}
                className="inline-flex min-h-8 items-center gap-1 rounded-xl border border-ink/12 bg-transparent px-3 text-[12.5px] font-semibold text-ink/80 no-underline transition-colors duration-150 hover:bg-ink/[0.04]"
              >
                Open Trap School
              </Link>
            </div>
          </div>
        </section>

        <p className="m-0 max-w-3xl border-t border-ink/10 pt-4 font-body text-[12px] leading-relaxed text-ink/55">
          {PFQ_ATP_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
