"use client";

import {
  useState,
  useTransition,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import { ClipboardList, Zap } from "lucide-react";
import { getQuizSet } from "@/lib/pmq/actions";
import { quizSetContext } from "@/lib/pmq/quiz-sets";
import {
  canAccessQuizSet,
  tierAtLeast,
  tierForQuizSet,
  type PmqTier,
} from "@/lib/pmq/tiers";
import { QuizRunner } from "@/components/pmq/QuizRunner";
import { showPracticeGenerateHint } from "@/components/pmq/PracticeGenerateHint";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/components/pmq/PracticeQuiz.module.css";
import type { PmqQuestion } from "@/types/pmq";
import type { QuizPriorAttempt } from "@/components/pmq/QuizRunner";

type PracticeQuizSectionProps = {
  loNumber: number;
  loCode: string;
  set1Questions: PmqQuestion[];
  totalSets: number;
  userTier: PmqTier;
  priceCents: number;
  checkpointTotal?: number;
  priorAttempts?: Record<string, QuizPriorAttempt>;
  initialLoXp?: number;
};

function setIsReady(
  n: number,
  set1Questions: PmqQuestion[],
  paidSets: Record<number, PmqQuestion[]>,
): boolean {
  if (n === 1) return set1Questions.length > 0;
  return (paidSets[n]?.length ?? 0) > 0;
}

/**
 * Practise — question-first card. Only unlocked sets show as tabs;
 * remaining mini-sets stay advertised without locking the chrome.
 */
export function PracticeQuizSection({
  loNumber,
  loCode,
  set1Questions,
  totalSets: totalSetsProp,
  userTier,
  checkpointTotal = 0,
  priorAttempts: initialPriorAttempts = {},
}: PracticeQuizSectionProps) {
  const totalSets = Math.max(1, totalSetsProp);
  const hasProAccess = tierAtLeast(userTier, "pro");
  const paidSetNumbers = useMemo(
    () => Array.from({ length: Math.max(0, totalSets - 1) }, (_, i) => i + 2),
    [totalSets],
  );

  const [paidSets, setPaidSets] = useState<Record<number, PmqQuestion[]>>({});
  const [extraPriorAttempts, setExtraPriorAttempts] = useState<
    Record<string, QuizPriorAttempt>
  >({});
  const [activeSet, setActiveSet] = useState(1);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const setTabRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const priorAttempts = { ...initialPriorAttempts, ...extraPriorAttempts };

  const nextSetNumber =
    paidSetNumbers.find((n) => paidSets[n] == null) ?? null;
  const allPaidSetsUnlocked = nextSetNumber == null;
  /** Still something left to Generate that this tier can open. */
  const canGenerateMore =
    nextSetNumber != null && canAccessQuizSet(userTier, nextSetNumber);
  /** CTA stays while any higher set exists (incl. upsell past tier max). */
  const showGenerateCta = nextSetNumber != null;
  const unlockedPaidCount = paidSetNumbers.filter(
    (n) => paidSets[n] != null,
  ).length;
  /** How many mini-sets still sit behind Generate / upgrade — advertised, not listed as locked pills. */
  const moreSetsCount = Math.max(0, totalSets - 1 - unlockedPaidCount);

  const setNumbers = Array.from({ length: totalSets }, (_, i) => i + 1);
  const readySets = setNumbers.filter((n) =>
    setIsReady(n, set1Questions, paidSets),
  );
  const showSetTabs = readySets.length > 0 && totalSets > 1;

  const activeQuestions =
    activeSet === 1 ? set1Questions : (paidSets[activeSet] ?? []);
  const attemptContext = quizSetContext(activeSet);
  const activeReady = setIsReady(activeSet, set1Questions, paidSets);

  const handleGenerate = () => {
    setError("");

    if (nextSetNumber == null) return;

    const setNumber = nextSetNumber;
    if (!canAccessQuizSet(userTier, setNumber)) {
      const need = tierForQuizSet(setNumber);
      showPracticeGenerateHint(need === "ai_pro" ? "ai_pro" : "pro");
      return;
    }

    startTransition(async () => {
      const result = await getQuizSet({ loNumber, setNumber });
      if ("error" in result) {
        if (result.error === "locked" || result.error === "locked_ai_pro") {
          showPracticeGenerateHint(
            result.error === "locked_ai_pro" ? "ai_pro" : "pro",
          );
          return;
        }
        setError(
          result.error === "not_signed_in"
            ? "Sign in to generate another set."
            : String(result.error),
        );
        return;
      }
      if (result.questions.length === 0) {
        setError("This set isn’t ready yet. Try again shortly.");
        return;
      }
      setPaidSets((prev) => ({ ...prev, [setNumber]: result.questions }));
      setExtraPriorAttempts((prev) => ({
        ...prev,
        ...result.priorAttempts,
      }));
      setActiveSet(setNumber);
    });
  };

  const generateLabel = pending
    ? "Generating…"
    : nextSetNumber != null && canAccessQuizSet(userTier, nextSetNumber)
      ? `Generate set ${nextSetNumber}`
      : "Generate";

  const handleSetSelect = (n: number) => {
    if (!setIsReady(n, set1Questions, paidSets)) return;
    setActiveSet(n);
    setError("");
  };

  const handleSetTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentSet: number,
  ) => {
    const currentIndex = readySets.indexOf(currentSet);
    if (currentIndex < 0 || readySets.length === 0) return;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % readySets.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + readySets.length) % readySets.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = readySets.length - 1;
    }
    if (nextIndex == null) return;
    event.preventDefault();
    const nextSet = readySets[nextIndex]!;
    handleSetSelect(nextSet);
    requestAnimationFrame(() => setTabRefs.current[nextSet]?.focus());
  };

  return (
    <div id="lo-quiz" className="scroll-mt-28 md:scroll-mt-32">
      <section
        className={styles.card}
        aria-labelledby="lo-practise-sets-title"
        data-quiz-card=""
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <ClipboardList
              className={styles.icon}
              strokeWidth={1.75}
              aria-hidden
            />
            <h2 id="lo-practise-sets-title" className={styles.title}>
              Practise quiz
            </h2>
          </div>

          {showGenerateCta ? (
            <div className={styles.generateWrap}>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={pending || (hasProAccess && allPaidSetsUnlocked)}
                aria-busy={pending && canGenerateMore}
                aria-label={
                  canGenerateMore
                    ? generateLabel
                    : nextSetNumber != null &&
                        tierForQuizSet(nextSetNumber) === "ai_pro"
                      ? "Generate quiz sets — AI Pro Bundle"
                      : "Generate quiz sets — Pro Bundle"
                }
                className={`${styles.generateBtn} ${
                  hasProAccess
                    ? styles.generateBtnPro
                    : styles.generateBtnMuted
                }`}
              >
                {pending && canGenerateMore ? (
                  <Spinner
                    variant="ring"
                    size={12}
                    className="text-teal"
                    aria-hidden
                  />
                ) : (
                  <Zap className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                )}
                <span className="min-w-0 truncate">
                  {canGenerateMore ? generateLabel : "Generate"}
                </span>
              </button>
            </div>
          ) : null}
        </div>

        <p className={styles.hint}>
          One try per question. Review feedback any time.
        </p>

        {showSetTabs || moreSetsCount > 0 ? (
          <div className={styles.setsChrome} aria-label="Quiz sets">
            <div className={styles.setRail}>
              {showSetTabs ? (
                <div
                  className={styles.setTabs}
                  role="tablist"
                  aria-label="Unlocked quiz sets"
                >
                  {readySets.map((n) => {
                    const selected = activeSet === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="tab"
                        ref={(element) => {
                          setTabRefs.current[n] = element;
                        }}
                        id={`quiz-set-tab-${n}`}
                        aria-controls="quiz-set-panel"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        aria-label={`Quiz set ${n}`}
                        onClick={() => handleSetSelect(n)}
                        onKeyDown={(event) => handleSetTabKeyDown(event, n)}
                        className={`${styles.setTab} ${
                          selected ? styles.setTabSelected : ""
                        }`}
                      >
                        Set {n}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {moreSetsCount > 0 ? (
                <p className={styles.moreSets} aria-live="polite">
                  +{moreSetsCount} more{" "}
                  {moreSetsCount === 1 ? "set" : "sets"}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className={styles.errorRow} role="alert">
            <span>{error}</span>
            {showGenerateCta && canGenerateMore ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={pending}
                aria-busy={pending}
                aria-label={pending ? "Retrying" : "Retry"}
                className={styles.retryLink}
              >
                {pending ? (
                  <Spinner
                    variant="ring"
                    size={14}
                    className="text-teal"
                    aria-hidden
                  />
                ) : (
                  "Retry"
                )}
              </button>
            ) : null}
          </div>
        ) : null}

        <div
          id="quiz-set-panel"
          className={styles.body}
          role={showSetTabs ? "tabpanel" : undefined}
          aria-labelledby={
            showSetTabs
              ? `quiz-set-tab-${activeSet}`
              : "lo-practise-sets-title"
          }
        >
          {activeReady && activeQuestions.length > 0 ? (
            <QuizRunner
              key={`${attemptContext}-${activeQuestions.length}`}
              questions={activeQuestions}
              loNumber={loNumber}
              loCode={loCode}
              checkpointTotal={checkpointTotal}
              attemptContext={attemptContext}
              setNumber={activeSet}
              priorAttempts={priorAttempts}
              embedded
            />
          ) : (
            <p className={styles.empty}>
              {activeSet === 1
                ? "No questions for this set yet."
                : canAccessQuizSet(userTier, activeSet)
                  ? `Generate set ${activeSet} to start.`
                  : tierForQuizSet(activeSet) === "ai_pro"
                    ? "More sets unlock with AI Pro."
                    : "More sets unlock with Pro."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
