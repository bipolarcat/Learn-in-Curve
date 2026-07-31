"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Progress } from "@/components/ui/interfaces-progress";
import { cn } from "@/lib/utils";

type CourseChromeProgressProps = {
  /**
   * 0–100 overall course completion. Pass the *un-rounded* value
   * (`getCourseCompletion().percentExact`, plus any optimistic delta) — the
   * bar animates on the fraction and only the label rounds. One pathway
   * stage is ~0.595%, so rounding upstream makes the bar look frozen.
   */
  percent: number;
  /** Compact chip matching PmqCourseHeader study meta. */
  className?: string;
};

/** How long the advance flash lingers. Short — this is a confirmation, not a celebration. */
const PULSE_MS = 420;

/**
 * Course overview–style progress chip (thin bar + %).
 *
 * A single stage is worth well under 1% of the course, which on a ~48px bar is
 * sub-pixel — invisible on its own. So each *increase* also fires a brief tint
 * pulse on the chip. That's the part that makes advancing a tab feel
 * acknowledged; the bar and the number carry the actual magnitude.
 */
export function CourseChromeProgress({
  percent,
  className,
}: CourseChromeProgressProps) {
  const exact = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const pct = Math.round(exact);
  const done = pct >= 100;

  const [pulsing, setPulsing] = useState(false);
  const prevExact = useRef(exact);

  useEffect(() => {
    // Only on forward movement — a server correction downwards shouldn't flash.
    if (exact > prevExact.current) {
      setPulsing(true);
      const timer = window.setTimeout(() => setPulsing(false), PULSE_MS);
      prevExact.current = exact;
      return () => window.clearTimeout(timer);
    }
    prevExact.current = exact;
  }, [exact]);

  return (
    <div
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-[0.25rem] px-1.5 text-[11px] font-semibold tabular-nums tracking-tight transition-colors duration-300 ease-[var(--ease-out-quint)] motion-reduce:transition-none",
        pulsing
          ? "bg-orange/15 dark:bg-orange/25"
          : "bg-ink/[0.05] dark:bg-white/[0.08]",
        done ? "text-olive" : "text-ink",
        className,
      )}
    >
      <Progress
        value={exact}
        className="h-1 w-10 rounded-[0.125rem] bg-ink/10 sm:w-12"
        indicatorClassName={cn(
          "rounded-[0.125rem]",
          done ? "bg-olive" : "bg-orange",
        )}
        aria-label={`${pct}% of course complete`}
      />
      <span
        className="flex min-w-[2.75ch] items-center justify-end leading-none"
        // The rolling digits are decorative motion over a value the bar
        // already exposes via aria-label; announcing every tick would spam SRs.
        aria-hidden
      >
        <AnimatedCounter value={pct} fontSize={11} />
        <span className="ml-px">%</span>
      </span>
    </div>
  );
}
