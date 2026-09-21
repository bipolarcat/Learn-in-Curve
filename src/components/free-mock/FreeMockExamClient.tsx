"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  InlineDropdownResponseFields,
  McqResponseFields,
  type ResponseVisualState,
} from "@/components/pmq/QuestionResponseFields";
import { JoinWaitlistButton } from "@/components/pmq/JoinWaitlistButton";
import {
  stampCtaCompact,
  stampCtaPrimary,
  stampCtaSecondaryFlat,
} from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { getAttribution } from "@/lib/analytics/attribution";
import {
  trackFreeMockCompleted,
  trackFreeMockLeadCaptured,
  trackFreeMockStarted,
} from "@/lib/analytics/events";
import { submitFreeMockLead } from "@/lib/free-mock/actions";
import type { FreeMockExamConfig } from "@/lib/free-mock/config";
import {
  isQuestionCorrect,
  type FreeMockAnswer,
  type LoBreakdownRow,
} from "@/lib/free-mock/scoring";
import type { FreeMockExamId, FreeMockItem } from "@/lib/free-mock/types";
import styles from "@/components/pmq/PracticeQuiz.module.css";
import pageStyles from "@/components/free-mock/FreeMockExam.module.css";

type Phase = "quiz" | "gate" | "results";

type ResultsPayload = {
  score: number;
  maxScore: number;
  loBreakdown: LoBreakdownRow[];
  weakest: LoBreakdownRow[];
};

type NavAction = "prev" | "next";

const NAV_SPINNER_MS = 280;

export type FreeMockExamClientProps = {
  examId: FreeMockExamId;
  items: FreeMockItem[];
  config: Pick<
    FreeMockExamConfig,
    | "displayName"
    | "mark"
    | "gatePrompt"
    | "marketingConsentLabel"
    | "breakdownNoun"
    | "breakdownNounPlural"
    | "resultsCtaKind"
    | "ctaHref"
    | "ctaLabel"
    | "waitlistNotifyKey"
    | "waitlistSubjectLabel"
    | "waitlistCourseCopy"
    | "disclaimer"
  >;
};

function emptyDropdownValues(item: FreeMockItem): Record<string, string> {
  if (item.type !== "dropdown" || !item.dropdowns) return {};
  return Object.fromEntries(Object.keys(item.dropdowns).map((k) => [k, ""]));
}

function answerComplete(
  item: FreeMockItem,
  draft: FreeMockAnswer | null,
): boolean {
  if (!draft) return false;
  if (item.type === "dropdown") {
    if (draft.kind !== "dropdown" || !item.dropdowns) return false;
    return Object.keys(item.dropdowns).every((k) => Boolean(draft.values[k]));
  }
  return draft.kind === "mcq" && Boolean(draft.letter);
}

