"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { ClipboardList, Zap } from "lucide-react";
import {
  startPfqPracticeSet,
  getPfqPracticeInventory,
} from "@/lib/pfq/practice-actions";
import { canAccessPfqQuizSet, pfqTierAtLeast, type PfqTier } from "@/lib/pfq/tiers";
import { showPracticeGenerateHint } from "@/components/pmq/PracticeGenerateHint";
import { Spinner } from "@/components/ui/spinner";
import { PfqPracticeSetPlay } from "@/components/pfq/PfqPracticeSetPlay";
import styles from "@/components/pmq/PracticeQuiz.module.css";
import type { PfqPublicQuestion } from "@/lib/pfq/types";

type LoadedSet = {
  sessionId: string;
  questions: PfqPublicQuestion[];
};

type Props = {
  objective: number;
  objectiveTitle: string;
  userTier: PfqTier;
  /** When known from the server; client refetches if omitted or 0. */
  totalSets?: number;
};

export function PfqPracticeQuizSection({
  objective,
  objectiveTitle: _objectiveTitle,
  userTier,
  totalSets: totalSetsProp = 0,
}: Props) {
  const hasProAccess = pfqTierAtLeast(userTier, "pro");
  const [totalSets, setTotalSets] = useState(Math.max(0, totalSetsProp));
  const [loaded, setLoaded] = useState<Record<number, LoadedSet>>({});
  const [activeSet, setActiveSet] = useState(1);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const setTabRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const booted = useRef(false);

  const paidSetNumbers = useMemo(
    () => Array.from({ length: Math.max(0, totalSets - 1) }, (_, i) => i + 2),
    [totalSets],
  );

  const nextSetNumber =
    paidSetNumbers.find((n) => loaded[n] == null) ?? null;
  const allPaidSetsUnlocked = nextSetNumber == null;
  const canGenerateMore =
    nextSetNumber != null && canAccessPfqQuizSet(userTier, nextSetNumber);
  const showGenerateCta = nextSetNumber != null;
  const unlockedPaidCount = paidSetNumbers.filter((n) => loaded[n] != null).length;
  const moreSetsCount = Math.max(0, totalSets - 1 - unlockedPaidCount);

  const setNumbers = Array.from({ length: totalSets }, (_, i) => i + 1);
  const readySets = setNumbers.filter((n) => loaded[n] != null);
  const showSetTabs = readySets.length > 0 && totalSets > 1;

  const active = loaded[activeSet] ?? null;

  function loadSet(setNumber: number) {
    setError("");
    if (!canAccessPfqQuizSet(userTier, setNumber)) {
      showPracticeGenerateHint("pro");
      return;
    }
    startTransition(async () => {
      const result = await startPfqPracticeSet({ objective, setNumber });
      if (!result.ok) {
        if (result.code === "locked") {
          showPracticeGenerateHint("pro");
          return;
        }
        setError(
          result.code === "not_signed_in"
            ? "Sign in to generate another set."
            : result.error,
        );
        return;
      }
      setLoaded((prev) => ({
        ...prev,
        [setNumber]: {
          sessionId: result.sessionId,
          questions: result.questions,
        },
      }));
      setActiveSet(setNumber);
    });
  }

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    startTransition(async () => {
      if (totalSetsProp <= 0) {
        const inventory = await getPfqPracticeInventory({ objective });
        if (inventory.ok) setTotalSets(inventory.totalSets);
      }
      const result = await startPfqPracticeSet({
        objective,
        setNumber: 1,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLoaded((prev) => ({
        ...prev,
        1: { sessionId: result.sessionId, questions: result.questions },
      }));
    });
  }, [objective, totalSetsProp]);

  const handleGenerate = () => {
    if (nextSetNumber == null) return;
    loadSet(nextSetNumber);
  };

  const generateLabel = pending
    ? "Generating…"
    : nextSetNumber != null && canAccessPfqQuizSet(userTier, nextSetNumber)
      ? `Generate set ${nextSetNumber}`
      : "Generate";

  const handleSetSelect = (n: number) => {
    if (loaded[n] == null) return;
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
        aria-labelledby="pfq-practise-sets-title"
        data-quiz-card=""
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <ClipboardList
              className={styles.icon}
              strokeWidth={1.75}
              aria-hidden
            />
            <h2 id="pfq-practise-sets-title" className={styles.title}>
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
                        id={`pfq-quiz-set-tab-${n}`}
                        aria-controls="pfq-quiz-set-panel"
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
                  +{moreSetsCount} more {moreSetsCount === 1 ? "set" : "sets"}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className={styles.errorRow} role="alert">
            <span>{error}</span>
          </div>
        ) : null}

        <div
          id="pfq-quiz-set-panel"
          className={styles.body}
          role={showSetTabs ? "tabpanel" : undefined}
          aria-labelledby={
            showSetTabs
              ? `pfq-quiz-set-tab-${activeSet}`
              : "pfq-practise-sets-title"
          }
        >
          {active && active.questions.length > 0 ? (
            <PfqPracticeSetPlay
              key={`${active.sessionId}-${activeSet}`}
              sessionId={active.sessionId}
              questions={active.questions}
            />
          ) : pending ? (
            <p className={styles.empty}>
              <Spinner variant="ring" size={16} className="text-teal" />
            </p>
          ) : (
            <p className={styles.empty}>
              {activeSet === 1
                ? "No questions for this set yet."
                : canAccessPfqQuizSet(userTier, activeSet)
                  ? `Generate set ${activeSet} to start.`
                  : "More sets unlock with Pro."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
