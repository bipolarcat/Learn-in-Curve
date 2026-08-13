"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import {
  loadPfqAttempt,
  mintPfqGuestToken,
  savePfqAnswer,
  startPfqAttempt,
  submitPfqAttempt,
  togglePfqFlag,
} from "@/lib/pfq/actions";
import { PFQ_DURATION_SECONDS, PFQ_PASS_MARK } from "@/lib/pfq/outcomes";
import type { PfqPublicQuestion } from "@/lib/pfq/types";
import { PfqResults } from "@/components/pfq/PfqResults";
import { Spinner } from "@/components/ui/spinner";
import { stampCtaPrimary, stampCtaSecondary } from "@/components/stamp-chip";
import styles from "@/components/pfq/PfqMockRunner.module.css";

const GUEST_KEY = "pfq_guest_token";

type ReviewFilter = "all" | "unattempted" | "attempted" | "flagged";

type Props = {
  /** Resume an existing attempt. */
  attemptId?: string;
};

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

async function ensureGuestToken(): Promise<string> {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(GUEST_KEY);
  if (existing && existing.length >= 16) return existing;
  const minted = await mintPfqGuestToken();
  window.localStorage.setItem(GUEST_KEY, minted);
  return minted;
}

export function PfqMockRunner({ attemptId: initialAttemptId }: Props) {
  const router = useRouter();
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
  const [pending, startTransition] = useTransition();
  const autoSubmitted = useRef(false);

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

  async function begin() {
    setError("");
    startTransition(async () => {
      const guestToken = await ensureGuestToken();
      const started = await startPfqAttempt({ guestToken });
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
      router.replace(`/pfq/mock/${started.attemptId}`);
    });
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
        `${counts.unattempted} unanswered — APM advises guessing (no negative marking)`,
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
      router.replace(`/pfq/mock/${attemptId}`);
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

  if (phase === "ready") {
    return (
      <div className={styles.startCard}>
        <h1 className={styles.title}>PFQ free mock</h1>
        <p className={styles.lead}>
          60 questions · 60 minutes · pass mark {PFQ_PASS_MARK}/60. One question
          per learning outcome, plus one doubled — the same shape as the real
          paper.
        </p>
        <ul className={styles.bullets}>
          <li>Flag questions and filter Unattempted / Attempted / Flagged.</li>
          <li>Pacing guide: about 1 minute per question.</li>
          <li>No negative marking — answer everything.</li>
          <li>Results show a 59-outcome coverage map, not just a percentage.</li>
        </ul>
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
          onClick={() => void begin()}
        >
          {pending ? (
            <Spinner variant="bars" size={16} className="text-current" />
          ) : (
            "Start 60-minute mock"
          )}
        </button>
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
              Submit paper
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
