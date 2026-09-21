"use client";

import { useCallback, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type LibraryViewMode = "grid" | "list";

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;

const MODES: {
  value: LibraryViewMode;
  label: string;
  Icon: typeof LayoutGrid;
}[] = [
  { value: "grid", label: "Grid", Icon: LayoutGrid },
  { value: "list", label: "List", Icon: List },
];

type LibraryViewToggleProps = {
  value: LibraryViewMode;
  onValueChange: (value: LibraryViewMode) => void;
  className?: string;
};

/**
 * Compact Grid / List switch. Uses layoutId thumb (same pattern as
 * OutcomeStampSwitcher) — percentage `x` transforms break on iOS Safari.
 * Mobile: icons only + fixed width so Dynamic Type / Safari layout stays tidy.
 */
export function LibraryViewToggle({
  value,
  onValueChange,
  className = "",
}: LibraryViewToggleProps) {
  const index = value === "list" ? 1 : 0;
  const [hovered, setHovered] = useState(-1);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const thumbId = useId();

  const go = useCallback(
    (i: number) => {
      const mode = MODES[i];
      if (!mode) return;
      buttons.current[i]?.focus();
      onValueChange(mode.value);
    },
    [onValueChange],
  );

  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={cn(
        "relative inline-flex h-[2.65rem] w-[5.25rem] shrink-0 select-none items-stretch overflow-hidden rounded-[8px] border border-ink/20 bg-cream p-[3px]",
        "[text-size-adjust:100%] [-webkit-text-size-adjust:100%]",
        "sm:w-auto",
        className,
      )}
      onPointerLeave={() => setHovered(-1)}
    >
      {MODES.map((mode, i) => {
        const active = i === index;
        const Icon = mode.Icon;
        return (
          <button
            key={mode.value}
            ref={(node) => {
              buttons.current[i] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${mode.label} view`}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(mode.value)}
            onPointerEnter={() => setHovered(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                go(1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                go(0);
              }
            }}
            className={cn(
              "relative z-0 flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[5px] px-1.5 outline-none",
              "touch-manipulation [-webkit-tap-highlight-color:transparent]",
              "focus-visible:shadow-[inset_0_0_0_2px_rgb(var(--ink-rgb)_/_0.28)]",
              "sm:min-w-[4.6rem] sm:gap-1.5 sm:px-2.5",
            )}
          >
            {active ? (
              <motion.span
                layoutId={thumbId}
                className="absolute inset-0 -z-10 rounded-[5px] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.08)] ring-1 ring-ink/10"
                transition={reduced ? { duration: 0 } : CELL}
                aria-hidden
              />
            ) : null}
            <Icon
              className={cn(
                "size-3.5 shrink-0 transition-colors duration-150 ease-[var(--ease-out-quint)]",
                active
                  ? "text-ink"
                  : hovered === i
                    ? "text-ink/65"
                    : "text-ink/40",
              )}
              strokeWidth={2}
              aria-hidden
            />
            <span
              className={cn(
                "hidden whitespace-nowrap font-body text-[12px] font-semibold tracking-[-0.01em] transition-colors duration-150 ease-[var(--ease-out-quint)] sm:inline",
                active
                  ? "text-ink"
                  : hovered === i
                    ? "text-ink/65"
                    : "text-ink/40",
              )}
            >
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
