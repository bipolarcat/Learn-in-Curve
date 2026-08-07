"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Flag } from "lucide-react";
import { ProgressCheckpointList } from "@/components/pmq/ProgressCheckpointList";
import { LoCheckpointCelebration } from "@/components/pmq/LoCheckpointCelebration";
import { QaCompleteButton } from "@/components/pmq/QaCompleteButton";
import {
  productActionPrimary,
  productActionSecondary,
  productSurfaceOpaque,
} from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { CtaArrow, CtaArrowLeft } from "@/components/stamp-chip";
import { markSectionComplete } from "@/lib/pmq/actions";
import { trackSectionCompleted } from "@/lib/analytics/events";
import { pmqLoHref, PMQ_SLUG } from "@/lib/pmq/constants";
import motion from "@/components/pmq/PmqMotion.module.css";
import type { PmqSection } from "@/types/pmq";

type LoCheckpointStageProps = {
  checklistItems: string[];
  sectionId: string;
  courseId: string;
  loNumber: number;
  dayNumber: number;
  completedCheckpoints: number[];
  quizCompleted: boolean;
  sealed: boolean;
  sealReady: boolean;
  checkpointTotal: number;
  allSections: PmqSection[];
  showQaComplete: boolean;
  onChecklistReadyChange?: (ready: boolean) => void;
};

const NAV_ADVANCE_MS = 420;

function LoAdjacentNav({
  sections,
  currentLo,
  nextEnabled = true,
  onNextBlocked,
  showNext = true,
}: {
  sections: PmqSection[];
  currentLo: number;
  nextEnabled?: boolean;
  onNextBlocked?: () => void;
  /** When false, only Previous is shown (Continue lives in StageContinueButton). */
  showNext?: boolean;
}) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const prev = sections.find((s) => s.order_index === currentLo - 1);
  const next = sections.find((s) => s.order_index === currentLo + 1);
  const nextHref = next ? pmqLoHref(next.order_index) : `/courses/${PMQ_SLUG}`;
  const nextLabel = next ? `Next: LO${next.order_index}` : "Back to overview";
  const prevHref = prev ? pmqLoHref(prev.order_index) : null;
  const prevLabel = prev ? `Previous: LO${prev.order_index}` : null;

  const go = (href: string) => {
    if (pendingHref) return;
    setPendingHref(href);
    window.setTimeout(() => {
      startTransition(() => {
        router.push(href);
      });
    }, NAV_ADVANCE_MS);
  };

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3 sm:mt-8"
      aria-label="Learning objective navigation"
    >
      {prevHref && prev && prevLabel ? (
        <button
          type="button"
          disabled={pendingHref != null}
          aria-busy={pendingHref === prevHref}
          aria-label={
            pendingHref === prevHref
              ? "Opening previous learning objective"
              : `Previous: LO${prev.order_index} ${prev.title}`
          }
          title={`LO${prev.order_index}: ${prev.title}`}
          onClick={() => go(prevHref)}
          className={`group ${productActionSecondary} !min-h-9 !px-3 !text-[12.5px] disabled:cursor-wait disabled:opacity-90`}
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
              {prevLabel}
            </>
          )}
        </button>
      ) : (
        <span aria-hidden className="min-h-9" />
      )}

      {showNext ? (
        <button
          type="button"
          disabled={pendingHref != null}
          aria-busy={pendingHref === nextHref}
          aria-disabled={!nextEnabled}
          aria-label={
            !nextEnabled
              ? "Tick off all the checkpoints to complete this learning objective"
              : pendingHref === nextHref
                ? next
                  ? "Opening next learning objective"
                  : "Opening course overview"
                : next
                  ? `Next: LO${next.order_index} ${next.title}`
                  : "Back to course overview"
          }
          title={
            !nextEnabled
              ? "Tick off all the checkpoints to complete this learning objective"
              : next
                ? `LO${next.order_index}: ${next.title}`
                : "Course overview"
          }
          onClick={() => {
            if (!nextEnabled) {
              onNextBlocked?.();
              return;
            }
            go(nextHref);
          }}
          className={`group ${productActionPrimary} ml-auto !min-h-9 !px-3 !text-[12.5px] disabled:cursor-wait disabled:opacity-90 ${
            !nextEnabled
              ? "!cursor-not-allowed !opacity-40 hover:!bg-action hover:!opacity-40"
              : ""
          }`}
        >
          {pendingHref === nextHref ? (
            <Spinner
              variant="bars"
              size={14}
              className="text-paper"
              aria-hidden
            />
          ) : (
            <>
              {nextLabel}
              <CtaArrow className="!h-3.5 !w-3.5" />
            </>
          )}
        </button>
      ) : (
        <span aria-hidden className="min-h-9" />
      )}
    </nav>
  );
}

