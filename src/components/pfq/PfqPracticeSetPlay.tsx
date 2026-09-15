"use client";

import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import { submitPfqPracticeAnswer } from "@/lib/pfq/practice-actions";
import type { PfqPublicQuestion } from "@/lib/pfq/types";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckAnswerHintHost,
  showCheckAnswerHint,
} from "@/components/pmq/CheckAnswerHint";
import { McqResponseFields } from "@/components/pmq/QuestionResponseFields";
import { resolveTrapCallout } from "@/lib/pfq/trap-callout";
import { PfqTrapCallout } from "@/components/pfq/PfqTrapCallout";
import { PfqTip } from "@/components/pfq/PfqTip";
import styles from "@/components/pmq/PracticeQuiz.module.css";

const LETTERS = "ABCD";

type Feedback = {
  correct: boolean;
  explanation: string;
  tip: string | null;
  learning_outcome: string;
  correct_key: string;
};

type Props = {
  sessionId: string;
  questions: PfqPublicQuestion[];
};

function optionKeys(question: PfqPublicQuestion): string[] {
  return question.option_order?.length
    ? question.option_order
    : Object.keys(question.options);
}

function letterForKey(question: PfqPublicQuestion, key: string): string {
  const idx = optionKeys(question).indexOf(key);
  return idx >= 0 ? (LETTERS[idx] ?? key.toUpperCase()) : key.toUpperCase();
}

function keyForLetter(question: PfqPublicQuestion, letter: string): string | null {
  const idx = LETTERS.indexOf(letter.toUpperCase());
  if (idx < 0) return null;
  return optionKeys(question)[idx] ?? null;
}

