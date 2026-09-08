"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

type Lo1SpineScrollbarProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
};

/**
 * Custom scrollbar in the notebook spine. Thumb size = visible / total;
 * drag or click the track to scroll the reader.
 */
export function Lo1SpineScrollbar({ scrollRef }: Lo1SpineScrollbarProps) {
  const [ratio, setRatio] = useState(1);
  const [progress, setProgress] = useState(0);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setRatio(el.scrollHeight > 0 ? el.clientHeight / el.scrollHeight : 1);
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

  const thumbPct = Math.min(100, Math.max(ratio * 100, 14));
  const topPct = progress * (100 - thumbPct);
  const needed = ratio < 0.995;

  const seek = (clientY: number, track: HTMLElement) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = track.getBoundingClientRect();
    const thumbPx = (thumbPct / 100) * rect.height;
    const maxPx = rect.height - thumbPx;
    const p =
      maxPx <= 0
        ? 0
        : Math.min(1, Math.max(0, (clientY - rect.top - thumbPx / 2) / maxPx));
    el.scrollTop = p * (el.scrollHeight - el.clientHeight);
  };

  return (
    <div className="relative my-5 h-px bg-black/[0.08] dark:bg-white/[0.12] lg:my-0 lg:h-auto lg:bg-transparent">
      <div
        className="absolute inset-0 rounded-full bg-teal/70 lg:hidden"
        style={{ width: `${Math.round(progress * 100)}%` }}
        aria-hidden
      />

      {needed ? (
        <div
          role="scrollbar"
          aria-orientation="vertical"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
          tabIndex={0}
          className="absolute bottom-1 left-1/2 top-1 hidden w-3.5 -translate-x-1/2 cursor-pointer rounded-full bg-ink/[0.08] lg:block dark:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          onPointerDown={(event) => {
            event.preventDefault();
            const track = event.currentTarget;
            track.setPointerCapture(event.pointerId);
            seek(event.clientY, track);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            seek(event.clientY, event.currentTarget);
          }}
        >
          <span
            className="absolute left-0 right-0 rounded-full bg-teal shadow-[0_0_0_1px_rgba(36,26,18,0.06)]"
            style={{ height: `${thumbPct}%`, top: `${topPct}%` }}
            aria-hidden
          />
        </div>
      ) : (
        <span
          className="absolute bottom-1 left-1/2 top-1 hidden w-1 -translate-x-1/2 rounded-full bg-ink/[0.08] lg:block dark:bg-white/[0.12]"
          aria-hidden
        />
      )}
    </div>
  );
}
