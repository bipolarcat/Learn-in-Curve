"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flag } from "lucide-react";
import {
  listPfqMockSetSummaries,
  loadPfqAttempt,
  mintPfqGuestToken,
  savePfqAnswer,
  startPfqAttempt,
  submitPfqAttempt,
  togglePfqFlag,
  type PfqMockSetSummary,
} from "@/lib/pfq/actions";
import {
  PFQ_DURATION_SECONDS,
  PFQ_PASS_MARK,
  PFQ_QUESTION_COUNT,
} from "@/lib/pfq/outcomes";
import { PFQ_MOCK_HREF } from "@/lib/pfq/constants";
import { PFQ_MOCK_SETS, type PfqMockSet } from "@/lib/pfq/generator";
import {
  emptyPfqMockSummary,
  formatExamClock,
  pfqMockConsoleSecondsRemaining,
  pfqMockSelectorState,
} from "@/lib/pfq/mock-console";
import type { PfqPublicQuestion } from "@/lib/pfq/types";
import { PfqResults } from "@/components/pfq/PfqResults";
import { Spinner } from "@/components/ui/spinner";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import styles from "@/components/pfq/PfqMockRunner.module.css";
import consoleStyles from "@/components/pmq/PmqMockExamsSection.module.css";

const GUEST_KEY = "pfq_guest_token";

type ReviewFilter = "all" | "unattempted" | "attempted" | "flagged";

type Props = {
  /** Resume an existing attempt. */
  attemptId?: string;
  /** Mock paper 1–3. Falls back to `?set=` search param. */
  mockSet?: PfqMockSet;
};

