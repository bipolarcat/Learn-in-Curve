import styles from "@/components/pfq/PfqTrapSchool.module.css";

const TRAPS = [
  {
    id: "negative_stem",
    title: "Negatively-worded stems",
    body: "About 8% of a real PFQ paper uses not / false / except. Under a one-minute clock these are the easiest marks to throw away. Read the stem twice before you eliminate.",
  },
  {
    id: "multi_select",
    title: "Multi-select combinations",
    body: "About 10% of the paper shows four numbered items and options like “1, 2 and 4”. Partial knowledge scores zero — find the one item you are sure is wrong and strike every option that contains it.",
  },
  {
    id: "near_miss",
    title: "Near-miss definition distractors",
    body: "Adjacent APM terms (risk vs issue, PBS vs WBS, quality control vs assurance) often appear as each other’s distractors. The exam tests discrimination between neighbouring definitions, not comprehension of a case study.",
  },
  {
    id: "guessing",
    title: "No negative marking",
    body: "Unanswered scores 0. APM explicitly advises guessing. Leave no blank cells on the navigator before you submit.",
  },
] as const;

type Props = {
  /** Question ids currently tagged in the bank (from server or static). */
  multiSelectCount?: number;
};

export function PfqTrapSchool({ multiSelectCount = 3 }: Props) {
  return (
    <section id="trap-school" className={styles.wrap}>
      <h2 className={styles.title}>Trap School</h2>
      <p className={styles.lead}>
        Format traps that cost marks on the real Surpass paper — taught before
        you sit another timed mock. The bank currently tags {multiSelectCount}{" "}
        multi-select items for targeted drills as the course grows.
      </p>
      <ul className={styles.grid}>
        {TRAPS.map((trap) => (
          <li key={trap.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{trap.title}</h3>
            <p className={styles.cardBody}>{trap.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