export function PfqPracticeSetPlay({ sessionId, questions }: Props) {
  const questionTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [qi, setQi] = useState(0);
  const [selectedById, setSelectedById] = useState<Record<string, string>>({});
  const [resultById, setResultById] = useState<Record<string, Feedback>>({});
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const current = questions[qi] ?? null;
  const completed = questions.map((q) => Boolean(resultById[q.id]));
  const completedCount = completed.filter(Boolean).length;
  const allDone = questions.length > 0 && completedCount === questions.length;
  const isLast = qi >= questions.length - 1;
  const maxReachable =
    completed.findIndex((done) => !done) === -1
      ? questions.length - 1
      : completed.findIndex((done) => !done);
  const canGoPrev = qi > 0;
  const canGoNext = qi < maxReachable;

  const selectedLetter = current ? (selectedById[current.id] ?? "") : "";
  const result = current ? (resultById[current.id] ?? null) : null;
  const submitted = Boolean(result);

  function goTo(index: number) {
    if (index < 0 || index > maxReachable) return;
    setQi(index);
    setError("");
  }

  function handleQuestionTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index >= maxReachable ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index <= 0 ? maxReachable : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = maxReachable;
    }
    if (nextIndex == null) return;
    event.preventDefault();
    goTo(nextIndex);
    requestAnimationFrame(() => questionTabRefs.current[nextIndex]?.focus());
  }

  function checkAnswer(el: HTMLElement) {
    if (!current || submitted || pending) return;
    if (!selectedLetter) {
      showCheckAnswerHint("mcq", el);
      return;
    }
    const selected = keyForLetter(current, selectedLetter);
    if (!selected) return;
    setError("");
    startTransition(async () => {
      const next = await submitPfqPracticeAnswer({
        sessionId,
        questionId: current.id,
        selected,
      });
      if (!next.ok) {
        setError(next.error);
        return;
      }
      setResultById((prev) => ({ ...prev, [current.id]: next }));
    });
  }

  if (!current) {
    return <p className={styles.empty}>No questions loaded.</p>;
  }

  const optionTexts = optionKeys(current).map((key) => current.options[key] ?? "");
  const correctLetter = result
    ? letterForKey(current, result.correct_key)
    : "";

  return (
    <div className={styles.runner} data-quiz-card="">
      <CheckAnswerHintHost />
      <div className={styles.qRail}>
        <div
          className={styles.qGrid}
          role="tablist"
          aria-label="Questions in this set"
          style={{ ["--quiz-total" as string]: questions.length }}
        >
          {questions.map((q, idx) => {
            const reachable = idx <= maxReachable;
            const done = completed[idx];
            const currentTab = idx === qi;
            const tabResult = resultById[q.id];
            const cellClass = [
              styles.qCell,
              currentTab ? styles.qCellCurrent : "",
              !currentTab && tabResult?.correct === true
                ? styles.qCellCorrect
                : "",
              !currentTab && tabResult?.correct === false
                ? styles.qCellIncorrect
                : "",
              !currentTab && done && !tabResult ? styles.qCellDone : "",
            ]
              .filter(Boolean)
              .join(" ");
            const resultLabel = tabResult
              ? tabResult.correct
                ? "correct"
                : "incorrect"
              : null;
            return (
              <button
                key={q.id}
                type="button"
                role="tab"
                ref={(element) => {
                  questionTabRefs.current[idx] = element;
                }}
                id={`pfq-quiz-question-tab-${idx + 1}`}
                aria-controls="pfq-quiz-question-panel"
                aria-selected={currentTab}
                tabIndex={currentTab ? 0 : -1}
                aria-label={
                  resultLabel
                    ? `Q${idx + 1}, ${resultLabel}${currentTab ? ", current" : " — review"}`
                    : currentTab
                      ? `Q${idx + 1}, current`
                      : `Q${idx + 1}${reachable ? "" : ", locked"}`
                }
                disabled={!reachable}
                onClick={() => goTo(idx)}
                onKeyDown={(event) => handleQuestionTabKeyDown(event, idx)}
                className={cellClass}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="pfq-quiz-question-panel"
        role="tabpanel"
        aria-labelledby={`pfq-quiz-question-tab-${qi + 1}`}
        className={styles.questionPanel}
      >
        <div className="w-full min-w-0">
          <p id="quiz-q" className={styles.prompt}>
            <span className="sr-only">
              Question {qi + 1} of {questions.length}.{" "}
            </span>
            {current.stem}
          </p>
          {current.items?.length ? (
            <ol className="mb-4 list-decimal pl-5 font-body text-[15px] leading-[1.55] text-ink">
              {current.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : null}

          <McqResponseFields
            options={optionTexts}
            value={selectedLetter}
            disabled={submitted || pending}
            ariaLabel={`Question ${qi + 1} of ${questions.length}`}
            onChange={(letter) => {
              if (submitted || pending) return;
              setSelectedById((prev) => ({ ...prev, [current.id]: letter }));
            }}
            getState={(letter) => {
              if (!submitted) {
                return letter === selectedLetter ? "selected" : "default";
              }
              if (letter === correctLetter) return "correct";
              if (letter === selectedLetter) return "incorrect";
              return "muted";
            }}
          />

          {!submitted ? (
            <div className={styles.checkRow}>
              <button
                type="button"
                disabled={pending}
                onClick={(event) => checkAnswer(event.currentTarget)}
                aria-busy={pending}
                aria-label={pending ? "Checking answer" : "Check answer"}
                className={styles.checkBtn}
              >
                {pending ? (
                  <Spinner
                    variant="pinwheel"
                    size={14}
                    className="text-paper"
                    aria-hidden
                  />
                ) : (
                  "Check answer"
                )}
              </button>
            </div>
          ) : null}

          {result ? (
            <>
              <p className={styles.feedback} aria-live="polite">
                {result.correct
                  ? `Correct — ${result.explanation}`
                  : `Not quite — ${result.explanation}`}
              </p>
              <PfqTip tip={result.tip} />
              {!result.correct
                ? (() => {
                    const callout = resolveTrapCallout(current.traps);
                    return callout ? (
                      <PfqTrapCallout callout={callout} />
                    ) : null;
                  })()
                : null}
            </>
          ) : null}

          {error ? (
            <p className={styles.feedback} role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className={styles.navRow}>
          <div className="min-w-0">
            {canGoPrev ? (
              <button
                type="button"
                onClick={() => goTo(qi - 1)}
                className={styles.navBtn}
              >
                Previous
              </button>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {allDone && isLast && !canGoNext ? (
              <p className={styles.setComplete}>Set complete</p>
            ) : null}
            {canGoNext ? (
              <button
                type="button"
                onClick={() => goTo(qi + 1)}
                className={`${styles.navBtn} ${styles.navBtnNext}`}
              >
                Next
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