/**
 * Checkpoint — checklist seals the LO; celebration fires on last tick.
 */
export function LoCheckpointStage({
  checklistItems,
  sectionId,
  courseId,
  loNumber,
  completedCheckpoints,
  quizCompleted,
  sealed,
  checkpointTotal,
  allSections,
  showQaComplete,
  onChecklistReadyChange,
}: LoCheckpointStageProps) {
  const router = useRouter();
  const [celebrating, setCelebrating] = useState(false);
  const celebratedRef = useRef(sealed);
  const emptySealTried = useRef(false);

  const handleReadyChange = useCallback(
    (ready: boolean) => {
      onChecklistReadyChange?.(sealed || ready);
    },
    [onChecklistReadyChange, sealed],
  );

  const endCelebration = useCallback(() => {
    setCelebrating(false);
    router.refresh();
  }, [router]);

  const startCelebration = useCallback(() => {
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    setCelebrating(true);
  }, []);

  // Empty checklist LOs still need a seal path (no ticks to complete).
  // Also heal “all ticked but not sealed” (e.g. pre–checklist-only gate).
  useEffect(() => {
    if (sealed) return;

    if (checklistItems.length === 0) {
      if (emptySealTried.current) return;
      emptySealTried.current = true;
      void (async () => {
        const result = await markSectionComplete({
          sectionId,
          courseId,
          loNumber,
          checkpointTotal: 0,
        });
        if (result && "ok" in result && result.ok) {
          trackSectionCompleted({
            lo_number: loNumber,
            section_id: sectionId,
          });
        }
        startCelebration();
        router.refresh();
      })();
      return;
    }

    if (
      completedCheckpoints.length >= checklistItems.length &&
      !emptySealTried.current
    ) {
      emptySealTried.current = true;
      void (async () => {
        const result = await markSectionComplete({
          sectionId,
          courseId,
          loNumber,
          checkpointTotal: checklistItems.length,
        });
        if (result && "ok" in result && result.ok) {
          trackSectionCompleted({
            lo_number: loNumber,
            section_id: sectionId,
          });
        }
        router.refresh();
      })();
    }
  }, [
    sealed,
    checklistItems.length,
    completedCheckpoints.length,
    sectionId,
    courseId,
    loNumber,
    startCelebration,
    router,
  ]);

  useEffect(() => {
    if (sealed || checklistItems.length === 0) {
      onChecklistReadyChange?.(true);
    }
  }, [sealed, checklistItems.length, onChecklistReadyChange]);

  useEffect(() => {
    if (sealed) celebratedRef.current = true;
  }, [sealed]);

  const showDone =
    sealed ||
    celebrating ||
    (checkpointTotal > 0 &&
      completedCheckpoints.length >= checkpointTotal);

  return (
    <div className="lo-checkpoint-stage w-full min-w-0">
      <section
        className={`${productSurfaceOpaque} ${motion.panel} w-full p-4 sm:p-5`}
        aria-labelledby="lo-checkpoint-title"
      >
        <div className="flex w-full min-w-0 items-center gap-2 sm:gap-2.5">
          <Flag
            className="size-7 shrink-0 text-orange sm:size-8"
            strokeWidth={1.75}
            aria-hidden
          />
          <h2
            id="lo-checkpoint-title"
            className="min-w-0 flex-1 font-body text-lg font-semibold leading-snug tracking-tight text-ink"
          >
            Checkpoint
          </h2>
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

        {checklistItems.length > 0 ? (
          <div className="mt-3 w-full min-w-0 sm:mt-3.5">
            <ProgressCheckpointList
              items={checklistItems}
              sectionId={sectionId}
              courseId={courseId}
              loNumber={loNumber}
              initialCompleted={completedCheckpoints}
              quizCompleted={quizCompleted}
              readOnly={sealed}
              onJustCompleted={startCelebration}
              onReadyChange={handleReadyChange}
            />
          </div>
        ) : (
          <p className="mt-3 w-full font-body text-[14px] leading-relaxed text-ink/55 sm:mt-3.5">
            No checklist items for this LO.
          </p>
        )}

        {showQaComplete ? (
          <div className="mt-4">
            <QaCompleteButton
              sectionId={sectionId}
              courseId={courseId}
              loNumber={loNumber}
            />
          </div>
        ) : null}
      </section>

      <LoAdjacentNav
        sections={allSections}
        currentLo={loNumber}
        showNext={false}
      />

      <LoCheckpointCelebration open={celebrating} onDone={endCelebration} />
    </div>
  );
}
