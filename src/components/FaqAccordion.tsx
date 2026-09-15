"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "@/components/FaqAccordion.module.css";

export type FaqAccordionItem = {
  question: string;
  answer: ReactNode;
};

function FaqAnswer({
  isOpen,
  panelId,
  triggerId,
  children,
}: {
  isOpen: boolean;
  panelId: string;
  triggerId: string;
  children: ReactNode;
}) {
  const answerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = answerRef.current;
    if (!el) return;

    const read = () => {
      const next = el.scrollHeight;
      if (next > 0) setHeight(next);
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={styles.panelShell}
      style={{ gridTemplateRows: isOpen ? `${height}px` : "0px" }}
    >
      <div className={styles.panelClip}>
        <div ref={answerRef} className={styles.answer}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Shared FAQ accordion — answers stay mounted (CSS collapse only) so SSR HTML
 * and FAQPage JSON-LD stay crawler-visible. Open/close is height clip only;
 * answer copy stays fully opaque so it cannot vanish mid-animation.
 */
export function FaqAccordion({
  items,
  headingId,
  title,
  titleAccent,
  subtitle,
  defaultOpenIndex = null,
  idPrefix = "faq",
}: {
  items: FaqAccordionItem[];
  headingId: string;
  title: ReactNode;
  /** Optional accent span content after title (e.g. PMQ "s"). */
  titleAccent?: ReactNode;
  /** Quiet line under the title (e.g. “Frequently asked questions”). */
  subtitle?: ReactNode;
  defaultOpenIndex?: number | null;
  idPrefix?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const cardRef = useRef<HTMLDivElement>(null);
  const pinTopRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const pinned = pinTopRef.current;
    pinTopRef.current = null;
    if (!card || pinned == null) return;

    const delta = card.getBoundingClientRect().top - pinned;
    if (Math.abs(delta) < 0.5) return;

    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollBy(0, delta);
    root.style.scrollBehavior = previous;
  }, [openIndex]);

  return (
    <section aria-labelledby={headingId} className="w-full min-w-0">
      <div ref={cardRef} className={styles.panel} data-faqs="">
        <div className={styles.titleBar}>
          <h2 id={headingId} className={styles.title}>
            {title}
            {titleAccent != null ? (
              <span className={styles.titleAccent}>{titleAccent}</span>
            ) : null}
          </h2>
          {subtitle != null ? (
            <p className={styles.subtitle}>{subtitle}</p>
          ) : null}
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
                  onClick={() => {
                    pinTopRef.current =
                      cardRef.current?.getBoundingClientRect().top ?? null;
                    setOpenIndex(isOpen ? null : index);
                  }}
                >
                  <span className={styles.question}>{item.question}</span>
                  <span
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>
                <FaqAnswer
                  isOpen={isOpen}
                  panelId={panelId}
                  triggerId={triggerId}
                >
                  {item.answer}
                </FaqAnswer>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
