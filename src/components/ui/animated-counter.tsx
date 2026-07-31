"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Odometer-style rolling number.
 *
 * Adapted from the shadcn-style `animated-counter` recipe, with two
 * deliberate divergences from the upstream snippet:
 *
 * 1. **Value-tracking, not count-up.** Upstream drives an internal
 *    `setInterval` that ticks `start → end` once and stops, so it can only
 *    play a one-shot "count up on mount" animation. We need a number that
 *    smoothly chases whatever `value` currently is, every time it changes
 *    (progress can move many times per session). The interval is gone; the
 *    per-digit spring is now the only animation source.
 * 2. **`framer-motion`, not `motion`.** They're the same library — `motion`
 *    is the newer package name for framer-motion v11+. This repo already
 *    depends on `framer-motion@^12`, so importing `motion/react` would pull
 *    a second copy of the animation runtime into the bundle for zero gain.
 *
 * `height` is derived from the `fontSize` prop rather than a module-level
 * constant, so the roll distance always matches the rendered glyph — the
 * upstream version hard-codes 50px and visibly mis-rolls at any other size.
 */

type AnimatedCounterProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** Current value. Rounded to an integer for display. */
  value: number;
  fontSize?: number;
  /** Vertical breathing room; also the per-digit roll distance. */
  padding?: number;
  /** Spring feel. Defaults are tuned snappy — settles in ~250ms. */
  stiffness?: number;
  damping?: number;
};

export function AnimatedCounter({
  value,
  fontSize = 11,
  padding = 2,
  stiffness = 320,
  damping = 26,
  className,
  style,
  ...rest
}: AnimatedCounterProps) {
  const reduceMotion = useReducedMotion();
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  const height = fontSize + padding;

  // Digit slots, most significant first. Keyed by place value so an existing
  // digit keeps its spring state when the number grows (9 → 10 only mounts
  // the new tens slot; the units slot rolls 9 → 0 instead of resetting).
  const places = React.useMemo(() => {
    const digits = String(safe).length;
    return Array.from({ length: digits }, (_, i) => 10 ** (digits - 1 - i));
  }, [safe]);

  // Respect prefers-reduced-motion: show the number, skip the roll entirely.
  if (reduceMotion) {
    return (
      <span
        {...rest}
        style={{ fontSize, ...style }}
        className={cn("inline-flex leading-none tabular-nums", className)}
      >
        {safe}
      </span>
    );
  }

  return (
    <span
      {...rest}
      style={{ fontSize, height, ...style }}
      className={cn(
        "inline-flex overflow-hidden leading-none tabular-nums",
        className,
      )}
    >
      {places.map((place) => (
        <Digit
          key={place}
          place={place}
          value={safe}
          height={height}
          stiffness={stiffness}
          damping={damping}
        />
      ))}
    </span>
  );
}

function Digit({
  place,
  value,
  height,
  stiffness,
  damping,
}: {
  place: number;
  value: number;
  height: number;
  stiffness: number;
  damping: number;
}) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace, {
    stiffness,
    damping,
    mass: 0.6,
  });

  React.useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <span style={{ height }} className="relative w-[1ch] tabular-nums">
      {Array.from({ length: 10 }, (_, i) => (
        <NumberSlot key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

// NB: upstream calls this `Number`, which shadows the global `Number` for the
// whole module and breaks any `Number.isFinite(...)` guard in the same file.
function NumberSlot({
  mv,
  number,
  height,
}: {
  mv: MotionValue<number>;
  number: number;
  height: number;
}) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    // Take the short way round: rolling 9 → 0 goes down one slot, not up nine.
    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}
