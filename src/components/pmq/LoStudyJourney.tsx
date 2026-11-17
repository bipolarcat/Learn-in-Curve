"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LessonBody, PmqQuestion, PmqSection } from "@/types/pmq";
import { LoPageHeader } from "@/components/pmq/LoPageHeader";
import { LoOrientStage } from "@/components/pmq/LoOrientStage";
import { LoLearnStage } from "@/components/pmq/LoLearnStage";
import { LoApplyStage } from "@/components/pmq/LoApplyStage";
import { PracticeQuizSection } from "@/components/pmq/PracticeQuizSection";
import { LoCheckpointStage } from "@/components/pmq/LoCheckpointStage";
import { StudyJourney } from "@/components/course/StudyJourney";
import { LearnBackToTopButton } from "@/components/course/LearnBackToTopButton";
import { PMQ_SLUG, pmqLoHref } from "@/lib/pmq/constants";
import type { PmqTier } from "@/lib/pmq/tiers";
import {
  buildLoStages,
  canSealLo,
  PMQ_PROGRESS_UNIT_PERCENT,
  STAGE_REACHED_COLUMN,
  type LoStageId,
} from "@/lib/pmq/lo-stages";
import { markLoStageReached } from "@/lib/pmq/actions";
import { trackLoStageReached } from "@/lib/analytics/events";

type LoStudyJourneyProps = {
  loNumber: number;
  loTitle: string;
  loCode: string;
  sectionId: string;
  courseId: string;
  dayNumber: number;
  body: LessonBody;
  set1Questions: PmqQuestion[];
  /** Highest practice set number for this LO (DB-derived). */
  totalSets: number;
  priorAttempts?: Record<
    string,
    { submittedAnswer: string | Record<string, string>; isCorrect: boolean | null }
  >;
  initialLoXp?: number;
  /** Starter / Pro / AI Pro — drives Practise Generate gates. */
  userTier: PmqTier;
  priceCents: number;
  completedCheckpoints: number[];
  quizCompleted: boolean;
  isSectionCompleted: boolean;
  allSections: PmqSection[];
  showQaComplete: boolean;
  /** 0–100 overall course completion for LO chrome. */
  completionPercent?: number;
  /**
   * Pre-quiz pathway stages the DB confirms as reached (from
   * `section_progress`'s `*_reached_at` columns). Source of truth for
   * which stages count as done — the LO still opens on Orient.
   */
  dbReachedStageIds?: LoStageId[];
};

/**
 * Within-LO study journey: pathway + one focused stage.
 * Free navigation until seal; sealed LOs are review-only.
 * Composes shared `StudyJourney` — PMQ stage bodies stay here.
 */
