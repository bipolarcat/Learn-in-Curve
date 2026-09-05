"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  finishPfqFreeSampleSummary,
  startPfqFreeSamplePractice,
  startPfqPractice,
  submitPfqPracticeAnswer,
  type FinishPfqFreeSampleSummaryResult,
} from "@/lib/pfq/practice-actions";
import type { PfqPublicQuestion } from "@/lib/pfq/types";
import { Spinner } from "@/components/ui/spinner";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import styles from "@/components/pfq/PfqPracticeRunner.module.css";
import { PFQ_LEARN_HREF, PFQ_PRICING_HREF } from "@/lib/pfq/constants";
import { resolveTrapCallout } from "@/lib/pfq/trap-callout";
import { PfqTrapCallout } from "@/components/pfq/PfqTrapCallout";
import { PfqTip } from "@/components/pfq/PfqTip";

type Feedback = {
  correct: boolean;
  explanation: string;
  tip: string | null;
  learning_outcome: string;
  correct_key: string;
};

type Props = {
  mode?: "objective" | "free-sample";
  /** Required for objective mode; ignored for free-sample. */
  objective?: number;
  objectiveTitle: string;
  /** When true, drop the standalone page chrome (title / coverage map link). */
  embedded?: boolean;
};

export function PfqPracticeRunner({
  mode = "objective",
  objective,
  objectiveTitle,
  embedded = false,
}: Props) {
  const isFreeSample = mode === "free-sample";
  const [phase, setPhase] = useState<"ready" | "run" | "done">("ready");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<PfqPublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sampleSummary, setSampleSummary] = useState<
    Extract<FinishPfqFreeSampleSummaryResult, { ok: true }> | null
  >(null);
  const [pending, startTransition] = useTransition();

  const current = questions[index] ?? null;

  function begin() {
    setError("");
    startTransition(async () => {
      const started = isFreeSample
        ? await startPfqFreeSamplePractice()
        : await startPfqPractice({ objective: objective! });
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
      setSampleSummary(null);
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
      if (isFreeSample) {
        setError("");
        startTransition(async () => {
          const summary = await finishPfqFreeSampleSummary(sessionId);
          if (!summary.ok) {
            setError(summary.error);
            return;
          }
          setSampleSummary(summary);
          setPhase("done");
        });
        return;
      }
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
        {embedded ? (
          <h2 className={styles.title}>
            Drill
            <span className={styles.titleSub}>{objectiveTitle}</span>
          </h2>
        ) : (
          <h1 className={styles.title}>
            {isFreeSample ? "Free sample" : `Practice LO${objective}`}
            <span className={styles.titleSub}>{objectiveTitle}</span>
          </h1>
        )}
        <p className={styles.lead}>
          {isFreeSample
            ? "Untimed. Fifty questions across fifty learning outcomes. Immediate feedback after each answer. A short report at the end shows what you missed."
            : "Untimed. Every active question for this objective, mock and practice variants. Immediate feedback after each answer; results feed the coverage map by learning outcome."}
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
          ) : isFreeSample ? (
            "Start free sample"
          ) : (
            "Start practice"
          )}
        </button>
      </div>
    );
  }

  if (phase === "done" && isFreeSample && sampleSummary) {
    return (
      <div className={styles.startCard}>
        <h1 className={styles.title}>Free sample complete</h1>
        <p className={styles.lead}>
          You answered {sampleSummary.correctOutcomes} of{" "}
          {sampleSummary.testedCount} tested outcomes correctly.
        </p>
        {sampleSummary.missed.length > 0 ? (
          <div>
            <p className={styles.lead}>Missed outcomes:</p>
            <ul className={styles.missedList}>
              {sampleSummary.missed.map((m) => (
                <li key={m.code}>
                  {m.code} {m.title}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={styles.lead}>No missed outcomes in this sample.</p>
        )}
        <p className={styles.lead}>
          {sampleSummary.untestedCount} outcomes were not tested in this free
          sample.
        </p>
        <p className={styles.lead}>
          Pro adds the full practice bank, three timed mock papers, and a
          per-outcome coverage report.
        </p>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.navRow}>
          <Link href={PFQ_PRICING_HREF} className={stampCtaPrimary}>
            See Pro plans
          </Link>
          <button
            type="button"
            className={stampCtaSecondary}
            onClick={() => {
              setPhase("ready");
              setQuestions([]);
              setSampleSummary(null);
            }}
          >
            Try sample again
          </button>
        </div>
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
          {embedded ? null : (
            <Link href={PFQ_LEARN_HREF} className={stampCtaSecondary}>
              Coverage map
            </Link>
          )}
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
          {isFreeSample
            ? `Free sample · untimed · ${answered} checked`
            : `LO${objective} · untimed · ${answered} checked`}
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
            <PfqTip tip={feedback.tip} />
            {!feedback.correct
              ? (() => {
                  const callout = resolveTrapCallout(current.traps);
                  return callout ? <PfqTrapCallout callout={callout} /> : null;
                })()
              : null}
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
              disabled={pending}
              aria-busy={pending}
              onClick={() => next()}
            >
              {pending ? (
                <Spinner variant="bars" size={16} className="text-current" />
              ) : index + 1 >= questions.length ? (
                "Finish"
              ) : (
                "Next question"
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
