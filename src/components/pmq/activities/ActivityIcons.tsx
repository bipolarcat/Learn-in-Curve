"use client";

import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Recall activity glyphs — same monoline language as `SiteHeaderMenuIcons`,
 * with MenuToggleIcon-style stroke morphs on hover / open.
 */

type ActivityIconProps = SVGProps<SVGSVGElement> & {
  /** Modal open — hold the “active” morph like the header menu X. */
  active?: boolean;
  durationMs?: number;
};

const baseSvg =
  "size-3.5 shrink-0 overflow-visible motion-reduce:transition-none";

/**
 * Pair up — two tiles; the bridge draws in on hover/open (match left ↔ right).
 */
export function ActivityPairupIcon({
  active = false,
  durationMs = 420,
  className,
  ...props
}: ActivityIconProps) {
  const duration = `${durationMs}ms`;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        baseSvg,
        "transition-transform ease-in-out",
        active && "-rotate-6",
        className,
      )}
      style={{ transitionDuration: duration }}
      {...props}
    >
      <rect x="2.5" y="5" width="7" height="14" rx="1.5" />
      <rect x="14.5" y="5" width="7" height="14" rx="1.5" />
      <path
        d="M9.5 12h5"
        className={cn(
          "transition-all ease-in-out motion-reduce:transition-none",
          active
            ? "[stroke-dasharray:8_24] [stroke-dashoffset:0] opacity-100"
            : "[stroke-dasharray:0_24] opacity-35 group-hover:[stroke-dasharray:8_24] group-hover:opacity-100",
        )}
        style={{ transitionDuration: duration }}
      />
    </svg>
  );
}

/**
 * Lineup — ranked bars; strokes grow into 1→2→3 order on hover/open.
 */
export function ActivityLineupIcon({
  active = false,
  durationMs = 420,
  className,
  ...props
}: ActivityIconProps) {
  const duration = `${durationMs}ms`;
  const rows = [
    { y: 6, full: 16 },
    { y: 12, full: 12 },
    { y: 18, full: 8 },
  ] as const;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(baseSvg, className)}
      {...props}
    >
      {rows.map((row) => (
        <path
          key={row.y}
          d={`M4 ${row.y}h${row.full}`}
          className={cn(
            "transition-all ease-in-out motion-reduce:transition-none",
            active
              ? "[stroke-dashoffset:0] opacity-100"
              : "opacity-55 group-hover:opacity-100",
          )}
          style={{
            transitionDuration: duration,
            strokeDasharray: row.full,
            strokeDashoffset: active ? 0 : row.full * 0.45,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Group up — 2×2 cells; idle is slightly scattered, hover/open snaps to a grid.
 */
export function ActivityGroupupIcon({
  active = false,
  durationMs = 420,
  className,
  ...props
}: ActivityIconProps) {
  const duration = `${durationMs}ms`;
  const cells = [
    { x: 3, y: 3, idle: "-translate-x-px -translate-y-px" },
    { x: 13, y: 3, idle: "translate-x-px -translate-y-px" },
    { x: 3, y: 13, idle: "-translate-x-px translate-y-px" },
    { x: 13, y: 13, idle: "translate-x-px translate-y-px" },
  ] as const;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        baseSvg,
        "transition-transform ease-in-out",
        active && "rotate-3",
        className,
      )}
      style={{ transitionDuration: duration }}
      {...props}
    >
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width="8"
          height="8"
          rx="1.5"
          className={cn(
            "origin-center transition-transform ease-in-out motion-reduce:transition-none",
            active ? "translate-x-0 translate-y-0" : cell.idle,
            !active && "group-hover:translate-x-0 group-hover:translate-y-0",
          )}
          style={{ transitionDuration: duration }}
        />
      ))}
    </svg>
  );
}
