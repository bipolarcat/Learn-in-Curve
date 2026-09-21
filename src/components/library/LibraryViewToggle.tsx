"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
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
  { value: "grid", label: "Grid view", Icon: LayoutGrid },
  { value: "list", label: "List view", Icon: List },
];

type LibraryViewToggleProps = {
  value: LibraryViewMode;
  onValueChange: (value: LibraryViewMode) => void;
  className?: string;
};

/**
 * Compact grid/list switch — 21st.dev view-mode + segmented thumb motion
 * (same spring as `SegmentedControl`), icon-only for the Shelf toolbar.
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
  const pos = useMotionValue(index);
  const thumbX = useTransform(pos, (v) => `${v * 100}%`);

  useEffect(() => {
    if (reduced) {
      pos.set(index);
      return;
    }
    const controls = animate(pos, index, CELL);
    return () => controls.stop();
  }, [index, reduced, pos]);

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
        "relative inline-flex select-none rounded-[10px] border border-ink/10 bg-ink/[0.045] p-[3px] shadow-[inset_0_1px_2px_rgb(var(--ink-rgb)_/_0.08)]",
        className,
      )}
    >
      <div
        className="relative grid grid-cols-2"
        style={{ touchAction: "manipulation" }}
        onPointerLeave={() => setHovered(-1)}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-[7px] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.12)] ring-1 ring-ink/10"
          style={{ x: thumbX }}
          initial={false}
        />

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
              aria-label={mode.label}
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
              className="relative z-[1] flex size-9 items-center justify-center rounded-[7px] outline-none focus-visible:shadow-[inset_0_0_0_2px_rgb(var(--ink-rgb)_/_0.28)]"
            >
              <Icon
                className={cn(
                  "size-[1.05rem] transition-colors duration-150 ease-[var(--ease-out-quint)]",
                  active
                    ? "text-ink"
                    : hovered === i
                      ? "text-ink/70"
                      : "text-ink/45",
                )}
                strokeWidth={2.1}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
