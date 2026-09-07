"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LessonBody, PmqQuestion, PmqSection } from "@/types/pmq";
import { LoPageHeader } from "@/components/pmq/LoPageHeader";
import { LoOrientStage } from "@/components/pmq/LoOrientStage";
import { LoLearnStage } from "@/components/pmq/LoLearnStage";
import { LoVideoStage } from "@/components/pmq/LoVideoStage";
import { LoAudioStage } from "@/components/pmq/LoAudioStage";
import { LoApplyStage } from "@/components/pmq/LoApplyStage";
import { PracticeQuizSection } from "@/components/pmq/PracticeQuizSection";
import { LoCheckpointStage } from "@/components/pmq/LoCheckpointStage";
import { StudyJourney } from "@/components/course/StudyJourney";
import {
  PMQ_LO_AUDIO_OVERVIEWS,
  PMQ_LO_EXPLAINER_VIDEOS,
  PMQ_SLUG,
  pmqLoHref,
  type LoMediaAsset,
} from "@/lib/pmq/constants";
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
  hasEntitlement: boolean;
  /** Starter / Pro / AI Pro — drives Practise Generate gates. */
  userTier: PmqTier;
  priceCents: number;
  completedCheckpoints: number[];
  quizCompleted: boolean;
  isSectionCompleted: boolean;
  explainerVideo?: LoMediaAsset | null;
  audioOverview?: LoMediaAsset | null;
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
  hasEntitlement,
  userTier,
  priceCents,
  completedCheckpoints,
  quizCompleted,
  isSectionCompleted,
  explainerVideo,
  audioOverview,
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

  const mediaLocked = !hasEntitlement;
  const lockedStageIds = useMemo(() => {
    if (!mediaLocked) return new Set<LoStageId>();
    return new Set<LoStageId>(["video", "audio"]);
  }, [mediaLocked]);

  const timestampStageIds = useMemo(
    () =>
      (Object.keys(STAGE_REACHED_COLUMN) as LoStageId[]).filter(
        (id) => STAGE_REACHED_COLUMN[id],
      ),
    [],
  );

  const video = explainerVideo ?? PMQ_LO_EXPLAINER_VIDEOS[loNumber];
  const audio = audioOverview ?? PMQ_LO_AUDIO_OVERVIEWS[loNumber];

  const router = useRouter();
  const [, startNextLoTransition] = useTransition();
  const nextLo = allSections.find((s) => s.order_index === loNumber + 1);
  const nextLoHref = nextLo
    ? pmqLoHref(nextLo.order_index)
    : `/courses/${PMQ_SLUG}`;

  const [checkpointReady, setCheckpointReady] = useState(
    () => sealed || sealReady || checkpointTotal <= 0,
  );

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
      lockedIds={lockedStageIds}
      stagesCompletedOnAdvance={(fromId) => {
        if (mediaLocked && fromId === "learn") {
          return ["learn", "video", "audio"];
        }
        return [fromId];
      }}
      resolveNextIndex={(fromId, fromIndex, stageIds) => {
        if (mediaLocked && fromId === "learn") {
          const applyIdx = stageIds.indexOf("apply");
          if (applyIdx > fromIndex) return applyIdx;
        }
        return fromIndex + 1;
      }}
      continueLabelFor={(currentId, defaultLabel) =>
        mediaLocked && currentId === "learn" ? "Continue to Apply" : defaultLabel
      }
      onStagesMarkedDone={onStagesMarkedDone}
      checkpointContinueLabel={checkpointContinueLabel}
      checkpointReady={checkpointReady}
      onCheckpointContinue={goNextLo}
      srTitle={`LO ${loNumber}: ${loTitle}`}
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
      renderStage={(currentId, { selectStage }) => {
        if (currentId === "orient") {
          return (
            <LoOrientStage
              context={body.where_this_fits}
              outcomes={body.learning_outcomes}
              definitions={loNumber === 1 ? body.key_definitions : undefined}
            />
          );
        }
        if (currentId === "learn") {
          return (
            <LoLearnStage
              loNumber={loNumber}
              definitions={loNumber === 1 ? [] : body.key_definitions}
              coreContent={body.core_content}
            />
          );
        }
        if (currentId === "video" && video) {
          return (
            <LoVideoStage
              video={video}
              loNumber={loNumber}
              loTitle={loTitle}
              mediaLocked={mediaLocked}
              priceCents={priceCents}
              onJumpToLearn={() => selectStage("learn")}
            />
          );
        }
        if (currentId === "audio" && audio) {
          return (
            <LoAudioStage
              audio={audio}
              loNumber={loNumber}
              loTitle={loTitle}
              mediaLocked={mediaLocked}
              priceCents={priceCents}
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
