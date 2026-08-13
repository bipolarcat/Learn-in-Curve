import Link from "next/link";
import { PFQ_LESSONS } from "@/lib/pfq/content";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";
import { pfqObjectiveDisplayTitle } from "@/lib/pfq/outcome-titles";
import styles from "@/components/pfq/PfqLessonMap.module.css";

type Progress = {
  completed: boolean;
  checked: number;
  total: number;
};

type Props = {
  progress: Record<number, Progress>;
};

export function PfqLessonMap({ progress }: Props) {
  const day1 = PFQ_OBJECTIVES.filter((o) => o.day === 1);
  const day2 = PFQ_OBJECTIVES.filter((o) => o.day === 2);
  const day1Marks = day1.reduce((s, o) => s + o.marks, 0);
  const day2Marks = day2.reduce((s, o) => s + o.marks, 0);

  function renderDay(
    label: string,
    marks: number,
    objectives: typeof PFQ_OBJECTIVES,
  ) {
    return (
      <section className={styles.day} aria-labelledby={`day-${label}`}>
        <div className={styles.dayHead}>
          <h2 id={`day-${label}`} className={styles.dayTitle}>
            {label}
          </h2>
          <p className={styles.dayMarks}>{marks} marks on the paper</p>
        </div>
        <ul className={styles.list}>
          {objectives.map((obj) => {
            const lesson = PFQ_LESSONS.find(
              (l) => l.objective_number === obj.objective,
            );
            const prog = progress[obj.objective];
            const title = pfqObjectiveDisplayTitle(obj.objective);
            const outcomeCount =
              lesson?.learning_outcomes.length ?? obj.outcomes.length;
            const weightClass =
              obj.marks >= 8
                ? styles.weightHeavy
                : obj.marks <= 2
                  ? styles.weightLight
                  : styles.weightMid;

            return (
              <li key={obj.objective} className={`${styles.row} ${weightClass}`}>
                <Link
                  href={`/pfq/learn/${obj.objective}`}
                  className={styles.link}
                >
                  <div className={styles.rowMain}>
                    <span className={styles.objCode}>LO{obj.objective}</span>
                    <span className={styles.objTitle}>{title}</span>
                  </div>
                  <div className={styles.rowMeta}>
                    <span className={styles.marks}>
                      <strong>{obj.marks}</strong> mark
                      {obj.marks === 1 ? "" : "s"}
                    </span>
                    <span className={styles.outcomes}>
                      {outcomeCount} outcome{outcomeCount === 1 ? "" : "s"}
                    </span>
                    <span
                      className={
                        prog?.completed ? styles.statusDone : styles.statusTodo
                      }
                    >
                      {prog?.completed
                        ? "Complete"
                        : prog && prog.checked > 0
                          ? `${prog.checked}/${prog.total} checkpoints`
                          : "Not started"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <div className={styles.wrap}>
      {renderDay("Day 1", day1Marks, day1)}
      {renderDay("Day 2", day2Marks, day2)}
    </div>
  );
}
