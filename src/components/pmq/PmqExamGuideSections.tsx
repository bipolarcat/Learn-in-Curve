import styles from "@/components/pmq/PmqExamGuideSections.module.css";

const HOW_EXAM_WORKS = [
  "2.5 hours, taken online in the Surpass platform.",
  "Split into two parts, with an optional break of up to 30 minutes between them.",
  "40 questions, 90 marks total.",
  "Once you submit Part 1 you cannot go back and edit those answers.",
  "You should attempt every question.",
];

const MARKS_BREAKDOWN = [
  { type: "Multiple response", number: 20, marksEach: 1, total: 20 },
  { type: "Select from list", number: 5, marksEach: 2, total: 10 },
  { type: "Short response (typed)", number: 5, marksEach: 2, total: 10 },
  { type: "Long response (typed)", number: 10, marksEach: 5, total: 50 },
];

const SYLLABUS_WEIGHT = [
  {
    area: "A - Setting up for success",
    los: "1–4",
    share: "15–20%",
  },
  {
    area: "B - Preparing for change",
    los: "5–9",
    share: "15–20%",
  },
  {
    area: "C - People and behaviours",
    los: "10–15",
    share: "25–35%",
  },
  {
    area: "D - Planning and managing deployment",
    los: "16–24",
    share: "30–40%",
  },
];

const MARKING_GUIDANCE = [
  "Structure your answer in an order that reflects the instructions in the question.",
  "Disjointed or unclear answers make it hard for a marker to award marks, even when the knowledge is there.",
  "The size of the answer box indicates the expected length.",
  "The text box supports basic formatting: font size, bold, italic, underline, alignment, indent.",
];

const PASS_MARK_NOTES = [
  "The pass mark varies between exam papers, set using a modified Angoff method, to account for differences in difficulty between versions.",
  "Maximum score is 90 marks.",
  "A borderline fail (within 3 marks of the pass mark) is automatically re-marked.",
];

export function PmqExamStructureSection() {
  return (
    <section aria-labelledby="pmq-exam-structure-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pmq-exam-structure-heading" className={styles.title}>
            How the <span className={styles.titleAccent}>exam</span> works
          </h2>
        </div>
        <ul className={styles.list}>
          {HOW_EXAM_WORKS.map((item) => (
            <li key={item} className={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PmqMarksBreakdownSection() {
  const totalNumber = MARKS_BREAKDOWN.reduce((sum, r) => sum + r.number, 0);
  const totalMarks = MARKS_BREAKDOWN.reduce((sum, r) => sum + r.total, 0);

  return (
    <section aria-labelledby="pmq-marks-breakdown-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pmq-marks-breakdown-heading" className={styles.title}>
            Where the <span className={styles.titleAccent}>marks</span> are
          </h2>
        </div>
        <p className={styles.callout}>
          67% of the marks come from typed written answers.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} scope="col">
                  Question type
                </th>
                <th className={`${styles.th} ${styles.thRight}`} scope="col">
                  Number
                </th>
                <th className={`${styles.th} ${styles.thRight}`} scope="col">
                  Marks each
                </th>
                <th className={`${styles.th} ${styles.thRight}`} scope="col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {MARKS_BREAKDOWN.map((row) => (
                <tr key={row.type} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdStrong}`}>{row.type}</td>
                  <td className={`${styles.td} ${styles.tdRight}`}>{row.number}</td>
                  <td className={`${styles.td} ${styles.tdRight}`}>{row.marksEach}</td>
                  <td className={`${styles.td} ${styles.tdRight}`}>{row.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.tfootRow}>
                <td className={styles.td}>Total</td>
                <td className={`${styles.td} ${styles.tdRight}`}>{totalNumber}</td>
                <td className={styles.td} />
                <td className={`${styles.td} ${styles.tdRight}`}>{totalMarks}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

export function PmqSyllabusWeightSection() {
  return (
    <section aria-labelledby="pmq-syllabus-weight-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pmq-syllabus-weight-heading" className={styles.title}>
            Where the <span className={styles.titleAccent}>syllabus weight</span> sits
          </h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} scope="col">
                  Area
                </th>
                <th className={styles.th} scope="col">
                  Learning objectives
                </th>
                <th className={`${styles.th} ${styles.thRight}`} scope="col">
                  Share of exam
                </th>
              </tr>
            </thead>
            <tbody>
              {SYLLABUS_WEIGHT.map((row) => (
                <tr key={row.area} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdStrong}`}>{row.area}</td>
                  <td className={styles.td}>{row.los}</td>
                  <td className={`${styles.td} ${styles.tdRight}`}>{row.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function PmqMarkingGuidanceSection() {
  return (
    <section aria-labelledby="pmq-marking-guidance-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pmq-marking-guidance-heading" className={styles.title}>
            How written answers are <span className={styles.titleAccent}>marked</span>
          </h2>
        </div>
        <ul className={styles.list}>
          {MARKING_GUIDANCE.map((item) => (
            <li key={item} className={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PmqPassMarkSection() {
  return (
    <section aria-labelledby="pmq-pass-mark-heading">
      <div className={styles.panel}>
        <div className={styles.titleBar}>
          <h2 id="pmq-pass-mark-heading" className={styles.title}>
            About the <span className={styles.titleAccent}>pass mark</span>
          </h2>
        </div>
        <ul className={styles.list}>
          {PASS_MARK_NOTES.map((item) => (
            <li key={item} className={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