export function LoStudyJourney({
  loNumber,
  loTitle,
  loCode,
  sectionId,
  courseId,
  dayNumber,
  body,
  set1Questions,
  totalSets,
  priorAttempts = {},
  userTier,
  priceCents,
  completedCheckpoints,
  quizCompleted,
  isSectionCompleted,
  allSections,
  showQaComplete,
  completionPercent = 0,
  dbReachedStageIds = [],
}: LoStudyJourneyProps) {
  const stages = useMemo(
    () => buildLoStages({ loNumber, body }),
    [loNumber, body],
  );
  const sealed = isSectionCompleted;

  const checkpointTotal = body.progress_checkpoint.length;
  const sealReady = canSealLo({
    checkpointTotal,
    completedCheckpointCount: completedCheckpoints.length,
  });

  const timestampStageIds = useMemo(
    () =>
      (Object.keys(STAGE_REACHED_COLUMN) as LoStageId[]).filter(
        (id) => STAGE_REACHED_COLUMN[id],
      ),
    [],
  );

  const router = useRouter();
  const [, startNextLoTransition] = useTransition();
  const nextLo = allSections.find((s) => s.order_index === loNumber + 1);
  const nextLoHref = nextLo
    ? pmqLoHref(nextLo.order_index)
    : `/courses/${PMQ_SLUG}`;

  const [checkpointReady, setCheckpointReady] = useState(
    () => sealed || sealReady || checkpointTotal <= 0,
  );
  /** Orient badge → Learn: which sub-outcome to open (e.g. "2a"). */
  const [learnFocusCode, setLearnFocusCode] = useState<string | null>(null);

  useEffect(() => {
    if (sealed || sealReady || checkpointTotal <= 0) {
      setCheckpointReady(true);
    }
  }, [sealed, sealReady, checkpointTotal]);

  const onChecklistReadyChange = useCallback((ready: boolean) => {
    setCheckpointReady(ready);
  }, []);

  const goNextLo = useCallback(() => {
    startNextLoTransition(() => {
      router.push(nextLoHref);
    });
  }, [nextLoHref, router, startNextLoTransition]);

  const checkpointContinueLabel = nextLo
    ? `Continue to LO${nextLo.order_index}`
    : "Back to overview";

  const onStagesMarkedDone = useCallback(
    (newlyDone: LoStageId[]) => {
      for (const stageId of newlyDone) {
        if (!STAGE_REACHED_COLUMN[stageId]) continue;
        void markLoStageReached({ sectionId, courseId, loNumber, stageId })
          .then((result) => {
            if (result && "ok" in result && result.ok) {
              trackLoStageReached({ lo_number: loNumber, stage_id: stageId });
            }
          })
          .catch((err) => {
            console.error("[LoStudyJourney] markLoStageReached failed:", err);
          });
      }
    },
    [sectionId, courseId, loNumber],
  );

  return (
    <StudyJourney<LoStageId>
      unitKey={loNumber}
      stages={stages}
      sealed={sealed}
      quizStageId="practice"
      quizCompleted={quizCompleted}
      checkpointStageId="checkpoint"
      dbReachedStageIds={dbReachedStageIds}
      timestampStageIds={timestampStageIds}
      completionPercent={completionPercent}
      progressUnitPercent={PMQ_PROGRESS_UNIT_PERCENT}
      onStagesMarkedDone={onStagesMarkedDone}
      checkpointContinueLabel={checkpointContinueLabel}
      checkpointReady={checkpointReady}
      onCheckpointContinue={goNextLo}
      showCheckpointContinueButton={false}
      srTitle={`LO ${loNumber}: ${loTitle}`}
      continueAsideFor={(currentId) =>
        currentId === "learn" ? <LearnBackToTopButton /> : null
      }
      renderChrome={(ctx) => (
        <LoPageHeader
          loNumber={loNumber}
          loTitle={loTitle}
          stages={ctx.stages}
          currentId={ctx.currentId}
          unlockedIds={ctx.unlockedIds}
          lockedIds={ctx.lockedIds}
          onSelect={(id) => ctx.selectStage(id as LoStageId)}
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
              context={body.where_this_fits}
              outcomes={body.learning_outcomes}
              definitions={body.key_definitions}
              badgeVariant="stamp"
              onJumpToOutcome={(code) => {
                setLearnFocusCode(code);
                jumpToStage("learn");
              }}
            />
          );
        }
        if (currentId === "learn") {
          return (
            <LoLearnStage
              loNumber={loNumber}
              definitions={[]}
              coreContent={body.core_content}
              userTier={userTier}
              focusOutcomeCode={learnFocusCode}
              onFocusOutcomeConsumed={() => setLearnFocusCode(null)}
            />
          );
        }
        if (currentId === "apply") {
          return (
            <LoApplyStage
              misconceptions={body.misconceptions}
              memoryAids={body.memory_aids}
            />
          );
        }
        if (currentId === "practice") {
          return (
            <PracticeQuizSection
              loNumber={loNumber}
              loCode={loCode}
              set1Questions={set1Questions}
              totalSets={totalSets}
              priorAttempts={priorAttempts}
              userTier={userTier}
              priceCents={priceCents}
              checkpointTotal={checkpointTotal}
            />
          );
        }
        if (currentId === "checkpoint") {
          return (
            <LoCheckpointStage
              checklistItems={body.progress_checkpoint}
              sectionId={sectionId}
              courseId={courseId}
              loNumber={loNumber}
              dayNumber={dayNumber}
              completedCheckpoints={completedCheckpoints}
              quizCompleted={quizCompleted}
              sealed={sealed}
              sealReady={sealReady}
              checkpointTotal={checkpointTotal}
              allSections={allSections}
              showQaComplete={showQaComplete}
              onChecklistReadyChange={onChecklistReadyChange}
            />
          );
        }
        return null;
      }}
    />
  );
}
