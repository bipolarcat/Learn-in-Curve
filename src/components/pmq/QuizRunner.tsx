"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { submitQuizAttempt } from "@/lib/pmq/actions";
import { Spinner } from "@/components/ui/spinner";
import {
  InlineDropdownResponseFields,
  McqResponseFields,
} from "@/components/pmq/QuestionResponseFields";
import { showCheckAnswerHint } from "@/components/pmq/CheckAnswerHint";
import styles from "@/components/pmq/PracticeQuiz.module.css";
import type { PmqQuestion } from "@/types/pmq";

type QuizSubmitSuccess = {
  ok: true;
  xpAwarded: number;
  totalXp: number;
  currentStreak: number;
};

function isGamifiedResult(
  result: Awaited<ReturnType<typeof submitQuizAttempt>>,
): result is QuizSubmitSuccess {
  return result.ok === true && "totalXp" in result;
}

type AttemptContext = string;

export type QuizPriorAttempt = {
  submittedAnswer: string | Record<string, string>;
  isCorrect: boolean | null;
};

type QuizRunnerProps = {
  questions: PmqQuestion[];
  loNumber: number;
  loCode: string;
  initialXp?: number;
  initialStreak?: number;
  checkpointTotal?: number;
  attemptContext?: AttemptContext;
  /** Active set index — used for aria (heading lives on Practise stage). */
  setNumber?: number;
  /** @deprecated Use setNumber. */
  title?: string;
  /** Prior one-shot attempts — answered questions stay locked for review. */
  priorAttempts?: Record<string, QuizPriorAttempt>;
  onXpGained?: (amount: number) => void;
  defaultExpanded?: boolean;
  /** Inside Practise glass panel — no nested card chrome. */
  embedded?: boolean;
};

type XpResponse = {
  xpAwarded: number;
  totalXp: number;
  currentStreak: number;
};

/** Max XP a question can award (mirrors computeXpAwarded in actions.ts). */
export function questionMaxXp(question: PmqQuestion): number {
  if (
    question.question_type === "multiple_choice" ||
    question.question_type === "select_from_list"
  ) {
    return 10;
  }
  if (
    question.question_type === "long_answer" ||
    question.question_type === "short_answer"
  ) {
    return 2;
  }
  return 0;
}

export function setMaxXp(questions: PmqQuestion[]): number {
  return questions.reduce((sum, q) => sum + questionMaxXp(q), 0);
}

function normalizeDropdownAnswer(
  value: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, v.trim().toLowerCase()]),
  );
}

function dropdownIsCorrect(
  submitted: Record<string, string>,
  correct: Record<string, string> | null,
): boolean {
  if (!correct) return false;
  const a = normalizeDropdownAnswer(submitted);
  const b = normalizeDropdownAnswer(correct as Record<string, string>);
  return Object.keys(b).every((key) => a[key] === b[key]);
}

function blankIsCorrect(
  key: string,
  submitted: Record<string, string>,
  correct: Record<string, string> | null,
): boolean {
  if (!correct?.[key]) return false;
  return (
    (submitted[key] ?? "").trim().toLowerCase() ===
    String(correct[key]).trim().toLowerCase()
  );
}

/**
 * Dropdown questions can have more than one blank (this app currently only
 * ships 2). A single pass/fail "Not quite" was misleading when one blank
 * was right and the other wrong — it read as "both wrong." This gives each
 * outcome its own message instead of collapsing partial credit into a
 * blanket fail. No em dashes per Sim's request 2026-07-30.
 */
function dropdownFeedbackMessage(
  question: PmqQuestion,
  submitted: Record<string, string>,
  correct: Record<string, string> | null,
): string {
  const correctKeys = Object.keys(correct ?? {});
  const total = correctKeys.length;
  if (total === 0) return "Already answered.";
  const correctCount = correctKeys.filter((key) =>
    blankIsCorrect(key, submitted, correct),
  ).length;
  if (correctCount === total) {
    return `Correct. ${question.explanation ?? "Nice work."}`;
  }
  if (correctCount === 0) {
    return `Not quite. ${question.explanation ?? "Review and try the next one."}`;
  }
  return `${correctCount} of ${total} correct. ${question.explanation ?? "Review and try the next one."}`;
}

