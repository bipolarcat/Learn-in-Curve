"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AudioLines,
  BookOpen,
  CheckSquare,
  ClipboardList,
  Compass,
  Flag,
  Lock,
  Video,
  type LucideIcon,
} from "lucide-react";
import { CourseChromeProgress } from "@/components/pmq/CourseChromeProgress";
import {
  CHECKPOINT_GATE_COPY,
  showCheckpointGateHint,
} from "@/components/pmq/CheckpointGateHint";
import { PATHWAY_STAGE_HINT_COPY } from "@/components/pmq/PathwayStageHint";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Progress } from "@/components/ui/interfaces-progress";
import { Spinner } from "@/components/ui/spinner";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import type { LoStageDef, LoStageId } from "@/lib/pmq/lo-stages";

type LoPageHeaderProps = {
  loNumber: number;
  loTitle: string;
  stages: LoStageDef[];
  currentId: LoStageId;
  doneIds: Set<LoStageId>;
  lockedIds?: Set<LoStageId>;
  sealed: boolean;
  onSelect: (id: LoStageId) => void;
  /** Compact continue CTA label; omit when not advancing. */
  continueLabel?: string | null;
  onContinue?: () => void;
  /** When false, Next stays visible but de-emphasised; click shows local hint. */
  continueEnabled?: boolean;
  /** 0–100 overall course completion. */
  completionPercent?: number;
};

/** Hold ∞ long enough to read before a sync stage swap. */
const MOBILE_NEXT_ADVANCE_MS = 420;

const chromeShell =
  "w-full max-w-wrap overflow-visible rounded-xl border border-black/[0.08] bg-paper/90 px-2 py-1.5 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-paper/75 sm:px-3 sm:py-1.5 dark:border-white/[0.12]";

/** Flat “Next ▶▶” — same control on mobile and desktop. */
const continueNextClass =
  "relative inline-flex shrink-0 items-center gap-1 bg-transparent px-0.5 py-1 font-body text-[12px] font-bold leading-none tracking-tight text-orange transition-opacity duration-150 ease-[var(--ease-out-quint)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-1 focus-visible:ring-offset-paper active:opacity-75 before:absolute before:-inset-y-2 before:-inset-x-1.5 before:content-['']";

/** Double filled right triangles — matches attached Next mark. */
function NextFfGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 12"
      fill="currentColor"
      aria-hidden
      className={`h-2.5 w-[0.9rem] shrink-0 ${className}`}
    >
      <path d="M0.5 1.2c0-.7.8-1.1 1.4-.7l6.2 4.3c.5.35.5 1.05 0 1.4L1.9 10.5c-.6.4-1.4 0-1.4-.7V1.2Z" />
      <path d="M9.2 1.2c0-.7.8-1.1 1.4-.7l6.2 4.3c.5.35.5 1.05 0 1.4l-6.2 4.3c-.6.4-1.4 0-1.4-.7V1.2Z" />
    </svg>
  );
}

function PathwayNextButton({
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
    <div className="relative inline-flex shrink-0">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        aria-disabled={!enabled}
        aria-label={
          !enabled
            ? CHECKPOINT_GATE_COPY
            : pending
              ? "Advancing"
              : label
        }
        className={`${continueNextClass} disabled:cursor-wait disabled:opacity-100 ${
          !enabled
            ? "!cursor-not-allowed !text-ink/30 hover:!opacity-100 hover:!text-ink/30 active:!opacity-100 active:!text-ink/30"
            : ""
        }`}
        onClick={(event) => {
          event.preventDefault();
          if (pending) return;
          if (!enabled) {
            showCheckpointGateHint("top-right");
            return;
          }
          setPending(true);
          window.setTimeout(() => {
            onContinue();
            setPending(false);
          }, MOBILE_NEXT_ADVANCE_MS);
        }}
      >
        {pending ? (
          <Spinner
            variant="ring"
            size={14}
            className={enabled ? "text-orange" : "text-ink/30"}
            aria-hidden
          />
        ) : (
          <>
            {label === "Next LO" ? "Next LO" : "Next"}
            <NextFfGlyph />
          </>
        )}
      </button>
    </div>
  );
}

const STAGE_ICONS: Record<LoStageId, LucideIcon> = {
  orient: Compass,
  learn: BookOpen,
  video: Video,
  audio: AudioLines,
  apply: CheckSquare,
  practice: ClipboardList,
  checkpoint: Flag,
};

function OverviewBackButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening course overview" : "Back to course overview"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-0.5 font-semibold text-ink transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-wait disabled:opacity-80 ${
        compact
          ? "h-6 text-[11px]"
          : "h-7 text-[12px] sm:text-[13px]"
      }`}
      onClick={() => {
        startTransition(() => {
          router.push(`/courses/${PMQ_SLUG}`);
        });
      }}
    >
      {pending ? (
        <Spinner variant="ring" size={compact ? 12 : 14} className="text-orange" aria-hidden />
      ) : (
        <>
          <span className="text-[0.95em]" aria-hidden>
            ←
          </span>
          Overview
        </>
      )}
    </button>
  );
}

/**
 * LO sub-header — desktop row unchanged; mobile is a tight two-line stack.
 */
export function LoPageHeader({
  loNumber,
  loTitle,
  stages,
  currentId,
  doneIds,
  lockedIds,
  sealed,
  onSelect,
  continueLabel,
  onContinue,
  continueEnabled = true,
  completionPercent = 0,
}: LoPageHeaderProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentId);
  const showContinue = Boolean(continueLabel && onContinue);
  const currentStageLabel =
    stages.find((s) => s.id === currentId)?.label ?? "Study";
  // Keep the fraction: a stage is ~0.595%, so rounding here is exactly what
  // made the bar sit still for four tabs and then jump 3 points on the fifth.
  // `pctExact` drives anything that moves; `pct` is only for labels/thresholds.
  const pctExact = Math.max(
    0,
    Math.min(100, Number.isFinite(completionPercent) ? completionPercent : 0),
  );
  const pct = Math.round(pctExact);
  const courseDone = pct >= 100;

  const tabs = useMemo(
    () =>
      stages.map((stage) => {
        const isCurrent = stage.id === currentId;
        const isReached = sealed || isCurrent || doneIds.has(stage.id);
        const isProLocked = lockedIds?.has(stage.id) ?? false;
        return {
          title: stage.label,
          icon: STAGE_ICONS[stage.id],
          disabled: !isReached,
          trailing: isProLocked ? (
            <Lock
              className="size-2.5 text-ink/45"
              fill="currentColor"
              strokeWidth={2}
              aria-hidden
            />
          ) : undefined,
        };
      }),
    [stages, currentId, doneIds, lockedIds, sealed],
  );

  const onTabChange = (index: number | null) => {
    if (index == null) return;
    const stage = stages[index];
    if (!stage) return;
    onSelect(stage.id);
  };

  return (
    <div className="pmq-course-chrome relative z-10 scroll-mt-2">
      <div className="flex justify-center px-3 pb-2 pt-2 sm:px-5 sm:pb-2.5 sm:pt-2">
        <section className={chromeShell} aria-label="Learning objective">
          {/* Mobile — title + transport Continue; expanding stage labels */}
          <div className="flex flex-col gap-1 sm:hidden">
            <div className="flex min-w-0 items-center gap-1.5">
              <nav
                className="flex min-w-0 flex-1 items-center gap-1 text-[11px] leading-none"
                aria-label="Location"
              >
                <OverviewBackButton compact />
                <span className="select-none text-ink/25" aria-hidden>
                  |
                </span>
                <span className="min-w-0 truncate font-semibold tracking-tight">
                  <span className="text-orange">LO {loNumber}</span>
                  <span className="mx-1 font-medium text-ink/35" aria-hidden>
                    ·
                  </span>
                  <span className="text-ink">{loTitle}</span>
                </span>
                <span className="sr-only"> — {currentStageLabel}</span>
              </nav>
              {showContinue && onContinue ? (
                <PathwayNextButton
                  label={continueLabel ?? "Next"}
                  onContinue={onContinue}
                  enabled={continueEnabled}
                />
              ) : null}
            </div>
            <Progress
              value={pctExact}
              className="h-[2px] w-full rounded-none bg-black/[0.08] dark:bg-white/[0.12]"
              indicatorClassName={
                courseDone
                  ? "rounded-none bg-olive"
                  : "rounded-none bg-orange"
              }
              aria-label={`${pct}% of course complete`}
            />
            <ExpandableTabs
              tabs={tabs}
              value={currentIndex >= 0 ? currentIndex : null}
              clearOnOutsideClick={false}
              expandSelectedLabel
              size="compact"
              activeColor="text-orange"
              className="w-full overflow-visible border-0 bg-transparent p-0 shadow-none"
              onChange={onTabChange}
              disabledHint={PATHWAY_STAGE_HINT_COPY}
            />
          </div>

          {/* Desktop */}
          <div className="hidden min-h-8 items-center gap-3 overflow-visible sm:flex">
            <nav
              className="flex min-w-0 max-w-[15rem] shrink-0 items-center gap-1.5 text-[13px] leading-none lg:max-w-[17rem]"
              aria-label="Location"
            >
              <OverviewBackButton />
              <span className="select-none text-ink/25" aria-hidden>
                |
              </span>
              <span className="min-w-0 truncate font-semibold tracking-tight">
                <span className="text-orange">LO {loNumber}</span>
                <span className="mx-1 font-medium text-ink/35" aria-hidden>
                  ·
                </span>
                <span className="text-ink">{loTitle}</span>
              </span>
            </nav>

            <div className="flex min-w-0 flex-1 items-center justify-center overflow-visible">
              <ExpandableTabs
                tabs={tabs}
                value={currentIndex >= 0 ? currentIndex : null}
                clearOnOutsideClick={false}
                activeColor="text-orange"
                className="justify-center gap-0.5 border-0 bg-transparent p-0 shadow-none overflow-visible"
                onChange={onTabChange}
                disabledHint={PATHWAY_STAGE_HINT_COPY}
              />
            </div>

            <CourseChromeProgress percent={pctExact} className="shrink-0" />

            {showContinue && onContinue ? (
              <div className="flex shrink-0 items-center">
                <PathwayNextButton
                  label={continueLabel ?? "Next"}
                  onContinue={onContinue}
                  enabled={continueEnabled}
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
