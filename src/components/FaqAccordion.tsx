"use client";

import { useState, type ReactNode } from "react";
import styles from "@/components/FaqAccordion.module.css";

export type FaqAccordionItem = {
  question: string;
  answer: ReactNode;
};

/**
 * Shared FAQ accordion — answers stay mounted in the DOM (CSS collapse only)
 * so SSR HTML and FAQPage JSON-LD stay crawler-visible.
 */
export function FaqAccordion({
  items,
  headingId,
  title,
  titleAccent,
  defaultOpenIndex = null,
  idPrefix = "faq",
}: {
  items: FaqAccordionItem[];
  headingId: string;
  title: ReactNode;
  /** Optional accent span content after title (e.g. PMQ "s"). */
  titleAccent?: ReactNode;
  defaultOpenIndex?: number | null;
  idPrefix?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <section aria-labelledby={headingId} className="w-full min-w-0">
      <div className={styles.panel} data-faqs="">
        <div className={styles.titleBar}>
          <h2 id={headingId} className={styles.title}>
            {title}
            {titleAccent != null ? (
              <span className={styles.titleAccent}>{titleAccent}</span>
            ) : null}
          </h2>
        </div>

        <ul className={styles.list}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${idPrefix}-panel-${index}`;
            const triggerId = `${idPrefix}-trigger-${index}`;

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