function feedbackFromAttempt(
  question: PmqQuestion,
  isCorrect: boolean | null,
): string {
  if (question.question_type === "long_answer" || question.question_type === "short_answer") {
    return "";
  }
  if (isCorrect === true) {
    return `Correct — ${question.explanation ?? "Nice work."}`;
  }
  if (isCorrect === false) {
    return `Not quite — ${question.explanation ?? "Review and try the next one."}`;
  }
  return "Already answered.";
}

function CheckAnswerBar({
  canCheck,
  pending,
  onCheck,
  emptyHint,
}: {
  canCheck: boolean;
  pending: boolean;
  onCheck: (el: HTMLElement) => void;
  emptyHint: "mcq" | "dropdown";
}) {
  return (
    <div className={styles.checkRow}>
      <button
        type="button"
        disabled={pending}
        onClick={(e) => {
          if (!canCheck) {
            showCheckAnswerHint(emptyHint);
            return;
          }
          onCheck(e.currentTarget);
        }}
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
  );
}

function McqQuestion({
  question,
  loNumber,
  loCode,
  checkpointTotal,
  attemptContext,
  onXpAwarded,
  onAnswered,
  priorAttempt,
  questionNumber,
  questionTotal,
}: {
  question: PmqQuestion;
  loNumber: number;
  loCode: string;
  checkpointTotal?: number;
  attemptContext?: AttemptContext;
  onXpAwarded: (result: XpResponse, el: HTMLElement) => void;
  onAnswered: (attempt: QuizPriorAttempt) => void;
  priorAttempt?: QuizPriorAttempt;
  questionNumber: number;
  questionTotal: number;
}) {
  const lockedIn = Boolean(priorAttempt);
  const priorLetter =
    typeof priorAttempt?.submittedAnswer === "string"
      ? priorAttempt.submittedAnswer
      : null;

  const [selected, setSelected] = useState<string | null>(() => priorLetter);
  const [submitted, setSubmitted] = useState(lockedIn);
  const [feedback, setFeedback] = useState(() =>
    lockedIn
      ? feedbackFromAttempt(question, priorAttempt?.isCorrect ?? null)
      : "",
  );
  const [saveError, setSaveError] = useState("");
  const [saveErrorCode, setSaveErrorCode] = useState("");
  const [pending, startTransition] = useTransition();
  const lockRef = useRef(lockedIn);

  const options = (question.options as string[]) ?? [];
  const correctLetter = (question.correct_answer as string) ?? "";

  const handleSelect = (letter: string) => {
    if (submitted || pending || lockRef.current) return;
    setSelected(letter);
  };

  const handleCheck = (el: HTMLElement) => {
    if (submitted || pending || lockRef.current || !selected) return;
    lockRef.current = true;

    const isCorrect = selected === correctLetter;
    setSubmitted(true);
    setFeedback(
      isCorrect
        ? `Correct — ${question.explanation ?? "Nice work."}`
        : `Not quite — ${question.explanation ?? "Review and try the next one."}`,
    );
    onAnswered({ submittedAnswer: selected, isCorrect });

    const persist = async () => {
      setSaveError("");
      const result = await submitQuizAttempt({
        questionId: question.id,
        courseId: question.course_id,
        learningObjective: loCode,
        submittedAnswer: selected,
        isCorrect,
        loNumber,
        checkpointTotal,
        context: attemptContext,
      });
      if (result && "error" in result && result.error === "already_attempted") {
        return;
      }
      if (result && "error" in result && result.error === "not_signed_in") {
        setSaveErrorCode("not_signed_in");
        setSaveError(
          "Your session expired, so this answer wasn’t saved. Sign in again to keep going.",
        );
        return;
      }
      if (result && "error" in result) {
        setSaveError("Your answer is shown, but it wasn’t saved.");
        return;
      }
      if (isGamifiedResult(result)) {
        onXpAwarded(
          {
            xpAwarded: result.xpAwarded,
            totalXp: result.totalXp,
            currentStreak: result.currentStreak,
          },
          el,
        );
      }
    };
    startTransition(persist);
  };

  return (
    <QuestionBody
      questionNumber={questionNumber}
      questionTotal={questionTotal}
      prompt={question.prompt}
      feedback={feedback}
      submitted={submitted}
    >
      <McqResponseFields
        options={options}
        value={selected ?? ""}
        disabled={submitted || pending}
        ariaLabel={`Question ${questionNumber} of ${questionTotal}`}
        onChange={handleSelect}
        getState={(letter) => {
          if (!submitted) return letter === selected ? "selected" : "default";
          if (letter === correctLetter) return "correct";
          if (letter === selected) return "incorrect";
          return "muted";
        }}
      />
      {!submitted ? (
        <CheckAnswerBar
          canCheck={Boolean(selected)}
          pending={pending}
          onCheck={handleCheck}
          emptyHint="mcq"
        />
      ) : null}
      {saveError ? (
        <div
          className="mt-3 flex flex-wrap items-center gap-3 font-body text-[12px] font-medium text-ink/55"
          role="alert"
        >
          <span>{saveError}</span>
          <button
            type="button"
            disabled={pending}
            onClick={(event) => {
              if (saveErrorCode === "not_signed_in") {
                window.location.reload();
                return;
              }
              const answer = selected;
              if (!answer) return;
              setSaveError("");
              startTransition(async () => {
                const result = await submitQuizAttempt({
                  questionId: question.id,
                  courseId: question.course_id,
                  learningObjective: loCode,
                  submittedAnswer: answer,
                  isCorrect: answer === correctLetter,
                  loNumber,
                  checkpointTotal,
                  context: attemptContext,
                });
                if (result && "error" in result && result.error === "not_signed_in") {
                  setSaveErrorCode("not_signed_in");
                  setSaveError(
                    "Your session expired, so this answer wasn’t saved. Sign in again to keep going.",
                  );
                } else if (result && "error" in result && result.error !== "already_attempted") {
                  setSaveError("Still couldn’t save. Check your connection and retry.");
                }
              });
            }}
            className="min-h-11 font-semibold text-teal underline underline-offset-2 sm:min-h-0"
            aria-busy={pending}
            aria-label={
              pending
                ? "Retrying save"
                : saveErrorCode === "not_signed_in"
                  ? "Reload to sign in"
                  : "Retry save"
            }
          >
            {pending ? (
              <Spinner variant="bars" size={14} className="inline text-teal" aria-hidden />
            ) : saveErrorCode === "not_signed_in" ? (
              "Reload to sign in"
            ) : (
              "Retry save"
            )}
          </button>
        </div>
      ) : null}
    </QuestionBody>
  );
}

