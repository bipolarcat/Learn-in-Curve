"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  InlineDropdownResponseFields,
  McqResponseFields,
  type ResponseVisualState,
} from "@/components/pmq/QuestionResponseFields";
import {
  stampCtaCompact,
  stampCtaPrimary,
  stampCtaSecondaryFlat,
} from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import {
  FREE_MOCK_MAX_SCORE,
  FREE_MOCK_QUESTIONS,
  type FreeMockQuestion,
} from "@/content/free-mock-exam";
import { getAttribution } from "@/lib/analytics/attribution";
import {
  trackFreeMockCompleted,
  trackLeadCaptured,
} from "@/lib/analytics/events";
import { submitFreeMockLead } from "@/lib/free-mock/actions";
import {
  isQuestionCorrect,
  type FreeMockAnswer,
  type LoBreakdownRow,
} from "@/lib/free-mock/scoring";
import styles from "@/components/pmq/PracticeQuiz.module.css";

type Phase = "quiz" | "gate" | "results";

type ResultsPayload = {
  score: number;
  maxScore: number;
  loBreakdown: LoBreakdownRow[];
  weakest: LoBreakdownRow[];
};

type NavAction = "prev" | "next";

const NAV_SPINNER_MS = 280;

function emptyDropdownValues(question: FreeMockQuestion): Record<string, string> {
  if (question.type !== "dropdown") return {};
  return Object.fromEntries(Object.keys(question.dropdowns).map((k) => [k, ""]));
}

function answerComplete(
  question: FreeMockQuestion,
  draft: FreeMockAnswer | null,
): boolean {
  if (!draft) return false;
  if (question.type === "dropdown") {
    if (draft.kind !== "dropdown") return false;
    return Object.keys(question.dropdowns).every((k) => Boolean(draft.values[k]));
  }
  return draft.kind === "mcq" && Boolean(draft.letter);
}

