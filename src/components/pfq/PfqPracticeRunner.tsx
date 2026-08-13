"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  startPfqPractice,
  submitPfqPracticeAnswer,
} from "@/lib/pfq/practice-actions";
import type { PfqPublicQuestion } from "@/lib/pfq/types";
import { Spinner } from "@/components/ui/spinner";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import styles from "@/components/pfq/PfqPracticeRunner.module.css";

type Feedback = {
  correct: boolean;
  explanation: string;
  learning_outcome: string;
  correct_key: string;
};

type Props = {
  objective: number;
  objectiveTitle: string;
};

export function PfqPracticeRunner({ objective, objectiveTitle }: Props) {
  const [phase, setPhase] = useState<"ready" | "run" | "done">("ready");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<PfqPublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [pending, startTransition] = useTransition();

  const current = questions[index] ?? null;

  function begin() {
    setError("");
    startTransition(async () => {
      const started = await startPfqPractice({ objective });
      if (!started.ok) {
        setError(started.error);
        return;
      }
      setSessionId(started.sessionId);
      setQuestions(started.questions);
      setIndex(0);
      setSelected(null);
      setFeedback(null);
      setAnswered(0);
      setCorrectCount(0);
      setPhase("run");
    });
  }

  function checkAnswer() {
    if (!current || !selected || !sessionId || feedback) return;
    setError("");
    startTransition(async () => {
      const result = await submitPfqPracticeAnswer({
        sessionId,
        questionId: current.id,
        selected,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFeedback(result);
      setAnswered((n) => n + 1);
      if (result.correct) setCorrectCount((n) => n + 1);
    });
  }

  function next() {
    if (index + 1 >= questions.length) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
    setError("");
  }

  if (phase === "ready") {
    return (
      <div className={styles.startCard}>
        <h1 className={styles.title}>
          Practice LO{objective}
          <span className={styles.titleSub}>{objectiveTitle}</span>
        </h1>
        <p className={styles.lead}>
          Untimed. Every active question for this objective — mock and
          practice variants. Immediate feedback after each answer; results
          feed the coverage map by learning outcome.
        </p>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          className={stampCtaPrimary}
          disabled={pending}
          aria-busy={pending}
          onClick={() => begin()}
        >
          {pending ? (
            <Spinner variant="bars" size={16} className="text-current" />
          ) : (
            "Start practice"
          )}
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className={styles.startCard}>
        <h1 className={styles.title}>Practice complete</h1>
        <p className={styles.lead}>
          {correctCount} of {answered} correct this session. Coverage map
          uses your most recent answer per learning outcome.
        </p>
        <div className={styles.navRow}>
          <button
            type="button"
            className={stampCtaPrimary}
            onClick={() => {
              setPhase("ready");
              setQuestions([]);
            }}
          >
            Practise again
          </button>
          <Link href="/pfq/learn" className={stampCtaSecondary}>
            Coverage map
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={styles.center}>
        <p role="alert">No questions loaded.</p>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <span>
          Q{index + 1}/{questions.length}
        </span>
        <span className={styles.muted}>
          LO{objective} · untimed · {answered} checked
        </span>
      </header>

      <main className={styles.main}>
        <p className={styles.outcomeHint}>
          Tests outcome {current.learning_outcome}
        </p>
        <h2 className={styles.stem}>{current.stem}</h2>

        {current.items?.length ? (
          <ol className={styles.items}>
            {current.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        ) : null}

        <div className={styles.options} role="radiogroup" aria-label="Options">
          {Object.entries(current.options).map(([key, text]) => {
            const isSelected = selected === key;
            let tone = "";
            if (feedback) {
              if (key === feedback.correct_key) tone = styles.optionCorrect;
              else if (isSelected && !feedback.correct)
                tone = styles.optionWrong;
            } else if (isSelected) {
              tone = styles.optionSelected;
            }
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={Boolean(feedback) || pending}
                className={`${styles.option} ${tone}`}
                onClick={() => setSelected(key)}
              >
                <span className={styles.optionKey}>{key.toUpperCase()}</span>
                <span>{text}</span>
              </button>
            );
          })}
        </div>

        {feedback ? (
          <div
            className={`${styles.feedback} ${
              feedback.correct ? styles.feedbackOk : styles.feedbackBad
            }`}
            role="status"
          >
            <p className={styles.feedbackLabel}>
              {feedback.correct ? "Correct" : "Not quite"} · outcome{" "}
              {feedback.learning_outcome}
            </p>
            <p className={styles.feedbackBody}>{feedback.explanation}</p>
          </div>
        ) : null}

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.navRow}>
          {!feedback ? (
            <button
              type="button"
              className={stampCtaPrimary}
              disabled={!selected || pending}
              aria-busy={pending}
              onClick={() => checkAnswer()}
            >
              {pending ? (
                <Spinner variant="bars" size={16} className="text-current" />
              ) : (
                "Check answer"
              )}
            </button>
          ) : (
            <button
              type="button"
              className={stampCtaPrimary}
              onClick={() => next()}
            >
              {index + 1 >= questions.length ? "Finish" : "Next question"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