function DropdownQuestion({
  question,
  loNumber,
  loCode,
  checkpointTotal,
  attemptContext,
  onXpAwarded,
  onAnswered,
  priorAttempt,
  questionNumber,
  questionTotal,
}: {
  question: PmqQuestion;
  loNumber: number;
  loCode: string;
  checkpointTotal?: number;
  attemptContext?: AttemptContext;
  onXpAwarded: (result: XpResponse, el: HTMLElement) => void;
  onAnswered: (attempt: QuizPriorAttempt) => void;
  priorAttempt?: QuizPriorAttempt;
  questionNumber: number;
  questionTotal: number;
}) {
  const dropdowns = (question.options as Record<string, string[]>) ?? {};
  const keys = Object.keys(dropdowns).sort();
  const lockedIn = Boolean(priorAttempt);
  const priorValues =
    priorAttempt?.submittedAnswer &&
    typeof priorAttempt.submittedAnswer === "object" &&
    !Array.isArray(priorAttempt.submittedAnswer)
      ? (priorAttempt.submittedAnswer as Record<string, string>)
      : null;

  const [values, setValues] = useState<Record<string, string>>(() =>
    priorValues
      ? { ...Object.fromEntries(keys.map((k) => [k, ""])), ...priorValues }
      : Object.fromEntries(keys.map((k) => [k, ""])),
  );
  const [submitted, setSubmitted] = useState(lockedIn);
  const correct = question.correct_answer as Record<string, string>;
  const [feedback, setFeedback] = useState(() =>
    lockedIn
      ? priorValues
        ? dropdownFeedbackMessage(question, priorValues, correct)
        : feedbackFromAttempt(question, priorAttempt?.isCorrect ?? null)
      : "",
  );
  const [saveError, setSaveError] = useState("");
  const [saveErrorCode, setSaveErrorCode] = useState("");
  const [pending, startTransition] = useTransition();
  const lockRef = useRef(lockedIn);

  const isComplete = (nextValues: Record<string, string>) =>
    keys.every((k) => nextValues[k]);

  const revealAnswer = (nextValues: Record<string, string>, el: HTMLElement) => {
    if (submitted || pending || lockRef.current) return;
    if (!isComplete(nextValues)) return;

    lockRef.current = true;
    const isCorrect = dropdownIsCorrect(nextValues, correct);
    setSubmitted(true);
    setFeedback(dropdownFeedbackMessage(question, nextValues, correct));
    onAnswered({ submittedAnswer: nextValues, isCorrect });

    startTransition(async () => {
      setSaveError("");
      const result = await submitQuizAttempt({
        questionId: question.id,
        courseId: question.course_id,
        learningObjective: loCode,
        submittedAnswer: nextValues,
        isCorrect,
        loNumber,
        checkpointTotal,
        context: attemptContext,
      });
      if (result && "error" in result && result.error === "already_attempted") {
        return;
      }
      if (result && "error" in result && result.error === "not_signed_in") {
        setSaveErrorCode("not_signed_in");
        setSaveError(
          "Your session expired, so this answer wasn’t saved. Sign in again to keep going.",
        );
        return;
      }
      if (result && "error" in result) {
        setSaveError("Your answer is shown, but it wasn’t saved.");
        return;
      }
      if (isGamifiedResult(result)) {
        onXpAwarded(
          {
            xpAwarded: result.xpAwarded,
            totalXp: result.totalXp,
            currentStreak: result.currentStreak,
          },
          el,
        );
      }
    });
  };

  const pickOption = (key: string, opt: string) => {
    if (submitted || pending || lockRef.current) return;
    setValues((prev) => ({ ...prev, [key]: opt }));
  };

  return (
    <QuestionBody
      questionNumber={questionNumber}
      questionTotal={questionTotal}
      feedback={feedback}
      submitted={submitted}
      hidePrompt
    >
      <InlineDropdownResponseFields
        prompt={question.prompt}
        options={dropdowns}
        values={values}
        disabled={submitted || pending}
        questionNumber={questionNumber}
        questionTotal={questionTotal}
        onChange={pickOption}
        getState={(key) => {
          if (!submitted) return values[key] ? "selected" : "default";
          return blankIsCorrect(key, values, correct) ? "correct" : "incorrect";
        }}
      />
      {!submitted ? (
        <CheckAnswerBar
          canCheck={isComplete(values)}
          pending={pending}
          onCheck={(el) => revealAnswer(values, el)}
          emptyHint="dropdown"
        />
      ) : null}
      {saveError ? (
        <div
          className="mt-3 flex flex-wrap items-center gap-3 font-body text-[12px] font-medium text-ink/55"
          role="alert"
        >
          <span>{saveError}</span>
          <button
            type="button"
            disabled={pending}
            onClick={(event) => {
              if (saveErrorCode === "not_signed_in") {
                window.location.reload();
                return;
              }
              const target = event.currentTarget;
              setSaveError("");
              startTransition(async () => {
                const isCorrect = dropdownIsCorrect(values, correct);
                const result = await submitQuizAttempt({
                  questionId: question.id,
                  courseId: question.course_id,
                  learningObjective: loCode,
                  submittedAnswer: values,
                  isCorrect,
                  loNumber,
                  checkpointTotal,
                  context: attemptContext,
                });
                if (result && "error" in result && result.error === "not_signed_in") {
                  setSaveErrorCode("not_signed_in");
                  setSaveError(
                    "Your session expired, so this answer wasn’t saved. Sign in again to keep going.",
                  );
                } else if (result && "error" in result && result.error !== "already_attempted") {
                  setSaveError("Still couldn’t save. Check your connection and retry.");
                } else if (isGamifiedResult(result)) {
                  onXpAwarded(
                    {
                      xpAwarded: result.xpAwarded,
                      totalXp: result.totalXp,
                      currentStreak: result.currentStreak,
                    },
                    target,
                  );
                }
              });
            }}
            className="min-h-11 font-semibold text-teal underline underline-offset-2 sm:min-h-0"
            aria-busy={pending}
            aria-label={
              pending
                ? "Retrying save"
                : saveErrorCode === "not_signed_in"
                  ? "Reload to sign in"
                  : "Retry save"
            }
          >
            {pending ? (
              <Spinner variant="bars" size={14} className="inline text-teal" aria-hidden />
            ) : saveErrorCode === "not_signed_in" ? (
              "Reload to sign in"
            ) : (
              "Retry save"
            )}
          </button>
        </div>
      ) : null}
    </QuestionBody>
  );
}

