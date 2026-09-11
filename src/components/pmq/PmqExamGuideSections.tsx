"use client";

import { useId, useState } from "react";
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

type TabId = "structure" | "marks" | "syllabus" | "marking" | "pass";

const TABS: { id: TabId; label: string; heading: string }[] = [
  { id: "structure", label: "Structure", heading: "How the exam works" },
  { id: "marks", label: "Marks", heading: "Where the marks are" },
  { id: "syllabus", label: "Syllabus", heading: "Where the syllabus weight sits" },
  { id: "marking", label: "Marking", heading: "How written answers are marked" },
  { id: "pass", label: "Pass mark", heading: "About the pass mark" },
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item} className={styles.listItem}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function MarksTable() {
  const totalNumber = MARKS_BREAKDOWN.reduce((sum, r) => sum + r.number, 0);
  const totalMarks = MARKS_BREAKDOWN.reduce((sum, r) => sum + r.total, 0);

  return (
    <>
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
                <td className={`${styles.td} ${styles.tdRight}`}>
                  {row.marksEach}
                </td>
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
    </>
  );
}

function SyllabusTable() {
  return (
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
  );
}

function TabPanel({ tab }: { tab: TabId }) {
  switch (tab) {
    case "structure":
      return <BulletList items={HOW_EXAM_WORKS} />;
    case "marks":
      return <MarksTable />;
    case "syllabus":
      return <SyllabusTable />;
    case "marking":
      return <BulletList items={MARKING_GUIDANCE} />;
    case "pass":
      return <BulletList items={PASS_MARK_NOTES} />;
  }
}

/**
 * Single quiet console for all PMQ exam-reference facts — segmented tabs
 * (Mobbin / 21st.dev settings-panel pattern) instead of five stacked cards.
 */
export function PmqExamGuideSection() {
  const [active, setActive] = useState<TabId>("structure");
  const baseId = useId();
  const activeMeta = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section aria-labelledby={`${baseId}-heading`}>
      <div className={styles.panel} data-exam-guide="">
        <div className={styles.titleBar}>
          <h2 id={`${baseId}-heading`} className={styles.title}>
            Exam <span className={styles.titleAccent}>essentials</span>
          </h2>
          <p className={styles.subtitle}>
            Structure, marks, syllabus weight, marking, and the pass mark.
          </p>
        </div>

        <div
          className={styles.segmentTrack}
          role="tablist"
          aria-label="Exam essentials topics"
        >
          {TABS.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                className={`${styles.segment} ${selected ? styles.segmentActive : ""}`}
                onClick={() => setActive(tab.id)}
                onKeyDown={(event) => {
                  const i = TABS.findIndex((t) => t.id === tab.id);
                  let next: TabId | null = null;
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    next = TABS[(i + 1) % TABS.length].id;
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    next = TABS[(i - 1 + TABS.length) % TABS.length].id;
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    next = TABS[0].id;
                  } else if (event.key === "End") {
                    event.preventDefault();
                    next = TABS[TABS.length - 1].id;
                  }
                  if (next) {
                    setActive(next);
                    requestAnimationFrame(() => {
                      document
                        .getElementById(`${baseId}-tab-${next}`)
                        ?.focus();
                    });
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel-${active}`}
          aria-labelledby={`${baseId}-tab-${active}`}
          className={styles.tabPanel}
        >
          <h3 className={styles.panelHeading}>{activeMeta.heading}</h3>
          <TabPanel tab={active} />
        </div>
      </div>
    </section>
  );
}
