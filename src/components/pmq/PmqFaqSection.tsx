"use client";

import { useState } from "react";
import styles from "@/components/pmq/PmqFaqSection.module.css";

const FAQ_ITEMS = [
  {
    question: "What is the APM Project Management Qualification?",
    answer: (
      <p>
        The APM Project Management Qualification (PMQ) is a knowledge-based,
        internationally recognised certification offered by the{" "}
        <a
          href="https://www.apm.org.uk/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Association for Project Management (APM)
        </a>{" "}
        – the UK&apos;s chartered body for the project profession. It
        demonstrates your ability to understand and apply project management
        principles across a wide range of environments, from individual
        assignments to large-scale capital projects.
      </p>
    ),
  },
  {
    question: "Who is this certification for?",
    answer: (
      <p>
        The PMQ is ideal for professionals already working in a project
        environment – typically those with 2–3 years of experience – or those
        pursuing a project management degree or apprenticeship. It is the perfect
        next step after the APM Project Fundamentals Qualification (PFQ) if you
        want to deepen your expertise rather than focus on a single methodology.
      </p>
    ),
  },
  {
    question: "How does it help your career?",
    answer: (
      <p>
        Holding a PMQ signals to employers that you have a comprehensive,
        standardised understanding of project management. It serves as a stepping
        stone toward becoming a Chartered Project Professional (ChPP) – the
        industry&apos;s highest standard. Qualified project managers typically
        command higher salaries, and the certification is respected across
        sectors globally. You gain a toolkit of technical, commercial, and
        people-management skills – including risk, resource, and stakeholder
        management – that apply immediately to real-world projects.
      </p>
    ),
  },
  {
    question: "What is the exam format?",
    answer: (
      <p>
        The exam lasts 2.5 hours and is split into two parts with an optional
        30-minute break. You will encounter four question types: multiple
        response (selecting correct combinations), select from a list (filling
        in missing words), short response (a word, phrase, or sentence), and
        long response (written explanations of project scenarios). The exam is
        conducted online via remote proctoring – you can sit it from home or a
        location of your choice.
      </p>
    ),
  },
  {
    question: "How do I book my exam?",
    answer: (
      <p>
        You can book directly through the{" "}
        <a
          href="https://www.apm.org.uk/qualifications-and-training/qualifications-find-out-more/open-exams/#pmq"
          target="_blank"
          rel="noopener noreferrer"
        >
          APM exam booking page
        </a>{" "}
        or via an accredited training provider. Self-study candidates can book
        an Open Online Exam directly on the APM website. Most candidates book
        through a training provider, which typically includes structured
        coursework and study materials.
      </p>
    ),
  },
];

/** Flat FAQ accordion — copy locked; chrome matches plan / command words consoles. */
export function PmqFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="pmq-faqs-heading">
      <div className={styles.panel} data-faqs="">
        <div className={styles.titleBar}>
          <h2 id="pmq-faqs-heading" className={styles.title}>
            FAQ<span className={styles.titleAccent}>s</span>
          </h2>
        </div>

        <ul className={styles.list}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `pmq-faq-panel-${index}`;
            const triggerId = `pmq-faq-trigger-${index}`;

            return (
              <li key={item.question} className={styles.item}>
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={styles.trigger}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className={styles.question}>{item.question}</span>
                  <span
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                  inert={!isOpen ? true : undefined}
                  className={`${styles.panelShell} ${isOpen ? styles.panelShellOpen : ""}`}
                >
                  <div className={styles.panelClip}>
                    <div className={styles.answer}>{item.answer}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
