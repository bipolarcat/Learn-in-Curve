"use client";

import { useCallback, useId, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { formatOutcomeBadge } from "@/components/pmq/OutcomeCodeBadge";
import { cn } from "@/lib/utils";

type OutcomeOption = {
  code: string;
  title: string;
};

/**
 * LO2 mobile outcome switcher — Apple-like segmented control.
 * Compact track + quiet type; soft sliding thumb. No ticket/stamp chrome.
 */
export function OutcomeStampSwitcher({
  options,
  value,
  onChange,
  className,
}: {
  options: OutcomeOption[];
  value: number;
  onChange: (index: number) => void;
  /** Kept for call-site compat; Apple style ignores stamp chrome. */
  badgeVariant?: string;
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
        className="relative flex w-full items-stretch gap-0 rounded-[7px] bg-ink/[0.06] p-px dark:bg-white/[0.08]"
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
                "relative z-0 flex min-h-7 min-w-0 flex-1 items-center justify-center rounded-[6px] px-1.5 font-body text-[11.5px] font-semibold tabular-nums tracking-[-0.01em] touch-manipulation [-webkit-tap-highlight-color:transparent]",
                "transition-colors duration-150 ease-[var(--ease-out-quint)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-1 focus-visible:ring-offset-paper",
                selected
                  ? "text-[rgb(var(--avatar-plate-rgb))]"
                  : "text-ink/45 hover:text-ink/70",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={thumbId}
                  className="absolute inset-0 -z-10 rounded-[6px] bg-teal shadow-[0_1px_1px_rgb(var(--ink-rgb)_/_0.08),0_1px_2px_rgb(var(--teal-rgb)_/_0.18)] dark:shadow-[0_1px_2px_rgb(0_0_0_/_0.3)]"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 500,
                          damping: 38,
                          mass: 0.6,
                        }
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
