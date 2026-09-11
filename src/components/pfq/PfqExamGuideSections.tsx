"use client";

import { useId, useState } from "react";
import styles from "@/components/pmq/PmqExamGuideSections.module.css";
import {
  PFQ_OBJECTIVES,
  PFQ_OUTCOME_COUNT,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";

const STRUCTURE = [
  `${PFQ_QUESTION_COUNT} questions, 1 mark each, 60 minutes, four options.`,
  "Delivered online in the Surpass platform (remote-invigilated or classroom).",
  `${PFQ_OUTCOME_COUNT} outcomes, one question each, plus LO 10.4 twice equals exactly ${PFQ_QUESTION_COUNT}.`,
  "Every sitting covers every published learning outcome exactly once. There is no sampling.",
  "You should attempt every question.",
];

const GUESSING = [
  "No negative marking. An unanswered question scores zero.",
  "APM advises guessing when you are unsure.",
  "Partial knowledge on numbered-list multi-selects still scores zero if the option set is wrong, so eliminate with care.",
];

const PASS_MARK = [
  `Pass mark is fixed at ${PFQ_PASS_MARK}/${PFQ_QUESTION_COUNT} (60%) for every sitting.`,
  "It does not vary between papers.",
  `Maximum score is ${PFQ_QUESTION_COUNT} marks.`,
];

const COVERAGE = [
  `${PFQ_OUTCOME_COUNT} published learning outcomes. The bank and mock generator must cover every one.`,
  "Practice drills and mock papers both feed the same coverage map.",
  "Lesson checkpoints are self-assessment only. They do not write coverage signals.",
];

const WEIGHT_ROWS = [...PFQ_OBJECTIVES]
  .slice()
  .sort((a, b) => b.marks - a.marks);

type TabId = "structure" | "weight" | "guessing" | "pass" | "coverage";

const TABS: { id: TabId; label: string; heading: string }[] = [
  { id: "structure", label: "Structure", heading: "How the exam works" },
  { id: "weight", label: "Weight", heading: "Where the marks sit" },
  { id: "guessing", label: "Guessing", heading: "Guessing policy" },
  { id: "pass", label: "Pass mark", heading: "About the pass mark" },
  { id: "coverage", label: "Coverage", heading: "Complete syllabus coverage" },
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
        Study by paper weight, not by card order. LO4 alone is 11 marks; LO3 is
        1 mark.
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
              <th
                className={`${styles.th} ${styles.thCenter} ${styles.thStack}`}
                scope="col"
              >
                Day
              </th>
            </tr>
          </thead>
          <tbody>
            {WEIGHT_ROWS.map((row) => (
              <tr key={row.objective} className={styles.tr}>
                <td className={`${styles.td} ${styles.tdStrong}`}>
                  LO{row.objective} · {row.title}
                </td>
                <td className={`${styles.td} ${styles.tdCenter}`}>{row.marks}</td>
                <td className={`${styles.td} ${styles.tdCenter}`}>{row.day}</td>
              </tr>
            ))}
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
    case "guessing":
      return <BulletList items={GUESSING} />;
    case "pass":
      return <BulletList items={PASS_MARK} />;
    case "coverage":
      return <BulletList items={COVERAGE} />;
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
            Structure, weight, guessing, pass mark, and coverage.
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