function parseMockSetParam(raw: string | null | undefined): PfqMockSet | null {
  if (raw === "1" || raw === "2" || raw === "3") return Number(raw) as PfqMockSet;
  return null;
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function RunnerPaperTimer({ summary }: { summary: PfqMockSetSummary }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);
  useEffect(() => {
    if (now == null) return;
    if (pfqMockConsoleSecondsRemaining(summary, Date.now()) == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [now == null, summary.activeAttemptId, summary.endsAt]);
  if (now == null) return null;
  const seconds = pfqMockConsoleSecondsRemaining(summary, now);
  if (seconds == null) return null;
  const label = formatExamClock(seconds);
  return (
    <>
      {" · "}
      <span aria-label={`Time remaining ${label}`}>{label}</span>
    </>
  );
}

async function ensureGuestToken(): Promise<string> {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(GUEST_KEY);
  if (existing && existing.length >= 16) return existing;
  const minted = await mintPfqGuestToken();
  window.localStorage.setItem(GUEST_KEY, minted);
  return minted;
}

export function PfqMockRunner({
  attemptId: initialAttemptId,
  mockSet: mockSetProp,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedMockSet =
    mockSetProp ?? parseMockSetParam(searchParams.get("set"));
  const [phase, setPhase] = useState<"boot" | "ready" | "exam" | "results">(
    initialAttemptId ? "boot" : "ready",
  );
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState(initialAttemptId ?? "");
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(PFQ_DURATION_SECONDS);
  const [questions, setQuestions] = useState<PfqPublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewPinned, setReviewPinned] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [submitWarn, setSubmitWarn] = useState<string | null>(null);
  const [results, setResults] = useState<Awaited<
    ReturnType<typeof submitPfqAttempt>
  > | null>(null);
  const [summaries, setSummaries] = useState<PfqMockSetSummary[]>(() =>
    PFQ_MOCK_SETS.map(emptyPfqMockSummary),
  );
  const [pending, startTransition] = useTransition();
  const autoSubmitted = useRef(false);

  const current = questions[index] ?? null;

  const activeOtherSet = useMemo(() => {
    const active = summaries.find((s) => s.activeAttemptId);
    return active?.mockSet ?? null;
  }, [summaries]);

  const resolvedSummary = useMemo(
    () =>
      resolvedMockSet
        ? summaries.find((s) => s.mockSet === resolvedMockSet) ??
          emptyPfqMockSummary(resolvedMockSet)
        : null,
    [summaries, resolvedMockSet],
  );

  const resolvedState = resolvedSummary
    ? pfqMockSelectorState(resolvedSummary, activeOtherSet)
    : null;

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

  const filteredIds = useMemo(() => {
    return questions
      .filter((q) => {
        if (reviewFilter === "unattempted") return !answers[q.id];
        if (reviewFilter === "attempted") return Boolean(answers[q.id]);
        if (reviewFilter === "flagged") return flags.has(q.id);
        return true;
      })
      .map((q) => q.id);
  }, [questions, answers, flags, reviewFilter]);

  const hydrate = useCallback(async (id: string) => {
    const guestToken = await ensureGuestToken();
    const loaded = await loadPfqAttempt({ attemptId: id, guestToken });
    if (!loaded.ok) {
      setError(loaded.error);
      setPhase("ready");
      return;
    }
    setAttemptId(loaded.attemptId);
    setEndsAt(loaded.endsAt);
    setQuestions(loaded.questions);
    setAnswers(loaded.answers);
    setFlags(new Set(loaded.flags));
    if (loaded.status === "submitted" && loaded.results) {
      setResults({ ok: true, results: loaded.results });
      setPhase("results");
      return;
    }
    setPhase("exam");
  }, []);

  useEffect(() => {
    if (initialAttemptId) {
      void hydrate(initialAttemptId);
    }
  }, [initialAttemptId, hydrate]);

  useEffect(() => {
    if (initialAttemptId) return;
    let cancelled = false;
    void (async () => {
      const result = await listPfqMockSetSummaries();
      if (cancelled || !result.ok) return;
      setSummaries(result.summaries);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialAttemptId]);

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

  async function begin(mockSet: PfqMockSet) {
    setError("");
    startTransition(async () => {
      const guestToken = await ensureGuestToken();
      const started = await startPfqAttempt({ guestToken, mockSet });
      if (!started.ok) {
        setError(started.error);
        return;
      }
      setAttemptId(started.attemptId);
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

  function choosePaper(mockSet: PfqMockSet) {
    const summary =
      summaries.find((s) => s.mockSet === mockSet) ??
      emptyPfqMockSummary(mockSet);
    const state = pfqMockSelectorState(summary, activeOtherSet);
    if (!state.enabled) return;
    if (summary.activeAttemptId) {
      router.replace(`${PFQ_MOCK_HREF}/${summary.activeAttemptId}`);
      return;
    }
    if (summary.latestAttemptId && !summary.activeAttemptId) {
      // Prefer starting fresh only via Start; View result goes to attempt
      if (state.action === "View result") {
        router.replace(`${PFQ_MOCK_HREF}/${summary.latestAttemptId}`);
        return;
      }
    }
    router.replace(`${PFQ_MOCK_HREF}?set=${mockSet}`);
  }

  async function selectOption(letter: string) {
    if (!current || !attemptId) return;
    const next = { ...answers, [current.id]: letter };
    setAnswers(next);
    const guestToken = await ensureGuestToken();
    void savePfqAnswer({
      attemptId,
      questionId: current.id,
      selected: letter,
      guestToken,
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
    const guestToken = await ensureGuestToken();
    void togglePfqFlag({
      attemptId,
      questionId: current.id,
      flagged: nextFlag,
      guestToken,
    });
  }

  function requestSubmit() {
    const parts: string[] = [];
    if (counts.unattempted > 0) {
      parts.push(
        `${counts.unattempted} unanswered. APM advises guessing (no negative marking)`,
      );
    }
    if (counts.flagged > 0) {
      parts.push(`${counts.flagged} still flagged`);
    }
    if (parts.length) {
      setSubmitWarn(parts.join(". ") + ". Submit anyway?");
      return;
    }
    void doSubmit("manual");
  }

  async function doSubmit(reason: "manual" | "timeout") {
    if (!attemptId) return;
    setSubmitWarn(null);
    startTransition(async () => {
      const guestToken = await ensureGuestToken();
      const submitted = await submitPfqAttempt({
        attemptId,
        guestToken,
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
      <div className={styles.center}>
        <Spinner variant="ring" size={28} />
        <p>Loading your attempt…</p>
      </div>
    );
  }

  if (phase === "results" && results?.ok) {
    return <PfqResults results={results.results} />;
  }

  if (phase === "ready" && !resolvedMockSet) {
    return (
      <div className={styles.startCard}>
        <h1 className={styles.title}>Choose a mock exam</h1>
        <p className={styles.lead}>
          Three timed exams. {PFQ_QUESTION_COUNT} questions · 60 minutes · pass
          mark {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT}. Pick one exam to sit; you
          stay on that exam until you submit.
        </p>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <div className={consoleStyles.list}>
          {summaries.map((summary) => {
            const state = pfqMockSelectorState(summary, activeOtherSet);
            return (
              <div key={summary.mockSet} className={consoleStyles.row}>
                <div className={consoleStyles.rowMain}>
                  <div className="min-w-0 flex-1">
                    <p className={consoleStyles.rowTitle}>
                      Mock exam {summary.mockSet}
                    </p>
                    {state.status ? (
                      <span
                        className={`${consoleStyles.rowStatus} ${
                          state.tone === "done"
                            ? consoleStyles.rowStatusDone
                            : state.tone === "open"
                              ? consoleStyles.rowStatusOpen
                              : ""
                        }`}
                      >
                        {state.status}
                        <RunnerPaperTimer summary={summary} />
                      </span>
                    ) : null}
                  </div>
                </div>
                {state.enabled ? (
                  <button
                    type="button"
                    disabled={pending}
                    className={stampCtaSecondary}
                    onClick={() => choosePaper(summary.mockSet)}
                  >
                    {state.action}
                  </button>
                ) : (
                  <span className={consoleStyles.rowLock}>{state.action}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "ready" && resolvedMockSet && resolvedState) {
    const canResume =
      resolvedState.action === "Resume" && resolvedSummary?.activeAttemptId;
    const canView =
      resolvedState.action === "View result" &&
      resolvedSummary?.latestAttemptId;
    const canStart =
      resolvedState.action === "Start" && resolvedState.enabled;

    return (
      <div className={styles.startCard}>
        <h1 className={styles.title}>Mock exam {resolvedMockSet}</h1>
        <p className={styles.lead}>
          {PFQ_QUESTION_COUNT} questions · 60 minutes · pass mark{" "}
          {PFQ_PASS_MARK}/{PFQ_QUESTION_COUNT}. One question per learning
          outcome, plus one doubled. Same shape as the real paper.
        </p>
        {resolvedState.status ? (
          <p className={styles.lead}>
            {resolvedState.status}
            {resolvedSummary ? (
              <RunnerPaperTimer summary={resolvedSummary} />
            ) : null}
          </p>
        ) : null}
        <ul className={styles.bullets}>
          <li>Flag questions and filter Unattempted / Attempted / Flagged.</li>
          <li>Pacing guide: about 1 minute per question.</li>
          <li>No negative marking. Answer everything.</li>
          <li>Results show a 59-outcome coverage map, not just a percentage.</li>
        </ul>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.navRow}>
          <button
            type="button"
            className={stampCtaSecondary}
            disabled={pending}
            onClick={() => router.replace(PFQ_MOCK_HREF)}
          >
            Change exam
          </button>
          {canResume ? (
            <button
              type="button"
              className={stampCtaPrimary}
              disabled={pending}
              onClick={() =>
                router.replace(
                  `${PFQ_MOCK_HREF}/${resolvedSummary!.activeAttemptId}`,
                )
              }
            >
              Resume
            </button>
          ) : canView ? (
            <button
              type="button"
              className={stampCtaPrimary}
              disabled={pending}
              onClick={() =>
                router.replace(
                  `${PFQ_MOCK_HREF}/${resolvedSummary!.latestAttemptId}`,
                )
              }
            >
              View result
            </button>
          ) : canStart ? (
            <button
              type="button"
              className={stampCtaPrimary}
              disabled={pending}
              aria-busy={pending}
              onClick={() => void begin(resolvedMockSet)}
            >
              {pending ? (
                <Spinner variant="bars" size={16} className="text-current" />
              ) : (
                "Start 60-minute mock"
              )}
            </button>
          ) : (
            <p className={styles.lead}>{resolvedState.action}</p>
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

  const showReview = reviewOpen || reviewPinned;

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.progress}>
          <span>
            Q{index + 1}/{questions.length}
          </span>
          <span className={styles.muted}>
            {counts.attempted} answered · {counts.flagged} flagged
          </span>
        </div>
        <div
          className={`${styles.timer} ${
            remaining <= 300 ? styles.timerWarn : ""
          }`}
          aria-live="polite"
        >
          {formatClock(remaining)}
        </div>
        <p className={styles.pace}>~1 min / question</p>
      </header>

      <div className={styles.layout}>
        <nav className={styles.rail} aria-label="Question navigator">
          {questions.map((q, i) => {
            const state = answers[q.id]
              ? "answered"
              : flags.has(q.id)
                ? "flagged"
                : "empty";
            return (
              <button
                key={q.id}
                type="button"
                className={`${styles.railCell} ${styles[`rail_${state}`]} ${
                  i === index ? styles.railCurrent : ""
                }`}
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Question ${i + 1}${
                  answers[q.id] ? ", answered" : ""
                }${flags.has(q.id) ? ", flagged" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>

        <main className={styles.main}>
          <div className={styles.qMeta}>
            <span>
              Outcome {current.learning_outcome} · Day {current.day}
            </span>
            <button
              type="button"
              className={`${styles.flagBtn} ${
                flags.has(current.id) ? styles.flagOn : ""
              }`}
              onClick={() => void toggleFlag()}
              aria-pressed={flags.has(current.id)}
            >
              <Flag size={14} aria-hidden />
              {flags.has(current.id) ? "Flagged" : "Flag"}
            </button>
          </div>

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
              const selected = answers[current.id] === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`${styles.option} ${
                    selected ? styles.optionSelected : ""
                  }`}
                  onClick={() => void selectOption(key)}
                >
                  <span className={styles.optionKey}>{key.toUpperCase()}</span>
                  <span>{text}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.navRow}>
            <button
              type="button"
              className={stampCtaSecondary}
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Back
            </button>
            <button
              type="button"
              className={stampCtaSecondary}
              onClick={() => setReviewOpen((v) => !v)}
            >
              Review panel
            </button>
            {index < questions.length - 1 ? (
              <button
                type="button"
                className={stampCtaPrimary}
                onClick={() =>
                  setIndex((i) => Math.min(questions.length - 1, i + 1))
                }
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className={stampCtaPrimary}
                disabled={pending}
                onClick={requestSubmit}
              >
                Submit
              </button>
            )}
          </div>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
        </main>

        {showReview ? (
          <aside className={styles.review} aria-label="Review panel">
            <div className={styles.reviewHead}>
              <h3>Review</h3>
              <label className={styles.pin}>
                <input
                  type="checkbox"
                  checked={reviewPinned}
                  onChange={(e) => setReviewPinned(e.target.checked)}
                />
                Pin open
              </label>
            </div>
            <div className={styles.filters} role="tablist">
              {(
                [
                  ["all", "All"],
                  ["unattempted", "Unattempted"],
                  ["attempted", "Attempted"],
                  ["flagged", "Flagged"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={reviewFilter === id}
                  className={
                    reviewFilter === id ? styles.filterOn : styles.filter
                  }
                  onClick={() => setReviewFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className={styles.reviewList}>
              {filteredIds.map((id) => {
                const i = questions.findIndex((q) => q.id === id);
                const q = questions[i]!;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={styles.reviewItem}
                      onClick={() => {
                        setIndex(i);
                        if (!reviewPinned) setReviewOpen(false);
                      }}
                    >
                      <span>Q{i + 1}</span>
                      <span className={styles.muted}>
                        {q.learning_outcome}
                        {answers[id] ? " · answered" : " · blank"}
                        {flags.has(id) ? " · flagged" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className={stampCtaPrimary}
              disabled={pending}
              onClick={requestSubmit}
            >
              Submit exam
            </button>
          </aside>
        ) : null}
      </div>

      {submitWarn ? (
        <div className={styles.dialog} role="dialog" aria-modal="true">
          <div className={styles.dialogCard}>
            <p>{submitWarn}</p>
            <div className={styles.navRow}>
              <button
                type="button"
                className={stampCtaSecondary}
                onClick={() => setSubmitWarn(null)}
              >
                Keep reviewing
              </button>
              <button
                type="button"
                className={stampCtaPrimary}
                disabled={pending}
                onClick={() => void doSubmit("manual")}
              >
                Submit anyway
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
