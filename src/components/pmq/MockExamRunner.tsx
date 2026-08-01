"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  finalizeMockExam,
  getFinalizedMockReview,
  setMockCurrentQuestion,
  startMockExamSession,
  startMockPartTwo,
  submitMockAttempt,
  submitMockPart,
  toggleMockQuestionFlag,
} from "@/lib/pmq/mock-actions";
import {
  formatExamTime,
  overallSecondsRemaining,
  partDurationMinutes,
} from "@/lib/pmq/mock-domain";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import {
  InlineDropdownResponseFields,
  McqResponseFields,
} from "@/components/pmq/QuestionResponseFields";
import {
  productSurface,
} from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { Flag } from "lucide-react";
import styles from "@/components/pmq/MockExamRunner.module.css";
import type {
  ExamSession,
  MockAttempt,
  MockExamConfig,
  MockExamReview,
  MockExamSet,
  MockExamTier,
  PublicMockQuestion,
} from "@/types/pmq";

type Phase = "start" | "exam" | "break" | "grading" | "results";
type Answer = string | Record<string, string>;

type Props = {
  tier: MockExamTier;
  examSet: MockExamSet;
  mockConfig: MockExamConfig;
  questions: PublicMockQuestion[];
  activeSession: ExamSession | null;
  initialAttempts: MockAttempt[];
  initialFlags: string[];
  isDemo: boolean;
  /** Push live overall remaining + part into the course sub-header. */
  onTimerMeta?: (meta: {
    phase: Phase;
    overallRemaining: number;
    currentPart: 1 | 2;
  }) => void;
};

