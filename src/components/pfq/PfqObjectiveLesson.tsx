"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Flag } from "lucide-react";
import { StudyJourney } from "@/components/course/StudyJourney";
import {
  CHECKPOINT_GATE_COPY,
  showCheckpointGateHint,
} from "@/components/pmq/CheckpointGateHint";
import { LoPageHeader } from "@/components/pmq/LoPageHeader";
import { LoApplyStage } from "@/components/pmq/LoApplyStage";
import { LoOrientStage } from "@/components/pmq/LoOrientStage";
import { Lo1CoreContentStudy } from "@/components/pmq/Lo1CoreContentStudy";
import { PfqCheckpointList } from "@/components/pfq/PfqCheckpointList";
import { PfqPracticeQuizSection } from "@/components/pfq/PfqPracticeQuizSection";
import type { PfqTier } from "@/lib/pfq/tiers";
import {
  productActionSecondary,
  productSurfaceOpaque,
} from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { CtaArrow, CtaArrowLeft } from "@/components/stamp-chip";
import motion from "@/components/pmq/PmqMotion.module.css";
import type { PfqObjectiveLesson } from "@/lib/pfq/content";
import type { CoreContentBlock as PmqCoreBlock } from "@/types/pmq";
import {
  buildPfqStages,
  PFQ_PROGRESS_UNIT_PERCENT,
  PFQ_STAGE_REACHED_COLUMN,
  type PfqStageId,
} from "@/lib/pfq/lesson-stages";
import { markPfqStageReached } from "@/lib/pfq/lesson-actions";
import { PFQ_LEARN_HREF } from "@/lib/pfq/constants";
import { canSealLo } from "@/lib/pmq/lo-stages";

type Props = {
  lesson: PfqObjectiveLesson;
  checklistState: number[];
  completed: boolean;
  dbReachedStageIds: PfqStageId[];
  completionPercent?: number;
  userTier: PfqTier;
  practiceTotalSets: number;
};

function firstMarkdownHeading(md: string): string | null {
  const match = /^##\s+(.+)$/m.exec(md);
  return match?.[1]?.trim() ?? null;
}

function toPmqCoreBlocks(
  blocks: PfqObjectiveLesson["core_content"],
): PmqCoreBlock[] {
  return blocks.map((block) => {
    let body = block.body_markdown;
    let tipHeading = firstMarkdownHeading(body);
    if (block.watch_for && !tipHeading) {
      tipHeading = block.outcome_title || "Key points";
      body = `## ${tipHeading}\n\n${body}`;
    }
    return {
      outcome_code: block.outcome_code,
      outcome_title: block.outcome_title,
      key_takeaway: block.key_takeaway,
      body_markdown: body,
      exam_tips:
        block.watch_for && tipHeading
          ? [
              {
                id: `watch-${block.outcome_code}`,
                heading: tipHeading,
                placement: "after_section" as const,
                tip: block.watch_for,
              },
            ]
          : undefined,
    };
  });
}

/**
 * PFQ objective pathway — Orient → Learn → Polish → Drill → Lock in.
 * Misconceptions + memory aids live on Polish (same dialect as PMQ).
 * Does not write pfq_coverage_signals.
 */
