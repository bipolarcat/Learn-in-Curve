"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import {
  CHECKPOINT_GATE_COPY,
  showCheckpointGateHint,
} from "@/components/pmq/CheckpointGateHint";
import { productActionSecondary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { CtaArrow } from "@/components/stamp-chip";
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

/** Hold ∞ long enough for the bars spinner to read before a sync stage swap. */
const STAGE_CONTINUE_ADVANCE_MS = 420;

function StageContinueButton({
  label,
  onContinue,
  enabled = true,
}: {
  label: string;
  onContinue: () => void;
  enabled?: boolean;
}) {
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-6 flex justify-center sm:mt-8">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        aria-disabled={!enabled}
        aria-label={
          !enabled ? CHECKPOINT_GATE_COPY : pending ? "Advancing" : label
        }
        className={`${productActionSecondary} disabled:cursor-wait disabled:opacity-90 ${
          !enabled
            ? "!cursor-not-allowed !opacity-40 hover:!bg-paper hover:!opacity-40"
            : ""
        }`}
        onClick={(event) => {
          event.preventDefault();
          if (pending) return;
          if (!enabled) {
            showCheckpointGateHint("bottom-center");
            return;
          }
          setPending(true);
          window.setTimeout(() => {
            onContinue();
            setPending(false);
          }, STAGE_CONTINUE_ADVANCE_MS);
        }}
      >
        {pending ? (
          <Spinner
            variant="bars"
            size={14}
            className="text-ink/55"
            aria-hidden
          />
        ) : (
          <>
            {label}
            <CtaArrow className="!h-3.5 !w-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
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
   * `section_progress`'s `*_reached_at` columns). This is the *only*
   * source of truth for "done" stages and which stage to resume on — see
   * the hydration effect below. There is deliberately no client-side
   * cache anymore (OPERATIONS.md: "reset didn't reset the in-LO
   * pathway"); a sessionStorage cache used to fill this role and it's
   * what caused a post-reset LO to keep reopening on a stale stage.
   */
  dbReachedStageIds?: LoStageId[];
};

/**
 * Within-LO study journey: pathway + one focused stage.
 * Free navigation until seal; sealed LOs are review-only.
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
  initialLoXp = 0,
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
  const stageIdsKey = stages.map((s) => s.id).join("|");
  const stageIds = useMemo(
    () => stageIdsKey.split("|") as LoStageId[],
    [stageIdsKey],
  );
  const sealed = isSectionCompleted;

  const checkpointTotal = body.progress_checkpoint.length;
  const sealReady = canSealLo({
    checkpointTotal,
    completedCheckpointCount: completedCheckpoints.length,
  });

  const [currentId, setCurrentId] = useState<LoStageId>(
    () => stages[0]?.id ?? "orient",
  );
  const [doneIds, setDoneIds] = useState<Set<LoStageId>>(() => new Set());
  /** Tracks seal across refreshes so we don't yank the user out of Practise mid-review. */
  const prevSealedRef = useRef<boolean | null>(null);

  useEffect(() => {
    // DB is the *only* source of truth for done stages and where to
    // resume, every mount. There used to also be a sessionStorage cache
    // here for same-session continuity, but it's what caused a reset
    // account to reopen an LO on a stale stage (e.g. Quiz) instead of
    // Orient — the cache had no way to tell a real reset apart from a
    // normal revisit, so it just kept whatever it last saw. Removed
    // rather than patched again: a stage's `*_reached_at` is only set
    // when the learner clicks Continue *off* that stage (see advance()
    // below), so "the stage right after the furthest DB-confirmed stage"
    // is always exactly where they left off — no client cache required.
    // See OPERATIONS.md, "reset didn't reset the in-LO pathway".
    const dbDone = dbReachedStageIds.filter((id) => stageIds.includes(id));
    const furthestDbIdx = dbDone.reduce((max, id) => {
      const idx = stageIds.indexOf(id);
      return idx > max ? idx : max;
    }, -1);

    setDoneIds(new Set(dbDone));
    const nextIdx = Math.min(Math.max(furthestDbIdx + 1, 0), stageIds.length - 1);
    setCurrentId(stageIds[nextIdx] ?? stageIds[0] ?? "orient");
  }, [loNumber, stageIds, dbReachedStageIds]);

  useEffect(() => {
    if (sealed) {
      setDoneIds(new Set(stageIds));
      // Only auto-jump when the LO newly seals (or first paint already sealed).
      // Re-running after quiz answer → router.refresh() must NOT kick you to Checkpoint.
      if (prevSealedRef.current !== true) {
        setCurrentId("checkpoint");
      }
    } else if (quizCompleted) {
      setDoneIds((prev) => {
        const next = new Set(prev);
        next.add("practice");
        return next;
      });
    }
    prevSealedRef.current = sealed;
  }, [sealed, stageIds, quizCompleted]);

  const selectStage = useCallback(
    (id: LoStageId) => {
      // Forward jumps only via Continue; pathway may revisit reached stages.
      if (sealed || id === currentId || doneIds.has(id)) {
        setCurrentId(id);
      }
    },
    [sealed, currentId, doneIds],
  );

  const mediaLocked = !hasEntitlement;

  const advance = useCallback(() => {
    const idx = stageIds.indexOf(currentId);
    if (idx < 0 || idx >= stageIds.length - 1) return;

    // Starter / free: Video + Audio are Pro-gated — don't force the paywall
    // detour between Learn and Apply. Mark them done so tabs stay openable
    // for the locked upsell preview.
    const skipProMedia = mediaLocked && currentId === "learn";
    let nextIdx = idx + 1;
    if (skipProMedia) {
      const applyIdx = stageIds.indexOf("apply");
      if (applyIdx > idx) nextIdx = applyIdx;
    }
    const nextId = stageIds[nextIdx];
    if (!nextId) return;

    setDoneIds((prev) => {
      const next = new Set(prev);
      next.add(currentId);
      if (skipProMedia) {
        next.add("video");
        next.add("audio");
      }
      return next;
    });
    setCurrentId(nextId);

    // Persist to section_progress so per-LO/overall progress, and where to
    // resume this LO on the next visit, are entirely DB-backed — see
    // lo-stages.ts, STAGE_REACHED_COLUMN. Only the 5 pre-quiz stages have
    // a column;
    // "practice"/"checkpoint" are covered by quiz_completed_at/completed_at
    // elsewhere, so markLoStageReached no-ops for those automatically.
    const newlyDone: LoStageId[] = skipProMedia
      ? [currentId, "video", "audio"]
      : [currentId];
    for (const stageId of newlyDone) {
      if (!STAGE_REACHED_COLUMN[stageId]) continue;
      void markLoStageReached({ sectionId, courseId, loNumber, stageId }).catch(
        (err) => {
          console.error("[LoStudyJourney] markLoStageReached failed:", err);
        },
      );
    }

    // Bottom Continue leaves the viewport near the footer — jump back to the pathway.
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [currentId, stageIds, mediaLocked, sectionId, courseId, loNumber]);

  /**
   * Optimistic overall-course percent for the header bar.
   *
   * `completionPercent` is server-rendered. `advance()` writes the stage via
   * `markLoStageReached` (which does `revalidatePmqPaths`), but revalidation
   * only invalidates the *server* cache — it doesn't push a fresh RSC payload
   * to an already-mounted client. So the header used to hold its mount-time
   * value until something else triggered a refresh, at which point every stage
   * advanced since then landed in one jump (the 7 → 10 after five tabs).
   *
   * Rather than call `router.refresh()` on advance — which would race the
   * un-awaited DB write and could reset `doneIds`/`currentId` backwards via the
   * resume effect above — we add the pending stages client-side.
   *
   * Derived from set difference, not an incrementing counter, so it's
   * idempotent: when a real refresh does land, each stage moves from "pending"
   * into `dbReachedStageIds` and the base rises by exactly the amount the
   * delta drops. No double-count, no flicker.
   */
  const optimisticCompletionPercent = useMemo(() => {
    const dbReached = new Set(dbReachedStageIds);
    let pendingUnits = 0;
    for (const id of doneIds) {
      // Only the 5 timestamp-backed stages; Quiz/Checkpoint are already
      // server-derived via quiz_completed_at / completed_at.
      if (STAGE_REACHED_COLUMN[id] && !dbReached.has(id)) pendingUnits += 1;
    }
    return Math.min(
      100,
      completionPercent + pendingUnits * PMQ_PROGRESS_UNIT_PERCENT,
    );
  }, [completionPercent, doneIds, dbReachedStageIds]);

  const currentStage = stages.find((s) => s.id === currentId) ?? stages[0];
  const isLast = currentId === "checkpoint";
  /** Keep Next/Continue available after a stage (or whole LO) is already done. */
  const showAdvance = !isLast && !!currentStage;
  const video = explainerVideo ?? PMQ_LO_EXPLAINER_VIDEOS[loNumber];
  const audio = audioOverview ?? PMQ_LO_AUDIO_OVERVIEWS[loNumber];
  const lockedStageIds = useMemo(() => {
    if (!mediaLocked) return new Set<LoStageId>();
    return new Set<LoStageId>(["video", "audio"]);
  }, [mediaLocked]);

  const continueLabel = !showAdvance
    ? null
    : mediaLocked && currentId === "learn"
      ? "Continue to Apply"
      : (currentStage.continueLabel ?? null);

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

  const headerContinueLabel = isLast ? "Next LO" : continueLabel;
  const headerOnContinue = isLast ? goNextLo : advance;
  const continueEnabled = !isLast || checkpointReady;

  return (
    <>
      <LoPageHeader
        loNumber={loNumber}
        loTitle={loTitle}
        stages={stages}
        currentId={currentId}
        doneIds={doneIds}
        lockedIds={lockedStageIds}
        sealed={sealed}
        onSelect={selectStage}
        continueLabel={headerContinueLabel}
        onContinue={headerOnContinue}
        continueEnabled={continueEnabled}
        completionPercent={optimisticCompletionPercent}
      />

      <main className="w-full px-3 pb-28 pt-4 sm:px-5 sm:pb-24 sm:pt-6">
        <h1 className="sr-only">
          LO {loNumber}: {loTitle}
        </h1>
        <div className="mx-auto w-full min-w-0 max-w-wrap">
          {currentId === "orient" ? (
            <LoOrientStage
              context={body.where_this_fits}
              outcomes={body.learning_outcomes}
            />
          ) : currentId === "learn" ? (
            <LoLearnStage
              definitions={body.key_definitions}
              coreContent={body.core_content}
            />
          ) : currentId === "video" && video ? (
            <LoVideoStage
              video={video}
              loNumber={loNumber}
              loTitle={loTitle}
              mediaLocked={mediaLocked}
              priceCents={priceCents}
              onJumpToLearn={() => selectStage("learn")}
            />
          ) : currentId === "audio" && audio ? (
            <LoAudioStage
              audio={audio}
              loNumber={loNumber}
              loTitle={loTitle}
              mediaLocked={mediaLocked}
              priceCents={priceCents}
            />
          ) : currentId === "apply" ? (
            <LoApplyStage
              misconceptions={body.misconceptions}
              memoryAids={body.memory_aids}
            />
          ) : currentId === "practice" ? (
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
          ) : currentId === "checkpoint" ? (
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
          ) : null}

          {isLast ? (
            <StageContinueButton
              key="checkpoint-continue"
              label={checkpointContinueLabel}
              onContinue={goNextLo}
              enabled={continueEnabled}
            />
          ) : showAdvance && continueLabel ? (
            <StageContinueButton
              key={currentId}
              label={continueLabel}
              onContinue={advance}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}