function secondsUntil(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

function attemptsToAnswers(attempts: MockAttempt[]): Map<string, Answer> {
  return new Map(
    attempts.flatMap((attempt) =>
      attempt.submitted_answer == null
        ? []
        : [[attempt.question_id, attempt.submitted_answer]],
    ),
  );
}

function answerIsComplete(question: PublicMockQuestion, answer?: Answer): boolean {
  if (question.question_type === "select_from_list") {
    if (!answer || typeof answer !== "object") return false;
    const options = (question.options as Record<string, string[]>) ?? {};
    return Object.keys(options).every((key) => Boolean(answer[key]?.trim()));
  }
  return typeof answer === "string" && answer.trim().length > 0;
}

function initialPhase(session: ExamSession | null): Phase {
  if (!session) return "start";
  if (session.status === "break") return "break";
  // Defensive: any pre-launch session stuck in the old self-assessing status
  // just resumes into the grading phase (finalize is idempotent).
  if (session.status === "self_assessing") return "grading";
  if (session.status === "grading") return "grading";
  // "abandoned" covers both a manual abandon and a break that timed out
  // (see expireBreakIfNeeded in mock-domain.ts) — either way there's no
  // submission to continue, so route into the same read-only Results view
  // used for finalized exams rather than falling through to "exam" and
  // letting the user keep answering a closed-out session.
  if (session.status === "finalized" || session.status === "abandoned")
    return "results";
  return "exam";
}

function initialQuestionIndex(
  questions: PublicMockQuestion[],
  session: ExamSession | null,
  attempts: MockAttempt[],
): number {
  if (session?.current_question_id) {
    const persisted = questions.findIndex(
      (question) => question.id === session.current_question_id,
    );
    if (persisted >= 0) return persisted;
  }
  const part = session?.current_part ?? 1;
  const answered = new Set(attempts.map((attempt) => attempt.question_id));
  const firstUnanswered = questions.findIndex(
    (question) => question.part === part && !answered.has(question.id),
  );
  if (firstUnanswered >= 0) return firstUnanswered;
  return Math.max(
    0,
    questions.findIndex((question) => question.part === part),
  );
}

export function MockExamRunner({
  tier,
  examSet,
  mockConfig,
  questions,
  activeSession,
  initialAttempts,
  initialFlags,
  isDemo,
  onTimerMeta,
}: Props) {
  const [phase, setPhase] = useState<Phase>(() => initialPhase(activeSession));
  const [sessionId, setSessionId] = useState(activeSession?.id ?? null);
  const [currentPart, setCurrentPart] = useState<1 | 2>(
    activeSession?.current_part ?? 1,
  );
  const [deadlineAt, setDeadlineAt] = useState<string | null>(
    activeSession?.current_part === 2
      ? activeSession.part_2_deadline_at
      : activeSession?.part_1_deadline_at ?? activeSession?.deadline_at ?? null,
  );
  const [breakEndsAt, setBreakEndsAt] = useState(
    activeSession?.break_ends_at ?? null,
  );
  const [remaining, setRemaining] = useState(() => secondsUntil(deadlineAt));
  const [breakRemaining, setBreakRemaining] = useState(() =>
    secondsUntil(activeSession?.break_ends_at ?? null),
  );
  const [questionIndex, setQuestionIndex] = useState(() =>
    initialQuestionIndex(questions, activeSession, initialAttempts),
  );
  const [answers, setAnswers] = useState(() =>
    attemptsToAnswers(initialAttempts),
  );
  const [flags, setFlags] = useState(() => new Set(initialFlags));
  const [confirmPart, setConfirmPart] = useState<1 | 2 | null>(null);
  const [finalScore, setFinalScore] = useState(
    activeSession?.total_score ?? null,
  );
  const [passed, setPassed] = useState(activeSession?.passed ?? null);
  const [reviews, setReviews] = useState<MockExamReview[] | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [pending, startTransition] = useTransition();
  const [submittingPart, setSubmittingPart] = useState(false);
  const [startingPart2, setStartingPart2] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const expiryHandled = useRef(false);
  const breakHandled = useRef(false);
  const writtenSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = `Mock Exam ${examSet}`;
  const currentQuestion = questions[questionIndex];
  const partQuestions = useMemo(
    () => questions.filter((question) => question.part === currentPart),
    [currentPart, questions],
  );
  const partMinutes = partDurationMinutes(mockConfig);
  const overallRemaining = overallSecondsRemaining(
    currentPart,
    remaining,
    partMinutes,
  );

  useEffect(() => {
    onTimerMeta?.({ phase, overallRemaining, currentPart });
  }, [onTimerMeta, phase, overallRemaining, currentPart]);

  const reportError = useCallback((message: string) => {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  }, []);

  const applyFinalResult = useCallback(
    (result: { totalScore?: number; passed?: boolean }) => {
      setFinalScore(result.totalScore ?? 0);
      setPassed(result.passed ?? false);
      setPhase("results");
      setAnnouncement("Exam finalized. Results are ready.");
    },
    [],
  );

  const handleFinalizationResult = useCallback(
    async (
      result:
        | Awaited<ReturnType<typeof finalizeMockExam>>
        | Awaited<ReturnType<typeof submitMockPart>>,
    ) => {
      if ("error" in result && result.error) {
        reportError(result.error);
        setPhase("grading");
        return;
      }
      if ("totalScore" in result) applyFinalResult(result);
    },
    [applyFinalResult, reportError],
  );

  const finish = useCallback(() => {
    if (!sessionId) return;
    setError(null);
    setPhase("grading");
    startTransition(async () => {
      const result = await finalizeMockExam({ sessionId });
      await handleFinalizationResult(result);
    });
  }, [handleFinalizationResult, sessionId]);

  useEffect(() => {
    if (!deadlineAt || phase !== "exam") return;
    const tick = () => setRemaining(secondsUntil(deadlineAt));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [deadlineAt, phase]);

  useEffect(() => {
    if (!breakEndsAt || phase !== "break") return;
    const tick = () => setBreakRemaining(secondsUntil(breakEndsAt));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [breakEndsAt, phase]);

  const submitPartNow = useCallback(
    (part: 1 | 2) => {
      if (!sessionId || submittingPart) return;
      setError(null);
      setSubmittingPart(true);
      void (async () => {
        try {
          const result =
            isDemo && sessionId === "demo"
              ? part === 1
                ? {
                    ok: true as const,
                    breakEndsAt: new Date(
                      Date.now() + mockConfig.break_duration_minutes * 60_000,
                    ).toISOString(),
                  }
                : { ok: true as const, totalScore: 0, passed: false }
              : await submitMockPart({ sessionId, part });
          if ("error" in result && result.error) {
            reportError(result.error);
            return;
          }
          setConfirmPart(null);
          if (part === 1 && "breakEndsAt" in result) {
            setBreakEndsAt(result.breakEndsAt ?? null);
            setBreakRemaining(secondsUntil(result.breakEndsAt ?? null));
            setPhase("break");
            setAnnouncement("Part 1 submitted. Your optional break has started.");
            return;
          }
          setPhase("grading");
          await handleFinalizationResult(result);
        } finally {
          setSubmittingPart(false);
        }
      })();
    },
    [
      handleFinalizationResult,
      isDemo,
      mockConfig.break_duration_minutes,
      reportError,
      sessionId,
      submittingPart,
    ],
  );

  useEffect(() => {
    if (
      remaining === 0 &&
      deadlineAt &&
      phase === "exam" &&
      !expiryHandled.current
    ) {
      expiryHandled.current = true;
      setAnnouncement(`Part ${currentPart} time expired. Saved answers are locked.`);
      submitPartNow(currentPart);
    }
  }, [currentPart, deadlineAt, phase, remaining, submitPartNow]);

  const continueAfterBreak = useCallback(() => {
    if (!sessionId || startingPart2) return;
    setError(null);
    setStartingPart2(true);
    void (async () => {
      try {
        const result =
          isDemo && sessionId === "demo"
            ? {
                ok: true as const,
                deadlineAt: new Date(
                  Date.now() + partMinutes * 60_000,
                ).toISOString(),
              }
            : await startMockPartTwo(sessionId);
        if ("error" in result && result.error) {
          reportError(result.error);
          return;
        }
        const nextDeadline = result.deadlineAt ?? null;
        const firstPartTwoIndex = questions.findIndex(
          (question) => question.part === 2,
        );
        setCurrentPart(2);
        setQuestionIndex(Math.max(0, firstPartTwoIndex));
        setDeadlineAt(nextDeadline);
        setRemaining(secondsUntil(nextDeadline));
        expiryHandled.current = false;
        setPhase("exam");
        setAnnouncement("Part 2 started. Part 1 is locked.");
      } finally {
        setStartingPart2(false);
      }
    })();
  }, [
    isDemo,
    partMinutes,
    questions,
    reportError,
    sessionId,
    startingPart2,
  ]);

  useEffect(() => {
    if (
      phase === "break" &&
      breakEndsAt &&
      breakRemaining === 0 &&
      !breakHandled.current
    ) {
      breakHandled.current = true;
      continueAfterBreak();
    }
  }, [breakEndsAt, breakRemaining, continueAfterBreak, phase]);

  const begin = () => {
    setError(null);
    startTransition(async () => {
      const result = await startMockExamSession({ tier, examSet });
      if (result.error) {
        reportError(result.error);
        return;
      }
      if (result.status === "finalized") {
        window.location.reload();
        return;
      }
      const id = result.demo ? "demo" : (result.sessionId ?? null);
      const nextDeadline =
        result.deadlineAt ??
        new Date(Date.now() + partMinutes * 60_000).toISOString();
      setSessionId(id);
      setCurrentPart(1);
      setDeadlineAt(nextDeadline);
      setRemaining(secondsUntil(nextDeadline));
      setQuestionIndex(0);
      setAnswers(new Map());
      setFlags(new Set());
      setPhase("exam");
      setAnnouncement(`${title} started. This is your only attempt.`);
    });
  };

  const persistAnswer = useCallback(
    async (question: PublicMockQuestion, answer: Answer) => {
      if (!sessionId || !answerIsComplete(question, answer)) return true;
      if (isDemo && sessionId === "demo") return true;
      const result = await submitMockAttempt({
        sessionId,
        questionId: question.id,
        submittedAnswer: answer,
      });
      if ("error" in result && result.error) {
        if ("expired" in result && result.expired) {
          submitPartNow(currentPart);
        } else {
          reportError(result.error);
        }
        return false;
      }
      return true;
    },
    [currentPart, isDemo, reportError, sessionId, submitPartNow],
  );

  const updateAnswer = (answer: Answer) => {
    if (!currentQuestion) return;
    setAnswers((previous) => new Map(previous).set(currentQuestion.id, answer));
    if (writtenSaveTimer.current) clearTimeout(writtenSaveTimer.current);
    if (
      currentQuestion.question_type === "multiple_choice" ||
      currentQuestion.question_type === "select_from_list"
    ) {
      void persistAnswer(currentQuestion, answer);
    } else {
      writtenSaveTimer.current = setTimeout(() => {
        void persistAnswer(currentQuestion, answer);
      }, 700);
    }
  };

  useEffect(
    () => () => {
      if (writtenSaveTimer.current) clearTimeout(writtenSaveTimer.current);
    },
    [],
  );

  const goToQuestion = (
    nextIndex: number,
    options?: { scrollToTop?: boolean },
  ) => {
    const next = questions[nextIndex];
    if (!next || next.part !== currentPart || phase !== "exam") return;
    if (submittingPart) return;

    const fromQuestion = currentQuestion;
    const fromAnswer = fromQuestion
      ? answers.get(fromQuestion.id)
      : undefined;

    // Instant UI — persist in the background so exam nav never waits on the network.
    setQuestionIndex(nextIndex);
    setAnnouncement(`Question ${nextIndex + 1}.`);
    if (options?.scrollToTop) {
      requestAnimationFrame(() => {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top: 0,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      });
    }

    void (async () => {
      if (fromQuestion && fromAnswer) {
        await persistAnswer(fromQuestion, fromAnswer);
      }
      if (!(isDemo && sessionId === "demo") && sessionId) {
        const result = await setMockCurrentQuestion({
          sessionId,
          questionId: next.id,
        });
        if (result.error) reportError(result.error);
      }
    })();
  };

  const toggleFlag = () => {
    if (!currentQuestion || !sessionId) return;
    const flagged = !flags.has(currentQuestion.id);
    setFlags((previous) => {
      const next = new Set(previous);
      if (flagged) next.add(currentQuestion.id);
      else next.delete(currentQuestion.id);
      return next;
    });
    if (isDemo && sessionId === "demo") return;
    // Keep this off the shared `pending` transition — otherwise Submit/nav
    // briefly disable and flicker while the flag save round-trips.
    void toggleMockQuestionFlag({
      sessionId,
      questionId: currentQuestion.id,
      flagged,
    }).then((result) => {
      if (!result.error) return;
      setFlags((previous) => {
        const next = new Set(previous);
        if (flagged) next.delete(currentQuestion.id);
        else next.add(currentQuestion.id);
        return next;
      });
      reportError(result.error);
    });
  };

  const loadReview = () => {
    if (!sessionId) return;
    if (reviews) {
      setShowReview(true);
      return;
    }
    startTransition(async () => {
      const result = await getFinalizedMockReview(sessionId);
      if (result.error || !result.reviews) {
        reportError(result.error ?? "Could not load answer review.");
        return;
      }
      const ordered = [...result.reviews].sort(
        (a, b) => a.part - b.part || a.position - b.position,
      );
      setReviews(ordered);
      setReviewIndex(0);
      setShowReview(true);
    });
  };

  if (questions.length === 0) {
    return (
      <div className={`${productSurface} p-8 text-center`} role="status">
        Mock exam questions are not available.
      </div>
    );
  }

  const answeredInPart = partQuestions.filter((question) =>
    answerIsComplete(question, answers.get(question.id)),
  ).length;
  const flaggedInPart = partQuestions.filter((question) =>
    flags.has(question.id),
  ).length;

  return (
    <div className="relative">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {error ? (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mb-5 rounded-xl border border-rust/30 bg-rust/10 p-4 text-sm text-rust outline-none focus:ring-2 focus:ring-rust"
        >
          {error}
        </div>
      ) : null}

      {phase === "start" ? (
        <section
          className={styles.startCard}
          aria-labelledby="mock-exam-start-title"
        >
          <h1 id="mock-exam-start-title" className={styles.startTitle}>
            {title}
          </h1>
          <p className={styles.startMeta}>
            2 parts · 75 minutes each · optional 30-minute break
          </p>
          <p className={styles.startNotice}>
            You can leave and resume, but the timer keeps running. Starting uses
            your only attempt at this paper.
          </p>
          <button
            type="button"
            onClick={begin}
            disabled={pending}
            aria-busy={pending}
            aria-label={pending ? "Starting exam" : "Start Exam"}
            className={styles.startBtn}
          >
            {pending ? (
              <>
                <Spinner
                  variant="bars"
                  size={16}
                  className="text-current"
                  aria-hidden
                />
                Starting…
              </>
            ) : (
              "Start Exam"
            )}
          </button>
        </section>
      ) : null}

      {phase === "exam" && currentQuestion ? (
        <div className={styles.examStack}>
          <MockExamQuestionRail
            questions={questions}
            currentIndex={questionIndex}
            currentPart={currentPart}
            answers={answers}
            flags={flags}
            submitting={submittingPart}
            onSelect={goToQuestion}
            onSubmitPart={() => setConfirmPart(currentPart)}
          />
          <QuestionScreen
            question={currentQuestion}
            index={questionIndex}
            total={questions.length}
            answer={answers.get(currentQuestion.id)}
            flagged={flags.has(currentQuestion.id)}
            locked={submittingPart}
            onAnswerChange={updateAnswer}
            onToggleFlag={toggleFlag}
          />
          <div className={styles.navRow}>
            <button
              type="button"
              className={styles.navBtn}
              disabled={
                submittingPart ||
                questionIndex ===
                  questions.findIndex((q) => q.part === currentPart)
              }
              onClick={() => goToQuestion(questionIndex - 1)}
            >
              ← Previous
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnNext}`}
              disabled={
                submittingPart ||
                questionIndex ===
                  questions.findLastIndex((q) => q.part === currentPart)
              }
              onClick={() => goToQuestion(questionIndex + 1, { scrollToTop: true })}
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}

      {phase === "break" ? (
        <BreakScreen
          remaining={breakRemaining}
          pending={startingPart2}
          onContinue={continueAfterBreak}
        />
      ) : null}

      {phase === "grading" ? (
        <section
          className={styles.resultCard}
          aria-busy={pending}
          aria-labelledby="mock-grading-title"
        >
          {pending ? (
            <div
              className={styles.resultLoading}
              aria-label="Marking your exam"
            >
              <Spinner variant="bars" size={22} className="text-ink" />
              <p id="mock-grading-title" className={styles.resultBody}>
                Your answers are locked. Written responses are being marked.
              </p>
            </div>
          ) : (
            <>
              <h1 id="mock-grading-title" className={styles.resultTitle}>
                Marking needs attention
              </h1>
              <p className={styles.resultBody}>
                Nothing has been lost. Your submitted answers remain locked.
              </p>
              <button
                type="button"
                onClick={finish}
                className={styles.resultBtnPrimary}
              >
                Retry marking
              </button>
            </>
          )}
        </section>
      ) : null}

      {phase === "results" ? (
        <Results
          title={title}
          score={finalScore ?? 0}
          passed={passed ?? false}
          config={mockConfig}
          reviews={reviews}
          reviewIndex={reviewIndex}
          showReview={showReview}
          pending={pending}
          onLoadReview={loadReview}
          onReviewIndexChange={setReviewIndex}
          onCloseReview={() => setShowReview(false)}
        />
      ) : null}

      {confirmPart ? (
        <PartSubmitDialog
          part={confirmPart}
          answered={answeredInPart}
          total={partQuestions.length}
          flagged={flaggedInPart}
          pending={submittingPart}
          onCancel={() => {
            if (!submittingPart) setConfirmPart(null);
          }}
          onConfirm={() => submitPartNow(confirmPart)}
        />
      ) : null}
    </div>
  );
}

function MockExamQuestionRail({
  questions,
  currentIndex,
  currentPart,
  answers,
  flags,
  onSelect,
  submitting = false,
  onSubmitPart,
  reviewMode = false,
}: {
  questions: Array<{ id: string; part: number | null }>;
  currentIndex: number;
  currentPart: 1 | 2;
  answers: Map<string, Answer>;
  flags: Set<string>;
  onSelect: (index: number) => void;
  submitting?: boolean;
  onSubmitPart?: () => void;
  reviewMode?: boolean;
}) {
  const [viewPart, setViewPart] = useState<1 | 2>(currentPart);

  useEffect(() => {
    setViewPart(currentPart);
  }, [currentPart]);

  const indexed = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.part === viewPart);
  const locked = !reviewMode && viewPart !== currentPart;
  const part2Locked = !reviewMode && currentPart === 1;

  return (
    <nav
      id="pmq-mock-question-rail"
      aria-label={reviewMode ? "Review questions" : "Mock exam questions"}
      className={styles.rail}
    >
      <div className={styles.railTop}>
        <div className={styles.railTabs} role="tablist" aria-label="Exam parts">
          {([1, 2] as const).map((part) => {
            const selected = viewPart === part;
            const disabled = part === 2 && part2Locked;
            return (
              <button
                key={part}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={disabled}
                className={`${styles.railTab} ${selected ? styles.railTabSelected : ""}`}
                onClick={() => setViewPart(part)}
              >
                Part {part}
                {part === 1 && currentPart === 2 && !reviewMode ? (
                  <span className={styles.railTabDone}> · done</span>
                ) : null}
              </button>
            );
          })}
        </div>
        {onSubmitPart ? (
          <button
            type="button"
            className={styles.submitBtn}
            disabled={submitting}
            aria-busy={submitting}
            aria-label={
              submitting
                ? `Submitting part ${currentPart}`
                : `Submit part ${currentPart}`
            }
            onClick={onSubmitPart}
          >
            {submitting ? (
              <>
                <Spinner
                  variant="bars"
                  size={12}
                  className="text-current"
                  aria-hidden
                />
                Submitting…
              </>
            ) : (
              `Submit part ${currentPart}`
            )}
          </button>
        ) : null}
      </div>
      <div className={styles.railGrid}>
        {indexed.map(({ question, index }) => {
          const answered = answers.has(question.id);
          const flagged = flags.has(question.id);
          const current = index === currentIndex;
          return (
            <button
              key={question.id}
              type="button"
              disabled={locked || submitting}
              aria-current={current ? "step" : undefined}
              aria-label={`Question ${index + 1}, ${
                answered ? "answered" : "unanswered"
              }${flagged ? ", flagged" : ""}${locked || submitting ? ", locked" : ""}`}
              onClick={() => onSelect(index)}
              className={`${styles.railCell} ${
                locked || submitting ? styles.railCellLocked : ""
              } ${current ? styles.railCellCurrent : ""} ${
                !(locked || submitting) && flagged
                  ? styles.railCellFlagged
                  : !(locked || submitting) && answered
                    ? styles.railCellAnswered
                    : ""
              }`}
            >
              {index + 1}
              {flagged ? (
                <Flag
                  className={styles.railFlagIcon}
                  strokeWidth={2}
                  fill="currentColor"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function QuestionScreen({
  question,
  index,
  total,
  answer,
  flagged,
  locked,
  onAnswerChange,
  onToggleFlag,
}: {
  question: PublicMockQuestion;
  index: number;
  total: number;
  answer?: Answer;
  flagged: boolean;
  locked: boolean;
  onAnswerChange: (answer: Answer) => void;
  onToggleFlag: () => void;
}) {
  const text = typeof answer === "string" ? answer : "";
  const dropdowns =
    answer && typeof answer === "object" ? answer : ({} as Record<string, string>);
  return (
    <article className={styles.questionPanel}>
      <div className={styles.questionHeader}>
        <p className={styles.questionMeta}>
          Question {index + 1} of {total} · {question.marks} mark
          {question.marks === 1 ? "" : "s"}
        </p>
        <div className={styles.questionActions}>
          <button
            type="button"
            onClick={onToggleFlag}
            disabled={locked}
            aria-pressed={flagged}
            aria-label={flagged ? "Remove flag" : "Flag question"}
            className={`${styles.flagBtn} ${flagged ? styles.flagBtnOn : ""}`}
          >
            <Flag
              className="size-3.5"
              strokeWidth={2}
              fill={flagged ? "var(--orange)" : "none"}
              color={flagged ? "var(--orange)" : "currentColor"}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {question.question_type !== "select_from_list" ? (
        <h1 className="mb-4 whitespace-pre-line font-body text-[15px] font-medium leading-relaxed text-ink sm:text-[16px]">
          {question.prompt}
        </h1>
      ) : null}

      {question.question_type === "multiple_choice" ? (
        <McqResponseFields
          options={(question.options as string[]) ?? []}
          value={text}
          disabled={locked}
          ariaLabel={`Question ${index + 1}`}
          onChange={onAnswerChange}
        />
      ) : question.question_type === "select_from_list" ? (
        <InlineDropdownResponseFields
          prompt={question.prompt}
          options={(question.options as Record<string, string[]>) ?? {}}
          values={dropdowns}
          disabled={locked}
          onChange={(key, value) =>
            onAnswerChange({ ...dropdowns, [key]: value })
          }
        />
      ) : (
        <div>
          <label htmlFor={`written-${question.id}`} className="sr-only">
            Your written answer
          </label>
          <textarea
            id={`written-${question.id}`}
            value={text}
            onChange={(event) => onAnswerChange(event.target.value)}
            rows={question.question_type === "long_answer" ? 10 : 5}
            className={styles.answerField}
            placeholder="Type your answer here…"
            disabled={locked}
          />
          <p className={styles.answerHint}>
            {text.trim().split(/\s+/).filter(Boolean).length} words · Saved
            automatically
          </p>
        </div>
      )}
    </article>
  );
}

function PartSubmitDialog({
  part,
  answered,
  total,
  flagged,
  pending,
  onCancel,
  onConfirm,
}: {
  part: 1 | 2;
  answered: number;
  total: number;
  flagged: number;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const unanswered = total - answered;
  return (
    <div
      className={styles.dialogScrim}
      role="presentation"
      onMouseDown={(event) => {
        if (pending) return;
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-part-title"
        className={styles.dialogCard}
      >
        <h2 id="submit-part-title" className={styles.dialogTitle}>
          Submit Part {part}?
        </h2>
        <p className={styles.dialogBody}>
          Once submitted, your answers can&apos;t be changed.
        </p>
        {unanswered > 0 ? (
          <p className={styles.dialogWarn}>
            Unanswered questions will receive zero marks.
          </p>
        ) : null}
        <dl className={styles.dialogStats}>
          <div>
            <dt>Answered</dt>
            <dd>{answered}</dd>
          </div>
          <div>
            <dt>Unanswered</dt>
            <dd>{unanswered}</dd>
          </div>
          <div>
            <dt>Flagged</dt>
            <dd>{flagged}</dd>
          </div>
        </dl>
        <div className={styles.dialogActions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className={styles.dialogBtnSecondary}
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending}
            aria-label={
              pending ? `Submitting Part ${part}` : `Submit Part ${part}`
            }
            className={styles.dialogBtnPrimary}
          >
            {pending ? (
              <>
                <Spinner
                  variant="bars"
                  size={14}
                  className="text-current"
                  aria-hidden
                />
                Submitting…
              </>
            ) : (
              `Submit Part ${part}`
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function BreakScreen({
  remaining,
  pending,
  onContinue,
}: {
  remaining: number;
  pending: boolean;
  onContinue: () => void;
}) {
  return (
    <section
      className={styles.breakCard}
      aria-labelledby="mock-break-title"
    >
      <h1 id="mock-break-title" className={styles.breakTitle}>
        Optional break
      </h1>
      <p className={styles.breakBody}>
        Part 1 has been locked. Begin Part 2 at any time during the break, or
        wait for it to start automatically.
      </p>
      <p
        className={styles.breakTimer}
        aria-label={`Break time remaining ${formatExamTime(remaining)}`}
      >
        {formatExamTime(remaining)}
      </p>
      <button
        type="button"
        onClick={onContinue}
        disabled={pending}
        aria-busy={pending}
        aria-label={pending ? "Starting Part 2" : "Start Part 2"}
        className={styles.breakBtn}
      >
        {pending ? (
          <>
            <Spinner
              variant="bars"
              size={16}
              className="text-current"
              aria-hidden
            />
            Starting…
          </>
        ) : (
          "Start Part 2"
        )}
      </button>
    </section>
  );
}

function Results({
  title,
  score,
  passed,
  config,
  reviews,
  reviewIndex,
  showReview,
  pending,
  onLoadReview,
  onReviewIndexChange,
  onCloseReview,
}: {
  title: string;
  score: number;
  passed: boolean;
  config: MockExamConfig;
  reviews: MockExamReview[] | null;
  reviewIndex: number;
  showReview: boolean;
  pending: boolean;
  onLoadReview: () => void;
  onReviewIndexChange: (index: number) => void;
  onCloseReview: () => void;
}) {
  const router = useRouter();
  const [overviewPending, startOverview] = useTransition();
  const percentage = Math.round((score / config.total_marks) * 100);
  const current = reviews?.[reviewIndex];
  const reviewQuestions =
    reviews?.map((review) => ({
      id: review.questionId,
      part: review.part,
    })) ?? [];
  const reviewAnswers = new Map(
    (reviews ?? []).flatMap((review) =>
      review.submittedAnswer == null
        ? []
        : [[review.questionId, review.submittedAnswer]],
    ),
  );
  return (
    <div className={styles.resultWrap}>
      <section
        className={styles.resultCard}
        aria-labelledby="mock-result-title"
      >
        <h1 id="mock-result-title" className={styles.resultTitle}>
          {title}
        </h1>
        <p className={styles.resultMeta}>Final result · attempt complete</p>
        <p className={styles.resultScore}>
          {score} / {config.total_marks}
          <span className={styles.resultPctSep} aria-hidden>
            ·
          </span>
          <span className={styles.resultPct}>{percentage}%</span>
        </p>
        <p
          className={`${styles.resultVerdict} ${
            passed ? styles.resultVerdictPass : styles.resultVerdictRefer
          }`}
        >
          {passed ? "Pass — well done." : "Refer - keep going."}
        </p>
        <p className={styles.resultMeta}>
          Measured against our practice threshold. The real exam&apos;s pass
          mark varies by paper.
        </p>
        <button
          type="button"
          onClick={showReview ? onCloseReview : onLoadReview}
          disabled={pending}
          aria-busy={pending}
          aria-label={
            pending
              ? "Loading review"
              : showReview
                ? "Hide answer review"
                : "Review all 40 answers"
          }
          className={styles.resultBtnSecondary}
        >
          {pending ? (
            <>
              <Spinner
                variant="bars"
                size={14}
                className="text-current"
                aria-hidden
              />
              Loading…
            </>
          ) : showReview ? (
            "Hide answer review"
          ) : (
            "Review all 40 answers"
          )}
        </button>
      </section>

      {showReview && reviews && current ? (
        <section className={styles.reviewStack} aria-label="Answer review">
          <MockExamQuestionRail
            questions={reviewQuestions}
            currentIndex={reviewIndex}
            currentPart={current.part === 2 ? 2 : 1}
            answers={reviewAnswers}
            flags={new Set()}
            onSelect={onReviewIndexChange}
            reviewMode
          />
          <article className={styles.reviewCard}>
            <p className={styles.reviewMeta}>
              Part {current.part} · Question {reviewIndex + 1} · {current.score}/
              {current.marks}
            </p>
            <h2 className={styles.reviewPrompt}>{current.prompt}</h2>
            <ReviewAnswer
              label="Your answer"
              answer={current.submittedAnswer}
              options={current.options}
            />
            <ReviewAnswer
              label={
                current.questionType === "short_answer" ||
                current.questionType === "long_answer"
                  ? "Model answer"
                  : "Correct answer"
              }
              answer={current.modelAnswer ?? current.correctAnswer}
              options={current.options}
              positive
            />
            {current.markingGuide ? (
              <div className={styles.reviewNote}>
                <h3 className={styles.reviewNoteTitle}>Answer guidelines</h3>
                <p className={styles.reviewNoteBody}>{current.markingGuide}</p>
              </div>
            ) : null}
            {current.feedback ? (
              <div className={styles.reviewNote}>
                <h3 className={styles.reviewNoteTitle}>Marker feedback</h3>
                <p className={styles.reviewNoteBody}>{current.feedback}</p>
              </div>
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
              router.push(`/courses/${PMQ_SLUG}`);
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
  answer,
  options,
  positive = false,
}: {
  label: string;
  answer: string | Record<string, string> | null;
  options: string[] | Record<string, string[]> | null;
  positive?: boolean;
}) {
  let display = "No answer submitted";
  if (typeof answer === "string") {
    if (Array.isArray(options) && /^[A-Z]$/.test(answer)) {
      const index = answer.charCodeAt(0) - 65;
      display = `${answer}) ${options[index] ?? answer}`;
    } else {
      display = answer;
    }
  } else if (answer) {
    display = Object.entries(answer)
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
      .join("\n");
  }
  return (
    <div className={styles.reviewNote}>
      <h3
        className={`${styles.reviewNoteTitle} ${
          positive ? styles.reviewNoteTitlePositive : ""
        }`}
      >
        {label}
      </h3>
      <p className={styles.reviewNoteBody}>{display}</p>
    </div>
  );
}
