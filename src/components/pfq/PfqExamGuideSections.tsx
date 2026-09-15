"use client";

import { useId, useState } from "react";
import styles from "@/components/pmq/PmqExamGuideSections.module.css";
import {
  PFQ_OBJECTIVES,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";

const STRUCTURE = [
  `${PFQ_QUESTION_COUNT} questions in 60 minutes. One mark each, four options, exactly one correct.`,
  "Questions stand alone. None depends on your answer to another.",
  `${PFQ_PASS_MARK} out of ${PFQ_QUESTION_COUNT} passes. Fixed for every sitting, never scaled.`,
  "No negative marking. A blank scores the same as a wrong answer, so never leave one.",
  "Questions come in four shapes: a straight question, a sentence to finish, a sentence with a word missing, and a list of numbered statements where you pick the right combination.",
  "You can flag a question and return to it. The review screen filters by unattempted, attempted and flagged.",
];

const WEIGHT_ROWS = [...PFQ_OBJECTIVES]
  .slice()
  .sort((a, b) => b.marks - a.marks);

type TabId = "structure" | "weight";

const TABS: { id: TabId; label: string; heading: string }[] = [
  { id: "structure", label: "Structure", heading: "How the exam works" },
  { id: "weight", label: "Weight", heading: "Where the marks sit" },
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

function WeightTable() {
  return (
    <>
      <p className={styles.callout}>
        LO4, LO5 and LO7 are 27 marks between them, three quarters of pass mark.
      </p>
      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.syllabusTable}`}>
          <thead>
            <tr>
              <th className={styles.th} scope="col">
                Objective
              </th>
              <th
                className={`${styles.th} ${styles.thCenter} ${styles.thStack}`}
                scope="col"
              >
                Marks
              </th>
            </tr>
          </thead>
          <tbody>
            {WEIGHT_ROWS.map((row) => (
              <tr key={row.objective} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdStrong}`}>
                  LO{row.objective} {row.title}
                </td>
                <td className={`${styles.td} ${styles.tdCenter}`}>{row.marks}</td>
              </tr>
            ))}
            <tr className={styles.tr}>
              <td className={styles.td}>
                A second question from any one outcome
              </td>
              <td className={`${styles.td} ${styles.tdCenter}`}>1</td>
            </tr>
            <tr className={styles.tfootRow}>
              <td className={styles.td}>Total</td>
              <td className={`${styles.td} ${styles.tdCenter}`}>
                {PFQ_QUESTION_COUNT}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function TabPanel({ tab }: { tab: TabId }) {
  switch (tab) {
    case "structure":
      return <BulletList items={STRUCTURE} />;
    case "weight":
      return <WeightTable />;
  }
}

/**
 * Single quiet console for PFQ exam-reference facts — same segmented-tab
 * dialect as PMQ Exam essentials.
 */
export function PfqExamGuideSection() {
  const [active, setActive] = useState<TabId>("structure");
  const baseId = useId();
  const activeMeta = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section aria-labelledby={`${baseId}-heading`}>
      <div className={styles.panel} data-exam-guide="pfq">
        <div className={styles.titleBar}>
          <h2 id={`${baseId}-heading`} className={styles.title}>
            Exam <span className={styles.titleAccent}>essentials</span>
          </h2>
          <p className={styles.subtitle}>
            How the paper is built, and where the marks sit.
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