export function PfqObjectiveLessonView({
  lesson,
  checklistState,
  completed,
  dbReachedStageIds,
  completionPercent = 0,
  userTier,
  practiceTotalSets,
}: Props) {
  const stages = useMemo(() => buildPfqStages(), []);
  const sealed = completed;
  const checkpointTotal = lesson.progress_checkpoint.length;
  const sealReady = canSealLo({
    checkpointTotal,
    completedCheckpointCount: checklistState.length,
  });

  const [checkpointReady, setCheckpointReady] = useState(
    () => sealed || sealReady || checkpointTotal <= 0,
  );
  const [focusOutcomeCode, setFocusOutcomeCode] = useState<string | null>(null);

  useEffect(() => {
    if (sealed || sealReady || checkpointTotal <= 0) {
      setCheckpointReady(true);
    }
  }, [sealed, sealReady, checkpointTotal]);

  const onChecklistReadyChange = useCallback((ready: boolean) => {
    setCheckpointReady(ready);
  }, []);

  const router = useRouter();
  const [navPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const prevObjective =
    lesson.objective_number > 1 ? lesson.objective_number - 1 : null;
  const nextObjective =
    lesson.objective_number < 10 ? lesson.objective_number + 1 : null;
  const nextHref = nextObjective
    ? `${PFQ_LEARN_HREF}/${nextObjective}`
    : PFQ_LEARN_HREF;
  const prevHref = prevObjective
    ? `${PFQ_LEARN_HREF}/${prevObjective}`
    : null;

  const go = useCallback(
    (href: string) => {
      if (pendingHref) return;
      setPendingHref(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [pendingHref, router, startTransition],
  );

  const goNext = useCallback(() => {
    go(nextHref);
  }, [go, nextHref]);

  const checkpointContinueLabel = nextObjective
    ? `Continue to LO${nextObjective}`
    : "Back to objectives";

  const timestampStageIds = useMemo(
    () =>
      (Object.keys(PFQ_STAGE_REACHED_COLUMN) as PfqStageId[]).filter(
        (id) => PFQ_STAGE_REACHED_COLUMN[id],
      ),
    [],
  );

  const onStagesMarkedDone = useCallback(
    (newlyDone: PfqStageId[]) => {
      for (const stageId of newlyDone) {
        if (!PFQ_STAGE_REACHED_COLUMN[stageId]) continue;
        void markPfqStageReached({
          objective: lesson.objective_number,
          stageId,
        }).catch((err) => {
          console.error("[PfqObjectiveLesson] markPfqStageReached failed:", err);
        });
      }
    },
    [lesson.objective_number],
  );

  const definitions = useMemo(
    () =>
      lesson.key_definitions.map((d) => ({
        term: d.term,
        plain_english: d.plain_english,
        apm_definition: d.definition,
      })),
    [lesson.key_definitions],
  );

  const orientOutcomes = useMemo(
    () =>
      lesson.learning_outcomes.map((code) => {
        const title =
          lesson.core_content.find((b) => b.outcome_code === code)
            ?.outcome_title ?? code;
        return `${code}) ${title}`;
      }),
    [lesson.learning_outcomes, lesson.core_content],
  );

  const coreBlocks = useMemo(
    () => toPmqCoreBlocks(lesson.core_content),
    [lesson.core_content],
  );

  return (
    <StudyJourney<PfqStageId>
      unitKey={lesson.objective_number}
      stages={stages}
      sealed={sealed}
      quizStageId="drill"
      quizCompleted={dbReachedStageIds.includes("drill")}
      checkpointStageId="checkpoint"
      dbReachedStageIds={dbReachedStageIds}
      timestampStageIds={timestampStageIds}
      completionPercent={completionPercent}
      progressUnitPercent={PFQ_PROGRESS_UNIT_PERCENT}
      onStagesMarkedDone={onStagesMarkedDone}
      checkpointContinueLabel={checkpointContinueLabel}
      headerLastContinueLabel={nextObjective ? "Next LO" : "Overview"}
      checkpointReady={checkpointReady}
      onCheckpointContinue={goNext}
      showCheckpointContinueButton={false}
      srTitle={`LO ${lesson.objective_number}: ${lesson.title}`}
      renderChrome={(ctx) => (
        <LoPageHeader
          loNumber={lesson.objective_number}
          loTitle={lesson.title}
          unitLabel={`LO${lesson.objective_number}`}
          overviewHref={PFQ_LEARN_HREF}
          stages={ctx.stages}
          currentId={ctx.currentId}
          unlockedIds={ctx.unlockedIds}
          lockedIds={ctx.lockedIds}
          onSelect={(id) => ctx.selectStage(id as PfqStageId)}
          continueLabel={ctx.continueLabel}
          onContinue={ctx.onContinue}
          continueEnabled={ctx.continueEnabled}
          completionPercent={ctx.optimisticCompletionPercent}
        />
      )}
      renderStage={(currentId, { jumpToStage }) => {
        if (currentId === "orient") {
          return (
            <LoOrientStage
              context={lesson.where_this_fits}
              outcomes={orientOutcomes}
              definitions={definitions}
              badgeVariant="stamp"
              outcomesSubtitle="Mapped to the APM PFQ syllabus"
              onJumpToOutcome={(code) => {
                setFocusOutcomeCode(code);
                jumpToStage("learn");
              }}
            />
          );
        }

        if (currentId === "learn") {
          return (
            <div
              className="lo-learn-stage flex min-w-0 flex-col gap-3 sm:gap-3.5"
              aria-label="Learn"
            >
              {coreBlocks.length > 0 ? (
                <Lo1CoreContentStudy
                  blocks={coreBlocks}
                  studyTables
                  activities={false}
                  badgeVariant="stamp"
                  bodyVariant="pfq-takeaway"
                  focusOutcomeCode={focusOutcomeCode}
                  onFocusOutcomeConsumed={() => setFocusOutcomeCode(null)}
                />
              ) : null}
            </div>
          );
        }

        if (currentId === "apply") {
          return (
            <LoApplyStage
              misconceptions={lesson.misconceptions}
              memoryAids={lesson.memory_aids}
            />
          );
        }

        if (currentId === "drill") {
          return (
            <PfqPracticeQuizSection
              objective={lesson.objective_number}
              objectiveTitle={lesson.title}
              userTier={userTier}
              totalSets={practiceTotalSets}
            />
          );
        }

        if (currentId === "checkpoint") {
          const showDone = sealed || checkpointReady;
          return (
            <div className="w-full min-w-0">
              <section
                className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
                aria-labelledby="pfq-lock-in"
              >
                <div className="flex w-full min-w-0 items-start gap-2 sm:gap-2.5">
                  <Flag
                    className="mt-0.5 size-7 shrink-0 text-orange sm:size-8"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <h2
                      id="pfq-lock-in"
                      className="font-body text-lg font-semibold leading-none tracking-tight text-ink"
                    >
                      Checkpoint
                    </h2>
                    <p className="mt-0.5 m-0 font-body text-[14px] leading-relaxed text-ink/70">
                      Tick off each checkpoint once you&apos;re able to recall
                      it confidently.
                    </p>
                  </div>
                  {showDone ? (
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-olive/15 bg-olive/[0.08] py-1 pl-1 pr-2.5 font-body text-[11px] font-semibold tracking-tight text-olive"
                      aria-live="polite"
                    >
                      <span
                        className="inline-flex size-4 items-center justify-center rounded-full bg-olive text-paper"
                        aria-hidden
                      >
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                      Complete
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 w-full min-w-0 sm:mt-3.5">
                  <PfqCheckpointList
                    objective={lesson.objective_number}
                    items={lesson.progress_checkpoint}
                    initialCompleted={checklistState}
                    initiallyComplete={completed}
                    onReadyChange={onChecklistReadyChange}
                  />
                </div>
              </section>

              <nav
                className="mt-6 flex flex-wrap items-center justify-between gap-3 sm:mt-8"
                aria-label="Learning objective navigation"
              >
                {prevHref ? (
                  <button
                    type="button"
                    disabled={navPending}
                    aria-busy={pendingHref === prevHref}
                    className={`group ${productActionSecondary} !min-h-9 !px-3 !text-[12.5px] disabled:cursor-wait disabled:opacity-90`}
                    onClick={() => go(prevHref)}
                  >
                    {pendingHref === prevHref ? (
                      <Spinner
                        variant="bars"
                        size={14}
                        className="text-ink/55"
                        aria-hidden
                      />
                    ) : (
                      <>
                        <CtaArrowLeft className="!h-3.5 !w-3.5" />
                        Previous: LO{prevObjective}
                      </>
                    )}
                  </button>
                ) : (
                  <span aria-hidden className="min-h-9" />
                )}
                <button
                  type="button"
                  disabled={navPending}
                  aria-disabled={
                    navPending || (sealed ? false : !checkpointReady)
                  }
                  aria-busy={pendingHref === nextHref}
                  aria-label={
                    !sealed && !checkpointReady
                      ? CHECKPOINT_GATE_COPY
                      : nextObjective
                        ? `Next: LO${nextObjective}`
                        : "Back to overview"
                  }
                  className={`group ${productActionSecondary} ml-auto !min-h-9 !px-3 !text-[12.5px] disabled:cursor-wait disabled:opacity-90 ${
                    !sealed && !checkpointReady
                      ? "!cursor-not-allowed !border-ink/10 !bg-transparent !text-ink/30 hover:!bg-transparent hover:!text-ink/30 hover:!opacity-100 active:!bg-transparent active:!opacity-100"
                      : ""
                  }`}
                  onClick={() => {
                    if (!sealed && !checkpointReady) {
                      showCheckpointGateHint("bottom-center");
                      return;
                    }
                    go(nextHref);
                  }}
                >
                  {pendingHref === nextHref ? (
                    <Spinner
                      variant="bars"
                      size={14}
                      className="text-ink/55"
                      aria-hidden
                    />
                  ) : (
                    <>
                      {nextObjective
                        ? `Next: LO${nextObjective}`
                        : "Back to overview"}
                      <CtaArrow className="!h-3.5 !w-3.5" />
                    </>
                  )}
                </button>
              </nav>
            </div>
          );
        }

        return null;
      }}
    />
  );
}
