"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./LibraryViewToggle.module.css";

export type LibraryViewMode = "grid" | "list";

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
 * Grid / List switch — CSS-module sizing + translate3d thumb.
 * Avoids Framer % transforms / layoutId, which collapse on iOS Safari.
 */
export function LibraryViewToggle({
  value,
  onValueChange,
  className = "",
}: LibraryViewToggleProps) {
  const index = value === "list" ? 1 : 0;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      className={cn(styles.track, className)}
    >
      <span
        className={cn(styles.thumb, index === 1 ? styles.thumbList : undefined)}
        style={mounted ? undefined : { transition: "none" }}
        aria-hidden
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
            aria-label={`${mode.label} view`}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(mode.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                go(1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                go(0);
              }
            }}
            className={cn(styles.btn, active && styles.btnActive)}
          >
            <Icon className={styles.icon} strokeWidth={2.15} aria-hidden />
            <span className={styles.label}>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
