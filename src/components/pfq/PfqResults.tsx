"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/components/pmq/MockExamRunner.module.css";
import { PFQ_LEARN_HREF } from "@/lib/pfq/constants";
import type { PfqMockSet } from "@/lib/pfq/generator";
import { PFQ_PASS_MARK } from "@/lib/pfq/outcomes";
import type { PfqResultsPayload, PfqReviewQuestion } from "@/lib/pfq/types";

type Props = {
  results: PfqResultsPayload;
  mockSet?: PfqMockSet | null;
};

function formatChoice(
  letter: string | null,
  options: PfqReviewQuestion["options"],
): string {
  if (!letter) return "Not answered";
  const key = letter.toLowerCase();
  const text = options[key];
  return text ? `${key.toUpperCase()}) ${text}` : key.toUpperCase();
}

export function PfqResults({ results, mockSet }: Props) {
  const router = useRouter();
  const [overviewPending, startOverview] = useTransition();
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const percentage = Math.round((results.score / results.maxScore) * 100);
  const current = results.reviews[reviewIndex];
  const title = mockSet ? `Mock Exam ${mockSet}` : "Mock exam";

  return (
    <div className={styles.resultWrap}>
      <section
        className={styles.resultCard}
        aria-labelledby="pfq-mock-result-title"
      >
        <h1 id="pfq-mock-result-title" className={styles.resultTitle}>
          {title}
        </h1>
        <p className={styles.resultMeta}>Final result · attempt complete</p>
        <p className={styles.resultScore}>
          {results.score} / {results.maxScore}
          <span className={styles.resultPctSep} aria-hidden>
            ·
          </span>
          <span className={styles.resultPct}>{percentage}%</span>
        </p>
        <div className={styles.resultVerdictStack}>
          <p
            className={`${styles.resultVerdict} ${
              results.passed
                ? styles.resultVerdictPass
                : styles.resultVerdictRefer
            }`}
          >
            {results.passed ? "Pass - well done." : "Refer - keep going."}
          </p>
          <p className={styles.resultMeta}>
            Pass mark is {PFQ_PASS_MARK}/{results.maxScore}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowReview((open) => !open)}
          aria-label={showReview ? "Hide answer review" : "Review answers"}
          className={styles.resultBtnSecondary}
        >
          {showReview ? "Hide answer review" : "Review answers"}
        </button>
      </section>

      {showReview && current ? (
        <section className={styles.reviewStack} aria-label="Answer review">
          <nav
            aria-label="Review questions"
            className={`${styles.rail} ${styles.railCompact}`}
          >
            <div className={`${styles.railGrid} ${styles.railGridCompact}`}>
              {results.reviews.map((question, index) => {
                const selected = index === reviewIndex;
                return (
                  <button
                    key={question.id}
                    type="button"
                    aria-current={selected ? "step" : undefined}
                    aria-label={`Question ${index + 1}, ${
                      question.correct ? "correct" : "incorrect"
                    }`}
                    onClick={() => setReviewIndex(index)}
                    className={`${styles.railCell} ${
                      selected ? styles.railCellCurrent : ""
                    } ${
                      question.correct
                        ? styles.railCellPass
                        : styles.railCellMiss
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </nav>
          <article className={`${styles.reviewCard} ${styles.reviewCardMarked}`}>
            <p
              className={`${styles.reviewMark} ${
                current.correct ? styles.reviewMarkPass : ""
              }`}
              aria-label={`${current.correct ? 1 : 0} of 1 marks`}
            >
              {current.correct ? 1 : 0}/1
            </p>
            <p className={styles.reviewMeta}>
              {`Question ${reviewIndex + 1} · [Learning Outcome ${current.learning_outcome}]`}
            </p>
            <h2 className={styles.reviewPrompt}>{current.stem}</h2>
            {current.items?.length ? (
              <ol className="mb-0 mt-3 list-decimal space-y-1.5 pl-5 font-body text-[13px] font-medium leading-snug text-ink/80">
                {current.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : null}
            <ReviewAnswer
              label="Your answer"
              body={formatChoice(current.selected, current.options)}
            />
            <ReviewAnswer
              label="Correct answer"
              body={formatChoice(current.answer, current.options)}
              positive
            />
            {current.explanation.trim() ? (
              <ReviewAnswer
                label="Explanation"
                body={current.explanation}
                accent
              />
            ) : null}
          </article>
        </section>
      ) : null}

      <div className={styles.resultFooter}>
        <button
          type="button"
          disabled={overviewPending}
          aria-busy={overviewPending}
          aria-label={
            overviewPending
              ? "Opening course overview"
              : "Back to course overview"
          }
          className={styles.resultBack}
          onClick={() => {
            startOverview(() => {
              router.push(PFQ_LEARN_HREF);
            });
          }}
        >
          {overviewPending ? (
            <Spinner variant="ring" size={14} className="text-orange" aria-hidden />
          ) : (
            "← Back to course overview"
          )}
        </button>
      </div>
    </div>
  );
}

function ReviewAnswer({
  label,
  body,
  positive = false,
  accent = false,
}: {
  label: string;
  body: string;
  positive?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={styles.reviewNote}>
      <h3
        className={`${styles.reviewNoteTitle} ${
          positive ? styles.reviewNoteTitlePositive : ""
        } ${accent ? styles.reviewNoteTitleAccent : ""}`}
      >
        {label}
      </h3>
      <p className={styles.reviewNoteBody}>{body}</p>
    </div>
  );
}