function RevealAnswerQuestion({
  question,
  loNumber,
  loCode,
  checkpointTotal,
  attemptContext,
  onXpAwarded,
  onAnswered,
  priorAttempt,
  questionNumber,
  questionTotal,
}: {
  question: PmqQuestion;
  loNumber: number;
  loCode: string;
  checkpointTotal?: number;
  attemptContext?: AttemptContext;
  onXpAwarded: (result: XpResponse, el: HTMLElement) => void;
  onAnswered: (attempt: QuizPriorAttempt) => void;
  priorAttempt?: QuizPriorAttempt;
  questionNumber: number;
  questionTotal: number;
}) {
  const lockedIn = Boolean(priorAttempt);
  const [revealed, setRevealed] = useState(lockedIn);
  const [pending, startTransition] = useTransition();

  const handleReveal = useCallback(
    (btn: HTMLButtonElement) => {
      if (revealed) return;
      setRevealed(true);
      onAnswered({ submittedAnswer: "revealed", isCorrect: null });
      startTransition(async () => {
        const result = await submitQuizAttempt({
          questionId: question.id,
          courseId: question.course_id,
          learningObjective: loCode,
          submittedAnswer: "revealed",
          isCorrect: null,
          loNumber,
          checkpointTotal,
          context: attemptContext,
        });
        if (result && "error" in result && result.error === "already_attempted") {
          return;
        }
        if (isGamifiedResult(result)) {
          onXpAwarded(
            {
              xpAwarded: result.xpAwarded,
              totalXp: result.totalXp,
              currentStreak: result.currentStreak,
            },
            btn,
          );
        }
      });
    },
    [
      revealed,
      question,
      loCode,
      loNumber,
      checkpointTotal,
      attemptContext,
      onXpAwarded,
      onAnswered,
    ],
  );

  return (
    <QuestionBody
      questionNumber={questionNumber}
      questionTotal={questionTotal}
      prompt={question.prompt}
      submitted={revealed}
      feedback=""
    >
      <button
        type="button"
        onClick={(e) => handleReveal(e.currentTarget)}
        disabled={revealed || pending}
        className={styles.revealBtn}
      >
        {revealed ? "Model answer shown" : "Show model answer"}
      </button>
      {revealed && question.model_answer ? (
        <div className={styles.modelAnswer}>
          <p>{question.model_answer}</p>
          {question.marking_guide ? (
            <p className={styles.markingGuide}>
              Marking guide: {question.marking_guide}
            </p>
          ) : null}
        </div>
      ) : null}
    </QuestionBody>
  );
}

