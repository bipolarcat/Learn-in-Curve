"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import {
  loadPfqAttempt,
  savePfqAnswer,
  startPfqAttempt,
  submitPfqAttempt,
  togglePfqFlag,
} from "@/lib/pfq/actions";
import {
  PFQ_DURATION_SECONDS,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";
import { PFQ_MOCK_HREF } from "@/lib/pfq/constants";
import type { PfqMockSet } from "@/lib/pfq/generator";
import type { PfqPublicQuestion } from "@/lib/pfq/types";
import { PfqResults } from "@/components/pfq/PfqResults";
import { McqResponseFields } from "@/components/pmq/QuestionResponseFields";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/components/pmq/MockExamRunner.module.css";

const DISPLAY_KEYS = ["a", "b", "c", "d"] as const;

type Phase = "boot" | "start" | "exam" | "results";

type Props = {
  attemptId?: string;
  mockSet?: PfqMockSet;
  onTimerMeta?: (meta: {
    phase: Phase;
    remaining: number;
    mockSet: PfqMockSet | null;
  }) => void;
};

function optionTexts(question: PfqPublicQuestion): string[] {
  return DISPLAY_KEYS.map((key) => question.options[key] ?? "");
}

export function PfqMockRunner({
  attemptId: initialAttemptId,
  mockSet: mockSetProp,
  onTimerMeta,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(
    initialAttemptId ? "boot" : "start",
  );
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState(initialAttemptId ?? "");
  const [mockSet, setMockSet] = useState<PfqMockSet | null>(
    mockSetProp ?? null,
  );
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(PFQ_DURATION_SECONDS);
  const [questions, setQuestions] = useState<PfqPublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [results, setResults] = useState<Awaited<
    ReturnType<typeof submitPfqAttempt>
  > | null>(null);
  const [pending, startTransition] = useTransition();
  const autoSubmitted = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const current = questions[index] ?? null;

  const counts = useMemo(() => {
    let attempted = 0;
    let flagged = 0;
    for (const q of questions) {
      if (answers[q.id]) attempted += 1;
      if (flags.has(q.id)) flagged += 1;
    }
    return {
      attempted,
      unattempted: questions.length - attempted,
      flagged,
    };
  }, [questions, answers, flags]);

  const hydrate = useCallback(async (id: string) => {
    const loaded = await loadPfqAttempt({ attemptId: id });
    if (!loaded.ok) {
      setError(loaded.error);
      setPhase("start");
      return;
    }
    setAttemptId(loaded.attemptId);
    setMockSet(loaded.mockSet);
    setEndsAt(loaded.endsAt);
    setQuestions(loaded.questions);
    setAnswers(loaded.answers);
    setFlags(new Set(loaded.flags));
    if (loaded.status === "submitted" && loaded.results) {
      setResults({ ok: true, results: loaded.results });
      setPhase("results");
      return;
    }
    const firstBlank = loaded.questions.findIndex((q) => !loaded.answers[q.id]);
    setIndex(firstBlank >= 0 ? firstBlank : 0);
    setPhase("exam");
  }, []);

  useEffect(() => {
    if (initialAttemptId) void hydrate(initialAttemptId);
  }, [initialAttemptId, hydrate]);

  useEffect(() => {
    if (phase !== "exam" || !endsAt) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left <= 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        void doSubmit("timeout");
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endsAt]);

  useEffect(() => {
    onTimerMeta?.({
      phase,
      remaining,
      mockSet,
    });
  }, [onTimerMeta, phase, remaining, mockSet]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function begin() {
    if (!mockSetProp) return;
    setError("");
    startTransition(async () => {
      const started = await startPfqAttempt({ mockSet: mockSetProp });
      if (!started.ok) {
        setError(started.error);
        return;
      }
      setAttemptId(started.attemptId);
      setMockSet(started.mockSet);
      setEndsAt(started.endsAt);
      setQuestions(started.questions);
      setAnswers(started.answers);
      setFlags(new Set());
      setIndex(0);
      autoSubmitted.current = false;
      setPhase("exam");
      router.replace(`${PFQ_MOCK_HREF}/${started.attemptId}`);
    });
  }

  async function selectOption(letter: string) {
    if (!current || !attemptId) return;
    const key = letter.toLowerCase();
    if (!DISPLAY_KEYS.includes(key as (typeof DISPLAY_KEYS)[number])) return;
    const next = { ...answers, [current.id]: key };
    setAnswers(next);
    void savePfqAnswer({
      attemptId,
      questionId: current.id,
      selected: key,
    });
  }

  async function toggleFlag() {
    if (!current || !attemptId) return;
    const nextFlag = !flags.has(current.id);
    setFlags((prev) => {
      const copy = new Set(prev);
      if (nextFlag) copy.add(current.id);
      else copy.delete(current.id);
      return copy;
    });
    void togglePfqFlag({
      attemptId,
      questionId: current.id,
      flagged: nextFlag,
    });
  }

  function goToQuestion(nextIndex: number, opts?: { scrollToTop?: boolean }) {
    setIndex(nextIndex);
    if (opts?.scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function doSubmit(reason: "manual" | "timeout") {
    if (!attemptId) return;
    setConfirmSubmit(false);
    startTransition(async () => {
      const submitted = await submitPfqAttempt({
        attemptId,
        reason,
      });
      if (!submitted.ok) {
        setError(submitted.error);
        return;
      }
      setResults(submitted);
      setPhase("results");
      router.replace(`${PFQ_MOCK_HREF}/${attemptId}`);
    });
  }

  if (phase === "boot") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-ink/60">
        <Spinner variant="ring" size={28} />
        <p className="m-0 font-body text-sm">Loading your attempt…</p>
      </div>
    );
  }

  if (phase === "results" && results?.ok) {
    return (
      <PfqResults results={results.results} mockSet={mockSet} />
    );
  }

  if (phase === "start") {
    const title = mockSetProp ? `Mock Exam ${mockSetProp}` : "Mock exam";
    return (
      <div className="relative">
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
        <section
          className={styles.startCard}
          aria-labelledby="pfq-mock-start-title"
        >
          <h1 id="pfq-mock-start-title" className={styles.startTitle}>
            {title}
          </h1>
          <p className={styles.startMeta}>
            {PFQ_QUESTION_COUNT} questions ·{" "}
            {Math.round(PFQ_DURATION_SECONDS / 60)} minutes · pass{" "}
            {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT}
          </p>
          <p className={styles.startNotice}>
            You can leave and resume, but the timer keeps running. Starting uses
            your only attempt at this paper.
          </p>
          <button
            type="button"
            onClick={() => void begin()}
            disabled={pending || !mockSetProp}
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
      </div>
    );
  }

  if (!current) {
    return (
      <div className="py-12 text-center text-sm text-ink/60" role="alert">
        No questions loaded.
      </div>
    );
  }

  return (
    <div className="relative">
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

      <div className={styles.examStack}>
        <nav
          aria-label="Mock exam questions"
          className={`${styles.rail} ${styles.railCompact}`}
        >
          <div className={styles.railTop}>
            <button
              type="button"
              className={styles.submitBtn}
              disabled={pending}
              aria-busy={pending}
              aria-label={pending ? "Submitting exam" : "Submit exam"}
              onClick={() => setConfirmSubmit(true)}
            >
              {pending ? (
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
                "Submit exam"
              )}
            </button>
          </div>
          <div className={`${styles.railGrid} ${styles.railGridCompact}`}>
            {questions.map((q, i) => {
              const answered = Boolean(answers[q.id]);
              const flagged = flags.has(q.id);
              const currentCell = i === index;
              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={pending}
                  aria-current={currentCell ? "step" : undefined}
                  aria-label={`Question ${i + 1}, ${
                    answered ? "answered" : "unanswered"
                  }${flagged ? ", flagged" : ""}`}
                  onClick={() => goToQuestion(i)}
                  className={`${styles.railCell} ${
                    currentCell ? styles.railCellCurrent : ""
                  } ${
                    flagged
                      ? styles.railCellFlagged
                      : answered
                        ? styles.railCellAnswered
                        : ""
                  }`}
                >
                  {i + 1}
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

        <article className={styles.questionPanel}>
          <div className={styles.questionHeader}>
            <p className={styles.questionMeta}>
              Question {index + 1} of {questions.length}
            </p>
            <div className={styles.questionActions}>
              <button
                type="button"
                onClick={() => void toggleFlag()}
                disabled={pending}
                aria-pressed={flags.has(current.id)}
                aria-label={
                  flags.has(current.id) ? "Remove flag" : "Flag question"
                }
                className={`${styles.flagBtn} ${
                  flags.has(current.id) ? styles.flagBtnOn : ""
                }`}
              >
                <Flag
                  className="size-3.5"
                  strokeWidth={2}
                  fill={flags.has(current.id) ? "var(--orange)" : "none"}
                  color={
                    flags.has(current.id) ? "var(--orange)" : "currentColor"
                  }
                  aria-hidden
                />
              </button>
            </div>
          </div>

          <h1 className="mb-4 whitespace-pre-line font-body text-[15px] font-medium leading-relaxed text-ink sm:text-[16px]">
            {current.stem}
          </h1>

          {current.items?.length ? (
            <ol className="mb-4 list-decimal space-y-1.5 pl-5 font-body text-[14px] leading-snug text-ink">
              {current.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : null}

          <McqResponseFields
            options={optionTexts(current)}
            value={(answers[current.id] ?? "").toUpperCase()}
            disabled={pending}
            ariaLabel={`Question ${index + 1}`}
            onChange={(letter) => void selectOption(letter)}
          />
        </article>

        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.navBtn}
            disabled={pending || index === 0}
            onClick={() => goToQuestion(index - 1)}
          >
            ← Previous
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navBtnNext}`}
            disabled={pending || index === questions.length - 1}
            onClick={() => goToQuestion(index + 1, { scrollToTop: true })}
          >
            Next →
          </button>
        </div>
      </div>

      {confirmSubmit ? (
        <div
          className={styles.dialogScrim}
          role="presentation"
          onMouseDown={(event) => {
            if (pending) return;
            if (event.target === event.currentTarget) setConfirmSubmit(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pfq-submit-title"
            className={styles.dialogCard}
          >
            <h2 id="pfq-submit-title" className={styles.dialogTitle}>
              Submit exam?
            </h2>
            <p className={styles.dialogBody}>
              Once submitted, your answers can&apos;t be changed.
            </p>
            {counts.unattempted > 0 ? (
              <p className={styles.dialogWarn}>
                Unanswered questions will receive zero marks.
              </p>
            ) : null}
            <dl className={styles.dialogStats}>
              <div>
                <dt>Answered</dt>
                <dd>{counts.attempted}</dd>
              </div>
              <div>
                <dt>Unanswered</dt>
                <dd>{counts.unattempted}</dd>
              </div>
              <div>
                <dt>Flagged</dt>
                <dd>{counts.flagged}</dd>
              </div>
            </dl>
            <div className={styles.dialogActions}>
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                disabled={pending}
                className={styles.dialogBtnSecondary}
              >
                Go back
              </button>
              <button
                type="button"
                onClick={() => void doSubmit("manual")}
                disabled={pending}
                aria-busy={pending}
                aria-label={pending ? "Submitting exam" : "Submit exam"}
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
                  "Submit exam"
                )}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
