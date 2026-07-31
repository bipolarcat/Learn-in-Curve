import {
  IconCore,
  IconMemory,
  IconMisconceptions,
  IconMock,
  IconPractice,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import styles from "@/components/PmqLandingProof.module.css";

const DAYS = [1, 2, 3, 4, 5] as const;

const FEATURES = [
  { id: "core", label: "24 LOs", Icon: IconCore },
  { id: "practice", label: "Quizzes", Icon: IconPractice },
  { id: "mock", label: "Mock", Icon: IconMock },
  { id: "myths", label: "Myths", Icon: IconMisconceptions },
  { id: "memory", label: "Memory", Icon: IconMemory },
] as const;

/**
 * Landing PMQ proof — illustrative journey + Starter feature stamps.
 * Paired with HeroPmqMacDemo; no enrol CTA (hero owns that).
 */
export function PmqLandingProof() {
  return (
    <div className={styles.root}>
      <h2 id="home-pmq-proof-title" className={styles.title}>
        PMQ in <span className={styles.titleAccent}>5 Days</span>
      </h2>

      <ol className={styles.path} aria-label="Five-day study path">
        {DAYS.map((day) => (
          <li key={day} className={styles.day}>
            <span className={styles.dayDisc}>
              <span className={styles.dayNum}>{day}</span>
            </span>
            <span className={styles.dayLabel}>Day {day}</span>
          </li>
        ))}
      </ol>

      <ul className={styles.chips} aria-label="What's included free">
        {FEATURES.map(({ id, label, Icon }) => (
          <li key={id} className={styles.chip}>
            <span className={styles.chipTile}>
              <Icon className={styles.chipIcon} />
            </span>
            <span className={styles.chipLabel}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