function QuestionBody({
  questionNumber,
  questionTotal,
  children,
  feedback,
  hidePrompt = false,
  prompt,
}: {
  questionNumber: number;
  questionTotal: number;
  children: ReactNode;
  feedback?: string;
  submitted?: boolean;
  hidePrompt?: boolean;
  prompt?: string;
}) {
  return (
    <div className="w-full min-w-0">
      {!hidePrompt && prompt ? (
        <p id="quiz-q" className={styles.prompt}>
          <span className="sr-only">
            Question {questionNumber} of {questionTotal}.{" "}
          </span>
          {prompt}
        </p>
      ) : null}
      {children}
      {feedback ? (
        <p className={styles.feedback} aria-live="polite">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One question at a time. Answered questions stay locked for review
 * (selection + feedback visible, not editable). Navigate freely among
 * completed questions and the current frontier — never skip ahead unanswered.
 */
export function QuizRunner({
  questions,
  loNumber,
  loCode,
  checkpointTotal = 0,
  attemptContext = "practice_quiz",
  setNumber,
  title,
  priorAttempts = {},
  onXpGained,
  embedded = false,
}: QuizRunnerProps) {
  const router = useRouter();
  const questionTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const setLabel =
    setNumber != null ? `Quiz set ${setNumber}` : (title ?? "Practice quiz");

  const [sessionAttempts, setSessionAttempts] = useState<
    Record<string, QuizPriorAttempt>
  >({});
  const attempts = { ...priorAttempts, ...sessionAttempts };

  const initialCompleted = questions.map((q) => Boolean(attempts[q.id]));
  const firstOpen = initialCompleted.findIndex((done) => !done);
  const startIndex =
    firstOpen === -1
      ? Math.max(0, questions.length - 1)
      : firstOpen;

  const [qi, setQi] = useState(startIndex);
  const [completed, setCompleted] = useState<boolean[]>(() => initialCompleted);

  const question = questions[qi];
  const completedCount = completed.filter(Boolean).length;
  const allDone = questions.length > 0 && completedCount === questions.length;
  const isLast = qi >= questions.length - 1;
  /** Furthest index reachable: first unanswered, or last if set complete. */
  const maxReachable =
    completed.findIndex((done) => !done) === -1
      ? questions.length - 1
      : completed.findIndex((done) => !done);
  const canGoPrev = qi > 0;
  const canGoNext = qi < maxReachable;
  const priorAttempt = question ? attempts[question.id] : undefined;

  const handleXpAwarded = useCallback(
    (result: XpResponse, _el: HTMLElement) => {
      onXpGained?.(result.xpAwarded);
      router.refresh();
    },
    [router, onXpGained],
  );

  const markAnswered = useCallback(
    (attempt: QuizPriorAttempt) => {
      if (!question) return;
      setSessionAttempts((prev) => ({ ...prev, [question.id]: attempt }));
      setCompleted((prev) => {
        const next = [...prev];
        next[qi] = true;
        return next;
      });
    },
    [qi, question],
  );

  const goTo = (index: number) => {
    if (index < 0 || index > maxReachable) return;
    setQi(index);
  };

  const moveQuestionTab = (index: number) => {
    goTo(index);
    requestAnimationFrame(() => questionTabRefs.current[index]?.focus());
  };

  const handleQuestionTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
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
    moveQuestionTab(nextIndex);
  };

  if (!question) {
    return null;
  }

  const shared = {
    question,
    loNumber,
    loCode,
    checkpointTotal,
    attemptContext,
    onXpAwarded: handleXpAwarded,
    onAnswered: markAnswered,
    priorAttempt,
    questionNumber: qi + 1,
    questionTotal: questions.length,
  };

  const renderQuestionTab = (q: PmqQuestion, idx: number) => {
    const reachable = idx <= maxReachable;
    const done = completed[idx];
    const current = idx === qi;
    const result = done ? (attempts[q.id]?.isCorrect ?? null) : undefined;
    const resultLabel =
      result === true
        ? "correct"
        : result === false
          ? "incorrect"
          : result === null
            ? "reviewed"
            : null;

    const cellClass = [
      styles.qCell,
      current ? styles.qCellCurrent : "",
      !current && result === true ? styles.qCellCorrect : "",
      !current && result === false ? styles.qCellIncorrect : "",
      !current && done && result == null ? styles.qCellDone : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        key={q.id}
        type="button"
        role="tab"
        ref={(element) => {
          questionTabRefs.current[idx] = element;
        }}
        id={`quiz-question-tab-${idx + 1}`}
        aria-controls="quiz-question-panel"
        aria-selected={current}
        tabIndex={current ? 0 : -1}
        aria-label={
          resultLabel
            ? `Q${idx + 1}, ${resultLabel}${current ? ", current" : " — review"}`
            : current
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
  };

  /** Single compact row — scrolls horizontally if the set is long. */
  return (
    <div
      className={
        embedded
          ? styles.runner
          : `${styles.runner} overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_18px_rgb(var(--ink-rgb)_/_0.05)]`
      }
      aria-label={setLabel}
    >
      <div className={styles.qRail}>
        <div
          className={styles.qGrid}
          role="tablist"
          aria-label={`Questions in ${setLabel}`}
          style={{ ["--quiz-total" as string]: questions.length }}
        >
          {questions.map((q, idx) => renderQuestionTab(q, idx))}
        </div>
      </div>

      <div
        id="quiz-question-panel"
        role="tabpanel"
        aria-labelledby={`quiz-question-tab-${qi + 1}`}
        className={styles.questionPanel}
      >
        {question.question_type === "multiple_choice" ? (
          <McqQuestion key={question.id} {...shared} />
        ) : question.question_type === "select_from_list" ? (
          <DropdownQuestion key={question.id} {...shared} />
        ) : (
          <RevealAnswerQuestion key={question.id} {...shared} />
        )}

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