export function FreeMockExamClient() {
  const total = FREE_MOCK_QUESTIONS.length;
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Record<string, FreeMockAnswer>>({});
  const [draft, setDraft] = useState<FreeMockAnswer | null>(null);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [navPending, setNavPending] = useState<NavAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsPayload | null>(null);

  const question = FREE_MOCK_QUESTIONS[qi];
  const locked = Boolean(answers[question.id]);

  const localScore = useMemo(() => {
    return FREE_MOCK_QUESTIONS.reduce(
      (n, q) => n + (isQuestionCorrect(q, answers[q.id]) ? 1 : 0),
      0,
    );
  }, [answers]);

  const syncDraftForIndex = (index: number, nextAnswers: Record<string, FreeMockAnswer>) => {
    const q = FREE_MOCK_QUESTIONS[index];
    const existing = nextAnswers[q.id];
    if (existing) {
      setDraft(existing);
      return;
    }
    if (q.type === "dropdown") {
      setDraft({ kind: "dropdown", values: emptyDropdownValues(q) });
    } else {
      setDraft({ kind: "mcq", letter: "" });
    }
  };

  const goTo = (index: number, nextAnswers = answers) => {
    if (index < 0 || index >= total) return;
    const firstUnanswered = FREE_MOCK_QUESTIONS.findIndex((q) => !nextAnswers[q.id]);
    const frontier = firstUnanswered === -1 ? total - 1 : firstUnanswered;
    if (index > frontier) return;
    setQi(index);
    syncDraftForIndex(index, nextAnswers);
  };

  const withNavPending = (kind: NavAction, action: () => void) => {
    if (navPending) return;
    setNavPending(kind);
    // Let the bars spinner paint, then run the nav — never on hover.
    window.setTimeout(() => {
      action();
      setNavPending(null);
    }, NAV_SPINNER_MS);
  };

  const handlePrevious = () => {
    if (qi <= 0 || navPending) return;
    withNavPending("prev", () => goTo(qi - 1));
  };

  const handleContinue = () => {
    if (navPending) return;
    // Incomplete answers: no click action, no spinner (button stays disabled).
    if (!locked && !answerComplete(question, draft)) return;

    if (locked) {
      if (qi < total - 1) {
        withNavPending("next", () => goTo(qi + 1));
        return;
      }
      withNavPending("next", () => setPhase("gate"));
      return;
    }

    if (!draft) return;

    withNavPending("next", () => {
      const next = { ...answers, [question.id]: draft };
      setAnswers(next);

      if (qi < total - 1) {
        const nextIndex = qi + 1;
        setQi(nextIndex);
        syncDraftForIndex(nextIndex, next);
        return;
      }
      setPhase("gate");
    });
  };

  const handleGateSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const attr = getAttribution();
      const result = await submitFreeMockLead({
        email,
        marketingConsent,
        answers,
        attribution: {
          utm_source: attr.utm_source,
          utm_medium: attr.utm_medium,
          utm_campaign: attr.utm_campaign,
          utm_content: attr.utm_content,
          utm_term: attr.utm_term,
          referrer_category: attr.referrer_category,
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setResults({
        score: result.score,
        maxScore: result.maxScore,
        loBreakdown: result.loBreakdown,
        weakest: result.weakest,
      });
      trackFreeMockCompleted({
        score: result.score,
        max_score: result.maxScore,
        marketing_consent: marketingConsent,
      });
      trackLeadCaptured({
        score: result.score,
        max_score: result.maxScore,
        marketing_consent: marketingConsent,
        lead_source: "free_mock_exam",
      });
      setPhase("results");
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "gate") {
    return (
      <section
        className="rounded-xl border border-ink/10 bg-paper px-5 py-6 sm:px-7 sm:py-8"
        aria-labelledby="free-mock-gate-title"
      >
        <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-orange">
          Results ready
        </p>
        <h2
          id="free-mock-gate-title"
          className="m-0 mt-2 font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-ink"
        >
          You scored {localScore}/{FREE_MOCK_MAX_SCORE}.
        </h2>
        <p className="mt-3 max-w-[36rem] font-body text-[15px] leading-relaxed text-ink/75">
          Enter your email to get your test summary and identify your weakest
          learning objectives, so you know exactly what to revise first.
        </p>
        <form onSubmit={handleGateSubmit} className="mt-6 flex max-w-md flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[13px] font-semibold text-ink">
              Email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 rounded-lg border border-ink/15 bg-paper px-3.5 font-body text-[15px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-orange"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex items-start gap-2.5 font-body text-[13px] leading-snug text-ink/80">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-ink/25"
            />
            <span>
              Email me PMQ revision tips and updates from Learn in Curve. You
              can unsubscribe any time. See our{" "}
              <Link href="/privacy" className="text-orange underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {error ? (
            <p className="m-0 font-body text-[13px] text-rust" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            aria-label={submitting ? "Saving results" : "Show my results"}
            className={`${stampCtaPrimary} self-start disabled:cursor-wait disabled:opacity-60`}
          >
            {submitting ? (
              <Spinner variant="bars" size={16} className="text-current" aria-hidden />
            ) : (
              "Show my results"
            )}
          </button>
        </form>
      </section>
    );
  }

  if (phase === "results" && results) {
    const weakestName = results.weakest[0]?.lo_title ?? "your weak areas";
    return (
      <section
        className="rounded-xl border border-ink/10 bg-paper px-5 py-6 sm:px-7 sm:py-8"
        aria-labelledby="free-mock-results-title"
      >
        <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-orange">
          Your readiness check
        </p>
        <h2
          id="free-mock-results-title"
          className="m-0 mt-2 font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-ink"
        >
          {results.score}/{results.maxScore}
        </h2>
        <p className="mt-3 max-w-[36rem] font-body text-[15px] leading-relaxed text-ink/75">
          Here&apos;s how you did across the learning objectives in this check.
        </p>

        <div className="mt-6">
          <h3 className="m-0 font-display text-lg font-semibold text-ink">
            Weakest areas
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 font-body text-[14.5px] text-ink/85">
            {results.weakest.map((row) => (
              <li key={row.lo_code}>
                <span className="font-semibold">{row.lo_code}</span>
                {": "}
                {row.lo_title} ({row.correct}/{row.total})
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse font-body text-[13.5px]">
            <thead>
              <tr className="border-b border-ink/10 text-left text-ink/55">
                <th className="py-2 pr-3 font-semibold">LO</th>
                <th className="py-2 pr-3 font-semibold">Topic</th>
                <th className="py-2 font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.loBreakdown.map((row) => (
                <tr key={row.lo_code} className="border-b border-ink/5">
                  <td className="py-2 pr-3 font-semibold text-ink">{row.lo_code}</td>
                  <td className="py-2 pr-3 text-ink/80">{row.lo_title}</td>
                  <td className="py-2 text-ink">
                    {row.correct}/{row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/courses/pmq-in-5-days"
            className={stampCtaPrimary}
          >
            The 5-day plan covers {weakestName} in depth. Start free →
          </Link>
          <Link href="/courses" className={stampCtaSecondaryFlat}>
            Browse courses
          </Link>
        </div>
      </section>
    );
  }

  const lockedAnswer = answers[question.id];
  const mcqValue =
    draft?.kind === "mcq"
      ? draft.letter
      : lockedAnswer?.kind === "mcq"
        ? lockedAnswer.letter
        : "";

  const dropdownValues =
    draft?.kind === "dropdown"
      ? draft.values
      : lockedAnswer?.kind === "dropdown"
        ? lockedAnswer.values
        : emptyDropdownValues(question);

  const canContinue =
    locked || answerComplete(question, draft);
  const continueLabel = qi < total - 1 ? "Continue" : "Finish";

  return (
    <section
      className={styles.card}
      aria-labelledby="free-mock-quiz-title"
      data-quiz-card=""
    >
      <div className="mb-1 text-left">
        <p className="m-0 font-body text-[9px] font-bold uppercase tracking-[0.14em] text-orange sm:text-[10px]">
          Free mock exam
        </p>
        <h2
          id="free-mock-quiz-title"
          className="m-0 mt-1.5 text-balance font-display text-[1.15rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[1.25rem]"
        >
          Question {qi + 1} of {total}
        </h2>
      </div>

      <div className={styles.body}>
        <div className={styles.runner} aria-label="Free mock exam">
          <div className={styles.qRail}>
            <div
              className={styles.qGrid}
              role="tablist"
              aria-label="Questions"
              style={{ ["--quiz-total" as string]: total }}
            >
              {FREE_MOCK_QUESTIONS.map((q, index) => {
                const done = answers[q.id];
                const current = index === qi;
                const cellClass = [
                  styles.qCell,
                  current ? styles.qCellCurrent : "",
                  !current && done ? styles.qCellDone : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={q.id}
                    type="button"
                    role="tab"
                    aria-selected={current}
                    className={cellClass}
                    disabled={Boolean(navPending)}
                    onClick={() => goTo(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            {question.type === "dropdown" ? (
              <InlineDropdownResponseFields
                prompt={question.prompt}
                options={question.dropdowns}
                values={dropdownValues}
                disabled={locked || Boolean(navPending)}
                questionNumber={qi + 1}
                questionTotal={total}
                onChange={(key, value) => {
                  setDraft((prev) => {
                    const base =
                      prev?.kind === "dropdown"
                        ? prev.values
                        : emptyDropdownValues(question);
                    return {
                      kind: "dropdown",
                      values: { ...base, [key]: value },
                    };
                  });
                }}
                getState={(key): ResponseVisualState => {
                  return dropdownValues[key] ? "selected" : "default";
                }}
              />
            ) : (
              <>
                <p className="mb-4 font-body text-[15px] font-medium leading-relaxed text-ink">
                  {question.prompt}
                </p>
                <McqResponseFields
                  options={question.options}
                  value={mcqValue}
                  disabled={locked || Boolean(navPending)}
                  ariaLabel={`Question ${qi + 1} options`}
                  onChange={(letter) =>
                    setDraft({ kind: "mcq", letter })
                  }
                  getState={(letter): ResponseVisualState => {
                    return letter === mcqValue ? "selected" : "default";
                  }}
                />
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            {qi > 0 ? (
              <button
                type="button"
                className={`${stampCtaSecondaryFlat} ${stampCtaCompact}${
                  navPending === "prev" ? " cursor-wait opacity-60" : ""
                }`}
                disabled={Boolean(navPending)}
                aria-busy={navPending === "prev"}
                aria-label={navPending === "prev" ? "Going back" : "Previous"}
                onClick={handlePrevious}
              >
                {navPending === "prev" ? (
                  <Spinner variant="bars" size={14} className="text-current" aria-hidden />
                ) : (
                  "Previous"
                )}
              </button>
            ) : (
              <span aria-hidden className="min-w-0" />
            )}
            <button
              type="button"
              className={`${stampCtaPrimary} ${stampCtaCompact}${
                navPending === "next"
                  ? " cursor-wait opacity-60"
                  : !canContinue
                    ? " opacity-50"
                    : ""
              }`}
              disabled={!canContinue || Boolean(navPending)}
              aria-busy={navPending === "next" || undefined}
              aria-label={
                navPending === "next"
                  ? continueLabel === "Finish"
                    ? "Finishing"
                    : "Continuing"
                  : continueLabel
              }
              onClick={handleContinue}
            >
              {navPending === "next" ? (
                <Spinner variant="bars" size={14} className="text-current" aria-hidden />
              ) : (
                continueLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
