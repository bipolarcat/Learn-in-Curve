"use client";

import { useId, type ReactNode, type SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Recall activity glyphs — iPhone-app-thumbnail squircles with LIC color + soft morphs.
 * Shared plate chrome: layered contact shadow + top specular + rim (Apple home-screen pop).
 */

type ActivityIconProps = SVGProps<SVGSVGElement> & {
  /** Modal open — hold the “active” morph. */
  active?: boolean;
  durationMs?: number;
};

/** iOS-home-screen style plate: soft dual shadow, lit top, rim highlight. */
function AppIconPlate({
  uid,
  fill,
  rimOpacity = 0.32,
}: {
  uid: string;
  fill: string;
  rimOpacity?: number;
}) {
  const shadow = `app-icon-shadow-${uid}`;
  const sheen = `app-icon-sheen-${uid}`;
  const shade = `app-icon-shade-${uid}`;

  return (
    <>
      <defs>
        <filter
          id={shadow}
          x="-35%"
          y="-25%"
          width="170%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          {/* Soft ambient lift */}
          <feDropShadow
            dx="0"
            dy="1.2"
            stdDeviation="1.4"
            floodColor="#241A12"
            floodOpacity="0.18"
          />
          {/* Tighter contact shadow under the tile */}
          <feDropShadow
            dx="0"
            dy="3.2"
            stdDeviation="2.6"
            floodColor="#241A12"
            floodOpacity="0.22"
          />
        </filter>
        {/* Top-lit wash — brighter at the crown, like an iOS icon */}
        <linearGradient id={sheen} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Bottom edge weight so the plate sits on the page */}
        <linearGradient id={shade} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="55%" stopColor="#241A12" stopOpacity="0" />
          <stop offset="100%" stopColor="#241A12" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      <g filter={`url(#${shadow})`}>
        <rect x="2" y="2" width="60" height="60" rx="14" fill={fill} />
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill={`url(#${sheen})`}
        />
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill={`url(#${shade})`}
        />
        {/* Specular rim — brightest along the top edge */}
        <rect
          x="2.75"
          y="2.75"
          width="58.5"
          height="58.5"
          rx="13.25"
          fill="none"
          stroke={`rgb(251 243 225 / ${rimOpacity})`}
          strokeWidth="1.15"
        />
        <path
          d="M12 4.2H52C55.5 4.2 58.2 5.4 59.4 7.2"
          fill="none"
          stroke="rgb(255 255 255 / 0.42)"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>
    </>
  );
}

function AppIconShell({
  active,
  durationMs,
  className,
  children,
  ...props
}: ActivityIconProps & { children: ReactNode }) {
  const duration = `${durationMs ?? 380}ms`;
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn(
        "size-6 shrink-0 overflow-visible transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none",
        active && "scale-[1.04]",
        className,
      )}
      style={{ transitionDuration: duration }}
      {...props}
    >
      {children}
    </svg>
  );
}

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
    <AppIconShell
      active={active}
      durationMs={durationMs}
      className={className}
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
            dy="0.6"
            stdDeviation="0.55"
            floodColor="#241A12"
            floodOpacity="0.22"
          />
        </filter>
      </defs>

      <AppIconPlate
        uid={uid}
        fill="var(--orange, #D5501F)"
        rimOpacity={0.34}
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
    </AppIconShell>
  );
}

/**
 * Lineup — app squircle with ranked bars.
 * Idle: bars in short→medium→long order; hover/open: they scramble.
 */
export function ActivityLineupIcon({
  active = false,
  durationMs = 400,
  className,
  ...props
}: ActivityIconProps) {
  const uid = useId().replace(/:/g, "");
  const duration = `${durationMs}ms`;
  const bars = [
    {
      y: 16,
      idleW: 18,
      activeW: 34,
      fill: "rgb(var(--avatar-plate-rgb))",
    },
    {
      y: 28,
      idleW: 26,
      activeW: 16,
      fill: "#D9A441",
    },
    {
      y: 40,
      idleW: 34,
      activeW: 26,
      fill: "rgb(var(--avatar-plate-rgb))",
    },
  ] as const;

  return (
    <AppIconShell
      active={active}
      durationMs={durationMs}
      className={className}
      {...props}
    >
      <AppIconPlate uid={uid} fill="#1B6560" rimOpacity={0.28} />

      {bars.map((bar) => (
        <rect
          key={bar.y}
          x={15}
          y={bar.y}
          width={34}
          height="8"
          rx="4"
          fill={bar.fill}
          className="origin-left transition-transform ease-[var(--ease-out-quint)] motion-reduce:transition-none"
          style={{
            transitionDuration: duration,
            transform: `scaleX(${(active ? bar.activeW : bar.idleW) / 34})`,
          }}
        />
      ))}
    </AppIconShell>
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
  const uid = useId().replace(/:/g, "");
  const duration = `${durationMs}ms`;
  const cells = [
    {
      x: 13,
      y: 13,
      fill: "#1B6560",
      idle: "-translate-x-1 -translate-y-1",
    },
    {
      x: 33,
      y: 13,
      fill: "#5F7A3D",
      idle: "translate-x-1 -translate-y-1",
    },
    {
      x: 13,
      y: 33,
      fill: "#D9A441",
      idle: "-translate-x-1 translate-y-1",
    },
    {
      x: 33,
      y: 33,
      fill: "rgb(var(--avatar-plate-rgb))",
      idle: "translate-x-1 translate-y-1",
    },
  ] as const;

  return (
    <AppIconShell
      active={active}
      durationMs={durationMs}
      className={className}
      {...props}
    >
      <AppIconPlate uid={uid} fill="rgb(36 26 18)" rimOpacity={0.22} />

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
            active ? "translate-x-0 translate-y-0" : cell.idle,
            !active &&
              "group-hover:translate-x-0 group-hover:translate-y-0",
          )}
          style={{ transitionDuration: duration }}
        />
      ))}
    </AppIconShell>
  );
}