export function FreeMockExamClient({
  examId,
  items,
  config,
}: FreeMockExamClientProps) {
  const total = items.length;
  const maxScore = total;
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
  const startedTracked = useRef(false);

  useEffect(() => {
    if (startedTracked.current) return;
    startedTracked.current = true;
    trackFreeMockStarted({ exam_id: examId });
  }, [examId]);

  const question = items[qi];
  const locked = Boolean(answers[question.id]);

  const localScore = useMemo(() => {
    return items.reduce(
      (n, item) => n + (isQuestionCorrect(item, answers[item.id]) ? 1 : 0),
      0,
    );
  }, [answers, items]);

  const syncDraftForIndex = (
    index: number,
    nextAnswers: Record<string, FreeMockAnswer>,
  ) => {
    const item = items[index];
    const existing = nextAnswers[item.id];
    if (existing) {
      setDraft(existing);
      return;
    }
    if (item.type === "dropdown") {
      setDraft({ kind: "dropdown", values: emptyDropdownValues(item) });
    } else {
      setDraft({ kind: "mcq", letter: "" });
    }
  };

  const goTo = (index: number, nextAnswers = answers) => {
    if (index < 0 || index >= total) return;
    const firstUnanswered = items.findIndex((item) => !nextAnswers[item.id]);
    const frontier = firstUnanswered === -1 ? total - 1 : firstUnanswered;
    if (index > frontier) return;
    setQi(index);
    syncDraftForIndex(index, nextAnswers);
  };

  const withNavPending = (kind: NavAction, action: () => void) => {
    if (navPending) return;
    setNavPending(kind);
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
        examId,
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
        exam_id: examId,
        score: result.score,
        max_score: result.maxScore,
        marketing_consent: marketingConsent,
      });
      trackFreeMockLeadCaptured({
        exam_id: examId,
        score: result.score,
        max_score: result.maxScore,
        marketing_consent: marketingConsent,
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
          You scored {localScore}/{maxScore}.
        </h2>
        <p className="mt-3 max-w-[36rem] font-body text-[15px] leading-relaxed text-ink/75">
          {config.gatePrompt}
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
              {config.marketingConsentLabel} See our{" "}
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
            className={`${stampCtaPrimary} self-start disabled:opacity-60`}
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
    const categoryHeader =
      config.breakdownNoun === "domain" ? "Domain" : "LO";
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
          Here&apos;s how you did across the {config.breakdownNounPlural} in
          this check.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse font-body text-[13.5px]">
            <thead>
              <tr className="border-b border-ink/10 text-left text-ink/55">
                <th className="py-2 pr-3 font-semibold">{categoryHeader}</th>
                <th className="py-2 pr-3 font-semibold">Topic</th>
                <th className="py-2 font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.loBreakdown.map((row) => (
                <tr key={row.lo_code} className="border-b border-ink/5">
                  <td className="py-2 pr-3 font-semibold text-ink">
                    {row.lo_code}
                  </td>
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
          {config.resultsCtaKind === "course" && config.ctaHref ? (
            <Link href={config.ctaHref} className={stampCtaPrimary}>
              {config.ctaLabel}
            </Link>
          ) : config.waitlistNotifyKey ? (
            <JoinWaitlistButton
              className={stampCtaPrimary}
              notifyKey={config.waitlistNotifyKey}
              subjectLabel={config.waitlistSubjectLabel ?? config.displayName}
              courseCopy={
                config.waitlistCourseCopy ?? `a ${config.displayName} readiness course`
              }
              label={config.ctaLabel}
            />
          ) : null}
          {config.resultsCtaKind === "course" ? (
            <Link href="/courses" className={stampCtaSecondaryFlat}>
              Browse courses
            </Link>
          ) : (
            <Link href="/mock-me" className={stampCtaSecondaryFlat}>
              More readiness checks
            </Link>
          )}
        </div>

        <p className="mt-8 max-w-[40rem] font-body text-[12px] leading-relaxed text-ink/55">
          {config.disclaimer}
        </p>
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

  const canContinue = locked || answerComplete(question, draft);
  const continueLabel = qi < total - 1 ? "Continue" : "Finish";

  return (
    <section
      className={`${styles.card} ${pageStyles.quizPrimary}`}
      aria-labelledby="free-mock-quiz-title"
      data-quiz-card=""
      data-primary-console=""
    >
      <div className="mb-1 text-left">
        <p className="m-0 font-body text-[9px] font-bold uppercase tracking-[0.14em] text-orange sm:text-[10px]">
          {config.mark} mock exam
        </p>
        <h2
          id="free-mock-quiz-title"
          className="m-0 mt-1.5 text-balance font-display text-[1.15rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[1.25rem]"
        >
          Question {qi + 1} of {total}
        </h2>
      </div>

      <div className={styles.body}>
        <div className={styles.runner} aria-label={`Free ${config.mark} readiness check`}>
          <div className={styles.qRail}>
            <div
              className={styles.qGrid}
              role="tablist"
              aria-label="Questions"
              style={{ ["--quiz-total" as string]: total }}
            >
              {items.map((item, index) => {
                const done = answers[item.id];
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
                    key={item.id}
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
            {question.type === "dropdown" && question.dropdowns ? (
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
                  options={question.options ?? []}
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
                  navPending === "prev" ? " opacity-60" : ""
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
                  ? " opacity-60"
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
