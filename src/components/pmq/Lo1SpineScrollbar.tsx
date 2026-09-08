"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { formatOutcomeBadge } from "@/components/pmq/OutcomeCodeBadge";
import { cn } from "@/lib/utils";

type SpineOutcome = {
  code: string;
  title: string;
};

type Lo1SpineScrollbarProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  outcomes: SpineOutcome[];
  activeIndex: number;
  onSelectOutcome: (index: number) => void;
};

/**
 * Notebook zipper spine: perforated stitch, ticket-punch outcome notches,
 * and an orange zip pull that scrubs the reader. Mobile keeps a thin bar.
 */
export function Lo1SpineScrollbar({
  scrollRef,
  outcomes,
  activeIndex,
  onSelectOutcome,
}: Lo1SpineScrollbarProps) {
  const labelId = useId();
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? el.scrollTop / max : 0);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [scrollRef, sync]);

  const seekFromClientY = (clientY: number, track: HTMLElement) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = track.getBoundingClientRect();
    const pad = 18;
    const usable = Math.max(1, rect.height - pad * 2);
    const p = Math.min(1, Math.max(0, (clientY - rect.top - pad) / usable));
    el.scrollTop = p * (el.scrollHeight - el.clientHeight);
  };

  const onTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-spine-notch]")) return;
    event.preventDefault();
    const track = event.currentTarget;
    track.setPointerCapture(event.pointerId);
    setDragging(true);
    seekFromClientY(event.clientY, track);
  };

  const onTrackPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    seekFromClientY(event.clientY, event.currentTarget);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(48, el.clientHeight * 0.12);
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      el.scrollTop = Math.min(
        el.scrollHeight - el.clientHeight,
        el.scrollTop + (event.key === "PageDown" ? step * 2 : step),
      );
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      el.scrollTop = Math.max(
        0,
        el.scrollTop - (event.key === "PageUp" ? step * 2 : step),
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      el.scrollTop = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
  };

  const count = Math.max(outcomes.length, 1);
  const zipTop = `calc(18px + (100% - 36px - 28px) * ${progress})`;

  return (
    <div className="relative my-5 h-px bg-black/[0.08] dark:bg-white/[0.12] lg:my-0 lg:h-auto lg:bg-transparent">
      {/* Mobile: quiet progress bar */}
      <div
        className="absolute inset-0 rounded-full bg-teal/70 lg:hidden"
        style={{ width: `${Math.round(progress * 100)}%` }}
        aria-hidden
      />

      {/* Desktop: zipper / stitch spine */}
      <div
        role="scrollbar"
        aria-orientation="vertical"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={labelId}
        tabIndex={0}
        className="absolute inset-y-0 left-1/2 hidden w-16 -translate-x-1/2 cursor-ns-resize touch-none select-none rounded-md lg:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <span id={labelId} className="sr-only">
          Notebook spine — drag the zip to scroll, or jump by outcome punch
        </span>

        {/* Binding gutter */}
        <span
          className="pointer-events-none absolute inset-y-0 left-[58%] w-7 -translate-x-1/2 rounded-full bg-ink/[0.035] dark:bg-white/[0.05]"
          aria-hidden
        />

        {/* Perforated stitch */}
        <span
          className="pointer-events-none absolute inset-y-3 left-[58%] w-0 -translate-x-1/2 border-l-[1.5px] border-dashed border-ink/30 dark:border-white/30"
          aria-hidden
        />

        {/* Progress fill along the stitch */}
        <span
          className="pointer-events-none absolute left-[58%] top-3 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-teal to-orange shadow-[0_0_0_1px_rgb(var(--ink-rgb)_/_0.06)]"
          style={{ height: `calc((100% - 24px) * ${progress})` }}
          aria-hidden
        />

        {/* Ticket-punch notches (left of stitch) */}
        {outcomes.map((outcome, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          const topPct = ((index + 0.5) / count) * 100;
          return (
            <button
              key={outcome.code}
              type="button"
              data-spine-notch
              title={`${formatOutcomeBadge(outcome.code)} — ${outcome.title}`}
              aria-label={`Jump to ${formatOutcomeBadge(outcome.code)}: ${outcome.title}`}
              aria-current={isActive ? "true" : undefined}
              onClick={(event) => {
                event.stopPropagation();
                onSelectOutcome(index);
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className={cn(
                "absolute left-[6%] z-[1] flex h-7 min-w-7 -translate-y-1/2 items-center justify-center rounded-[0.35rem] border-2 bg-paper px-1 font-body text-[10px] font-bold uppercase tabular-nums leading-none tracking-tight transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-out-quint)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-1 focus-visible:ring-offset-paper",
                isActive
                  ? "border-orange bg-orange/15 text-ink shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.12)] scale-110"
                  : isPast
                    ? "border-teal bg-teal text-paper"
                    : "border-teal/50 text-teal hover:border-teal hover:bg-teal/10",
              )}
              style={{ top: `${topPct}%` }}
            >
              {formatOutcomeBadge(outcome.code)}
            </button>
          );
        })}

        {/* Zip pull on the stitch */}
        <span
          className={cn(
            "pointer-events-none absolute left-[58%] z-[2] flex -translate-x-1/2 flex-col items-center",
            dragging && "scale-105",
            "transition-transform duration-150 ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          )}
          style={{ top: zipTop }}
          aria-hidden
        >
          <span className="flex size-7 items-center justify-center rounded-full border-2 border-orange bg-orange text-paper shadow-[0_2px_0_rgb(var(--ink-rgb)_/_0.18),0_6px_14px_rgb(var(--orange-rgb)_/_0.28)]">
            <svg
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M6 1.5v7.5M3.5 6.5 6 9l2.5-2.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="12" r="1.2" fill="currentColor" />
            </svg>
          </span>
          <span className="mt-0.5 h-2.5 w-[2px] rounded-full bg-orange/80" />
        </span>
      </div>
    </div>
  );
}
