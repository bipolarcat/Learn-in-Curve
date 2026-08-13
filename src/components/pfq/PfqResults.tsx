"use client";

import Link from "next/link";
import { PfqCoverageMap } from "@/components/pfq/PfqCoverageMap";
import styles from "@/components/pfq/PfqResults.module.css";
import { PFQ_PASS_MARK } from "@/lib/pfq/outcomes";
import type { PfqResultsPayload } from "@/lib/pfq/types";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";

type Props = {
  results: PfqResultsPayload;
};

export function PfqResults({ results }: Props) {
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.kicker}>Provisional result</p>
        <p className={styles.scoreLine}>
          <span className={styles.scoreNum}>{results.score}</span>
          <span className={styles.scoreMax}>/{results.maxScore}</span>
          <span
            className={
              results.passed ? styles.passPill : styles.failPill
            }
          >
            {results.passed ? "Pass" : "Below pass"}
          </span>
        </p>
        <p className={styles.passHint}>
          Pass mark on the real PFQ is {PFQ_PASS_MARK}/{results.maxScore}. No
          negative marking — unanswered scored 0.
        </p>
      </header>

      <PfqCoverageMap
        headlineCorrect={results.outcomesAnsweredCorrectly}
        outcomeCount={results.outcomeCount}
        coverage={results.coverage}
        objectives={results.objectives}
      />

      <section className={styles.gaps}>
        <h2 className={styles.sectionTitle}>Gaps by marks at risk</h2>
        <p className={styles.sectionSub}>
          Ordered by how many marks each outcome cost you on this sitting.
        </p>
        <ol className={styles.gapList}>
          {results.gaps.map((gap) => (
            <li key={gap.code} className={styles.gapItem}>
              <div className={styles.gapHead}>
                <span className={styles.gapCode}>{gap.code}</span>
                <span className={styles.gapTitle}>{gap.title}</span>
                <span className={styles.gapMeta}>
                  {gap.marks} mark{gap.marks === 1 ? "" : "s"} · Day {gap.day}
                </span>
              </div>
              {gap.explanation ? (
                <p className={styles.gapExplain}>{gap.explanation}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.review}>
        <h2 className={styles.sectionTitle}>Question review</h2>
        <ul className={styles.reviewList}>
          {results.reviews.map((q, index) => (
            <li
              key={q.id}
              className={`${styles.reviewItem} ${
                q.correct ? styles.reviewOk : styles.reviewBad
              }`}
            >
              <p className={styles.reviewMeta}>
                Q{index + 1} · {q.learning_outcome} · Day {q.day}
                {q.flagged ? " · flagged" : ""}
              </p>
              <p className={styles.reviewStem}>{q.stem}</p>
              {q.items?.length ? (
                <ol className={styles.items}>
                  {q.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              ) : null}
              <ul className={styles.options}>
                {Object.entries(q.options).map(([key, text]) => (
                  <li
                    key={key}
                    className={
                      key === q.answer
                        ? styles.optCorrect
                        : key === q.selected
                          ? styles.optSelected
                          : undefined
                    }
                  >
                    <strong>{key.toUpperCase()}.</strong> {text}
                  </li>
                ))}
              </ul>
              <p className={styles.explanation}>{q.explanation}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.actions}>
        <Link href="/pfq/mock" className={stampCtaPrimary}>
          Sit another mock
        </Link>
        <Link href="/pfq#trap-school" className={stampCtaSecondary}>
          Trap School
        </Link>
      </div>
    </div>
  );
}
