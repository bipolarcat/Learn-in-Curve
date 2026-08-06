"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { McqResponseFields } from "@/components/pmq/QuestionResponseFields";
import { showCheckAnswerHint } from "@/components/pmq/CheckAnswerHint";
import { PmqStartLink } from "@/components/PmqStartLink";
import { stampCtaPrimary } from "@/components/stamp-chip";
import styles from "@/components/pmq/PracticeQuiz.module.css";

/**
 * Three real questions from the live bank, verified 2026-07-31. Copied here on
 * purpose: `QuizRunner` requires auth and writes an attempt row through the
 * `submitQuizAttempt` server action, so it cannot run for a guest.
 *
 * `correct` is a letter to match the real bank's `correct_answer` shape.
 */
export const TRIAL_QUESTIONS = [
  {
    id: "Q20",
    lo: "LO1",
    prompt:
      "You are PM on a long, complex vehicle manufacturing project where the full set of requirements is still being developed. Which life cycle is NOT suitable?",
    options: ["Extended", "Linear", "Iterative", "Hybrid"],
    correct: "B",
    explanation:
      "Linear assumes scope is fixed upfront. With requirements still evolving, iterative or hybrid is preferable.",
  },
  {
    id: "Q22",
    lo: "LO4",
    prompt:
      "A sponsor asks you to review the business case daily. As project manager, what is the most appropriate response?",
    options: [
      "Agree and produce a daily report.",
      "Refuse on the basis that the business case is fixed.",
      "Propose review at decision gates and a periodic interval (e.g. monthly), explaining that daily review will slow delivery without proportionate benefit.",
      "Delegate the daily review to the PMO.",
    ],
    correct: "C",
    explanation:
      "Reviews should be tied to decision gates and a proportionate periodic rhythm. Daily review is disproportionate; refusing or delegating misses the sponsor's underlying concern.",
  },
  {
    id: "Q13",
    lo: "LO21",
    prompt:
      "Your project has a strict completion date that cannot change. Which resource optimisation technique is most appropriate?",
    options: [
      "Resource smoothing",
      "Resource levelling",
      "Project scheduling",
      "Resource allocation",
    ],
    correct: "A",
    explanation:
      "Smoothing protects the end date by adjusting resource demand within float. Levelling would extend the end date; the other options are general activities, not named techniques.",
  },
] as const;

type TrialQuizProps = {
  isSignedIn: boolean;
};

type Attempt = { letter: string; isCorrect: boolean };

/**
 * Guest taster of the real practice console.
 *
 * Deliberately shares `PracticeQuiz.module.css` with `PracticeQuizSection` /
 * `QuizRunner` so a visitor sees the actual product chrome rather than a
 * marketing approximation of it. Local state only — no fetch, no server
 * action, no DB write. No XP display — XP is being removed from the product
 * (2026-07-31), so this taster shouldn't advertise a mechanic that's on its
 * way out.
 */
export function TrialQuiz({ isSignedIn }: TrialQuizProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});

  const total = TRIAL_QUESTIONS.length;
  const question = TRIAL_QUESTIONS[qi];
  const attempt = attempts[question.id];
  const answeredCount = Object.keys(attempts).length;
  const allDone = answeredCount === total;

  /** Never skip ahead: the frontier is the first unanswered question. */
  const maxReachable = TRIAL_QUESTIONS.findIndex((q) => !attempts[q.id]);
  const frontier = maxReachable === -1 ? total - 1 : maxReachable;
  const canGoPrev = qi > 0;
  const canGoNext = qi < frontier;

  const goTo = (index: number) => {
    if (index < 0 || index > frontier) return;
    setQi(index);
    setSelected(null);
  };

  const handleCheck = () => {
    if (!selected || attempt) return;
    setAttempts((prev) => ({
      ...prev,
      [question.id]: {
        letter: selected,
        isCorrect: selected === question.correct,
      },
    }));
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = index >= frontier ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = index <= 0 ? frontier : index - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = frontier;
    }
    if (next == null) return;
    event.preventDefault();
    goTo(next);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  };

  const feedback = attempt
    ? attempt.isCorrect
      ? `Correct — ${question.explanation}`
      : `Not quite — ${question.explanation}`
    : "";

  return (
    <section className={styles.card} aria-labelledby="trial-quiz-title">
      <div className="mb-1 text-left">
        <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-orange">
          Practice questions
        </p>
        <h2
          id="trial-quiz-title"
          className="m-0 mt-1.5 text-balance font-display text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[1.75rem]"
        >
          Give it a try.
        </h2>
      </div>

      <div className={styles.body}>
        <div className={styles.runner} aria-label="Sample quiz">
          <div className={styles.qRail}>
            <div
              className={styles.qGrid}
              role="tablist"
              aria-label="Questions in this sample"
              style={{ ["--quiz-total" as string]: total }}
            >
              {TRIAL_QUESTIONS.map((q, index) => {
                const done = attempts[q.id];
                const current = index === qi;
                const cellClass = [
                  styles.qCell,
                  current ? styles.qCellCurrent : "",
                  !current && done?.isCorrect === true ? styles.qCellCorrect : "",
                  !current && done?.isCorrect === false
                    ? styles.qCellIncorrect
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={q.id}
                    type="button"
                    role="tab"
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    id={`trial-quiz-tab-${index + 1}`}
                    aria-controls="trial-quiz-panel"
                    aria-selected={current}
                    tabIndex={current ? 0 : -1}
                    aria-label={
                      done
                        ? `Q${index + 1}, ${done.isCorrect ? "correct" : "incorrect"}${current ? ", current" : " — review"}`
                        : current
                          ? `Q${index + 1}, current`
                          : `Q${index + 1}${index <= frontier ? "" : ", locked"}`
                    }
                    disabled={index > frontier}
                    onClick={() => goTo(index)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    className={cellClass}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id="trial-quiz-panel"
            role="tabpanel"
            aria-labelledby={`trial-quiz-tab-${qi + 1}`}
            className={styles.questionPanel}
          >
            <p className={styles.prompt}>
              <span className="sr-only">
                Question {qi + 1} of {total}.{" "}
              </span>
              {question.prompt}
            </p>

            <McqResponseFields
              options={[...question.options]}
              value={attempt?.letter ?? selected ?? ""}
              disabled={Boolean(attempt)}
              ariaLabel={`Question ${qi + 1} of ${total}`}
              onChange={setSelected}
              getState={(letter) => {
                if (!attempt) {
                  return letter === selected ? "selected" : "default";
                }
                if (letter === question.correct) return "correct";
                if (letter === attempt.letter) return "incorrect";
                return "muted";
              }}
            />

            {!attempt ? (
              <div className={styles.checkRow}>
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) {
                      showCheckAnswerHint("mcq");
                      return;
                    }
                    handleCheck();
                  }}
                  className={styles.checkBtn}
                >
                  Check answer
                </button>
              </div>
            ) : null}

            {feedback ? (
              <p className={styles.feedback} aria-live="polite">
                {feedback}
              </p>
            ) : null}

            {allDone ? (
              <div className="mt-5 border-t border-dashed border-ink/15 pt-4">
                <p className="m-0 font-body text-[14px] font-medium leading-snug text-ink text-pretty">
                  That&apos;s the taster. The full course is free.
                </p>
                <div className="mt-3.5">
                  <PmqStartLink
                    isSignedIn={isSignedIn}
                    from="home"
                    className={stampCtaPrimary}
                  >
                    Start free with APM PMQ
                  </PmqStartLink>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
