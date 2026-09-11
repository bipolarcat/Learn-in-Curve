"use client";

import { useId, type SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Recall activity glyphs.
 *
 * Pair up / Group up: iPhone-app-thumbnail squircles with LIC color + soft morphs.
 * Lineup: monoline mark with hover morph.
 */

type ActivityIconProps = SVGProps<SVGSVGElement> & {
  /** Modal open — hold the “active” morph. */
  active?: boolean;
  durationMs?: number;
};

const baseSvg =
  "size-3.5 shrink-0 overflow-visible motion-reduce:transition-none";

/**
 * Pair up — iPhone-style squircle thumbnail.
 * Structure: twin pillars + bridge arrow (inspired by a pairing app mark);
 * LIC orange plate; cream pillars + teal bridge arrow.
 */
export function ActivityPairupIcon({
  active = false,
  durationMs = 380,
  className,
  ...props
}: ActivityIconProps) {
  const uid = useId().replace(/:/g, "");
  const barGrad = `pair-bar-${uid}`;
  const arrowShadow = `pair-arrow-shadow-${uid}`;
  const duration = `${durationMs}ms`;

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn(
        "size-8 shrink-0 overflow-visible transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none",
        active && "scale-[1.04]",
        className,
      )}
      style={{ transitionDuration: duration }}
      {...props}
    >
      <defs>
        <linearGradient id={barGrad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2A7A74" />
          <stop offset="100%" stopColor="#1B6560" />
        </linearGradient>
        <filter
          id={arrowShadow}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="0.8"
            stdDeviation="0.7"
            floodColor="#241A12"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      {/* App thumbnail squircle — brand orange plate */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="var(--orange, #D5501F)"
        style={{
          filter: "drop-shadow(0 1.5px 3px rgb(36 26 18 / 0.14))",
        }}
      />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="13.5"
        fill="none"
        stroke="rgb(251 243 225 / 0.28)"
        strokeWidth="1"
      />

      {/* Twin pillars — cream */}
      <rect
        x="14"
        y="16"
        width="14"
        height="32"
        rx="4"
        fill="rgb(var(--avatar-plate-rgb))"
        className={cn(
          "origin-center transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          active && "translate-x-px",
        )}
        style={{ transitionDuration: duration }}
      />
      <rect
        x="36"
        y="16"
        width="14"
        height="32"
        rx="4"
        fill="rgb(var(--avatar-plate-rgb))"
        className={cn(
          "origin-center transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          active && "-translate-x-px",
        )}
        style={{ transitionDuration: duration }}
      />

      {/* Bridge arrow — teal across both pillars */}
      <path
        d="M18 27.5H38.5V22.5L50 32 38.5 41.5V36.5H18Z"
        fill={`url(#${barGrad})`}
        filter={`url(#${arrowShadow})`}
        className={cn(
          "origin-center transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none",
          active && "translate-x-0.5",
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
 * Group up — app squircle with four colored tiles (teal / olive / gold / cream).
 * Idle: tiles gently apart; hover/open: they slide together (group).
 */
export function ActivityGroupupIcon({
  active = false,
  durationMs = 400,
  className,
  ...props
}: ActivityIconProps) {
  const duration = `${durationMs}ms`;
  const cells = [
    {
      x: 13,
      y: 13,
      fill: "#1B6560", // teal
      idle: "-translate-x-1 -translate-y-1",
    },
    {
      x: 33,
      y: 13,
      fill: "#5F7A3D", // olive
      idle: "translate-x-1 -translate-y-1",
    },
    {
      x: 13,
      y: 33,
      fill: "#D9A441", // gold
      idle: "-translate-x-1 translate-y-1",
    },
    {
      x: 33,
      y: 33,
      fill: "rgb(var(--avatar-plate-rgb))", // cream
      idle: "translate-x-1 translate-y-1",
    },
  ] as const;

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn(
        "size-8 shrink-0 overflow-visible transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none",
        active && "scale-[1.04]",
        className,
      )}
      style={{ transitionDuration: duration }}
      {...props}
    >
      {/* App thumbnail squircle — ink plate so colored tiles read clearly */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="rgb(36 26 18)"
        style={{
          filter: "drop-shadow(0 1.5px 3px rgb(36 26 18 / 0.14))",
        }}
      />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="13.5"
        fill="none"
        stroke="rgb(251 243 225 / 0.18)"
        strokeWidth="1"
      />

      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width="18"
          height="18"
          rx="5"
          fill={cell.fill}
          className={cn(
            "origin-center transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none",
            active
              ? "translate-x-0 translate-y-0"
              : cell.idle,
            !active &&
              "group-hover:translate-x-0 group-hover:translate-y-0",
          )}
          style={{ transitionDuration: duration }}
        />
      ))}
    </svg>
  );
}
