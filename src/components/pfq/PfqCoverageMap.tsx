"use client";

import styles from "@/components/pfq/PfqCoverageMap.module.css";
import type { PfqCoverageOutcome, PfqObjectiveResult } from "@/lib/pfq/types";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";

type Props = {
  headlineCorrect: number;
  outcomeCount: number;
  coverage: PfqCoverageOutcome[];
  objectives: PfqObjectiveResult[];
  /** Compact preview for landing (static empty/demo chips). */
  preview?: boolean;
  /**
   * Combined practice + mock (+ future lessons) map.
   * When true, subcopy explains most-recent-wins across artefacts.
   */
  combined?: boolean;
};

export function PfqCoverageMap({
  headlineCorrect,
  outcomeCount,
  coverage,
  objectives,
  preview = false,
  combined = false,
}: Props) {
  return (
    <div className={styles.wrap}>
      <p className={styles.headline}>
        You can currently answer{" "}
        <span className={styles.headlineNum}>{headlineCorrect}</span> of{" "}
        {outcomeCount} learning outcomes.
      </p>
      {!preview ? (
        <p className={styles.sub}>
          {combined
            ? "One chip per syllabus outcome. Colour is your most recent answer across practice and mocks — not a percentage."
            : "One chip per syllabus outcome. Colour shows this sitting — not a percentage."}
        </p>
      ) : (
        <p className={styles.sub}>
          The real PFQ assesses all 59 outcomes. This map is how you see what
          is still costing you marks.
        </p>
      )}

      <div className={styles.objectiveBars}>
        {objectives.map((obj) => {
          const pct =
            obj.available > 0
              ? Math.round((obj.scored / obj.available) * 100)
              : 0;
          const syllabus = PFQ_OBJECTIVES.find(
            (o) => o.objective === obj.objective,
          );
          return (
            <div key={obj.objective} className={styles.barRow}>
              <div className={styles.barMeta}>
                <span className={styles.barLabel}>
                  LO{obj.objective}
                  <span className={styles.barTitle}>{obj.title}</span>
                </span>
                <span className={styles.barScore}>
                  {obj.scored}/{obj.available}
                  {syllabus ? (
                    <span className={styles.barWeight}>
                      {" "}
                      · {syllabus.marks} marks on the real paper
                    </span>
                  ) : null}
                </span>
              </div>
              <div
                className={styles.barTrack}
                role="meter"
                aria-valuenow={obj.scored}
                aria-valuemin={0}
                aria-valuemax={obj.available}
                aria-label={`LO${obj.objective} ${obj.scored} of ${obj.available}`}
              >
                <div
                  className={styles.barFill}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {PFQ_OBJECTIVES.map((obj) => {
        const chips = coverage.filter((c) => c.objective === obj.objective);
        return (
          <section key={obj.objective} className={styles.group}>
            <h3 className={styles.groupTitle}>
              LO{obj.objective} · {obj.title}
              <span className={styles.groupDay}>Day {obj.day}</span>
            </h3>
            <ul className={styles.chipGrid}>
              {chips.map((chip) => (
                <li
                  key={chip.code}
                  className={`${styles.chip} ${styles[`chip_${chip.state}`]}`}
                  title={chip.title}
                >
                  <span className={styles.chipCode}>{chip.code}</span>
                  <span className={styles.chipTitle}>{chip.title}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
