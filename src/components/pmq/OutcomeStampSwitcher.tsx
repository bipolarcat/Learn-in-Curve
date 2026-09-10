"use client";

import { useCallback, useId, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  formatOutcomeBadge,
  type OutcomeCodeBadgeVariant,
} from "@/components/pmq/OutcomeCodeBadge";
import { cn } from "@/lib/utils";

type OutcomeOption = {
  code: string;
  title: string;
};

/**
 * LO2 mobile outcome switcher — 21st.dev segmented-control inspo
 * (sliding thumb + equal segments; stamp codes instead of Lucide icons).
 */
export function OutcomeStampSwitcher({
  options,
  value,
  onChange,
  badgeVariant = "stamp",
  className,
}: {
  options: OutcomeOption[];
  value: number;
  onChange: (index: number) => void;
  badgeVariant?: OutcomeCodeBadgeVariant;
  className?: string;
}) {
  const labelId = useId();
  const thumbId = useId();
  const reduceMotion = useReducedMotion();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusAt = useCallback((index: number) => {
    refs.current[index]?.focus();
  }, []);

  const move = useCallback(
    (delta: number) => {
      if (options.length === 0) return;
      const next = (value + delta + options.length) % options.length;
      onChange(next);
      focusAt(next);
    },
    [focusAt, onChange, options.length, value],
  );

  return (
    <div className={cn("w-full min-w-0", className)}>
      <p id={labelId} className="sr-only">
        Learning outcomes
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="relative flex w-full items-stretch gap-0.5 rounded-2xl border border-black/[0.06] bg-ink/[0.035] p-1 dark:border-white/[0.1] dark:bg-white/[0.05]"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            move(1);
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            move(-1);
          } else if (event.key === "Home") {
            event.preventDefault();
            onChange(0);
            focusAt(0);
          } else if (event.key === "End") {
            event.preventDefault();
            const last = options.length - 1;
            onChange(last);
            focusAt(last);
          }
        }}
      >
        {options.map((option, index) => {
          const selected = index === value;
          const label = formatOutcomeBadge(option.code);

          return (
            <button
              key={option.code}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${label}: ${option.title}`}
              title={option.title}
              ref={(node) => {
                refs.current[index] = node;
              }}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(index)}
              className={cn(
                "relative z-0 flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-xl px-1.5 font-body text-[12px] font-semibold tabular-nums tracking-[-0.02em] transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-1 focus-visible:ring-offset-cream",
                selected
                  ? badgeVariant === "stamp"
                    ? "text-cream"
                    : "text-teal"
                  : "text-ink/45 hover:text-ink/70",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={thumbId}
                  className={cn(
                    "absolute inset-0 -z-10 rounded-[0.7rem] shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.08),0_4px_12px_rgb(var(--ink-rgb)_/_0.06)]",
                    badgeVariant === "stamp"
                      ? "bg-teal"
                      : "border border-teal/40 bg-paper dark:border-teal/50",
                  )}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 36, mass: 0.7 }
                  }
                  aria-hidden
                />
              ) : null}
              <span className="relative z-[1]">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
