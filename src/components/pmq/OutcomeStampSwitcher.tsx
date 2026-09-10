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
 * LO2 mobile outcome switcher — 21st segmented motion + LIC ticket/stamp character.
 * Sliding thumb kept; track reads as a perforated stub, active code as an ink stamp.
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
        className={cn(
          "relative flex w-full items-stretch gap-1 overflow-hidden rounded-xl border-2 border-ink/90 bg-paper p-1.5",
          "shadow-[3px_3px_0_rgb(var(--ink-rgb)_/_0.18)] dark:border-ink/70 dark:shadow-[3px_3px_0_rgb(0_0_0_/_0.35)]",
          /* Ticket perforations along the top + bottom edges */
          "before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-[5px] before:bg-[radial-gradient(circle,_rgb(var(--cream-rgb))_1.5px,_transparent_1.7px)] before:bg-[length:9px_5px] before:bg-center before:content-[''] dark:before:bg-[radial-gradient(circle,_rgb(var(--cream-rgb))_1.5px,_transparent_1.7px)]",
          "after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0 after:h-[5px] after:bg-[radial-gradient(circle,_rgb(var(--cream-rgb))_1.5px,_transparent_1.7px)] after:bg-[length:9px_5px] after:bg-center after:content-['']",
        )}
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
          const showDivider = index < options.length - 1;

          return (
            <div key={option.code} className="relative flex min-w-0 flex-1">
              <button
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
                  "relative z-0 flex min-h-11 w-full min-w-0 items-center justify-center rounded-md px-1 font-stamp text-[12px] font-bold uppercase tabular-nums tracking-[0.06em] touch-manipulation [-webkit-tap-highlight-color:transparent]",
                  "transition-colors duration-150 ease-[var(--ease-out-quint)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-1 focus-visible:ring-offset-paper",
                  selected
                    ? badgeVariant === "stamp"
                      ? "text-[rgb(var(--avatar-plate-rgb))]"
                      : "text-teal"
                    : "text-ink/40 hover:text-ink/65",
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId={thumbId}
                    className={cn(
                      "absolute inset-y-0.5 inset-x-0.5 -z-10 rounded-[0.35rem]",
                      badgeVariant === "stamp"
                        ? "bg-teal shadow-[2px_2px_0_rgb(var(--ink-rgb)_/_0.35)]"
                        : "border-2 border-teal bg-cream-2/80 shadow-[2px_2px_0_rgb(var(--ink-rgb)_/_0.2)]",
                    )}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 420,
                            damping: 36,
                            mass: 0.7,
                          }
                    }
                    aria-hidden
                  />
                ) : (
                  <span
                    className="absolute inset-y-1 inset-x-1 -z-10 rounded-[0.3rem] border border-dashed border-ink/20 dark:border-white/20"
                    aria-hidden
                  />
                )}
                <motion.span
                  className="relative z-[1]"
                  animate={
                    reduceMotion
                      ? undefined
                      : selected
                        ? { rotate: -2.5, scale: 1.04 }
                        : { rotate: 0, scale: 1 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 22,
                    mass: 0.55,
                  }}
                >
                  {label}
                </motion.span>
              </button>

              {showDivider ? (
                <span
                  className="pointer-events-none absolute -right-0.5 top-1/2 z-[2] flex -translate-y-1/2 flex-col gap-1"
                  aria-hidden
                >
                  <span className="size-1 rounded-full bg-ink/25 dark:bg-ink/40" />
                  <span className="size-1 rounded-full bg-ink/25 dark:bg-ink/40" />
                  <span className="size-1 rounded-full bg-ink/25 dark:bg-ink/40" />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
