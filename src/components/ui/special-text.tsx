"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface SpecialTextProps {
  children: string;
  /** Interval between scramble ticks (ms). */
  speed?: number;
  /** Start delay in seconds. */
  delay?: number;
  className?: string;
  /** Wait until in view before scrambling. */
  inView?: boolean;
  once?: boolean;
}

const RANDOM_CHARS = "_!X$0-+*#";

function getRandomChar(prevChar?: string): string {
  let char: string;
  do {
    char = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]!;
  } while (char === prevChar);
  return char;
}

/**
 * 21st SpecialText scramble → reveal.
 * Adapted for LIC: Space Mono (`font-stamp`), framer-motion, reduced-motion
 * shows the final string immediately.
 */
export function SpecialText({
  children,
  speed = 22,
  delay = 0,
  className = "",
  inView = false,
  once = true,
}: SpecialTextProps) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once, margin: "-80px" });
  const shouldAnimate = reduce ? false : inView ? isInView : true;

  const text = children;
  const [displayText, setDisplayText] = useState(text);
  const [hasStarted, setHasStarted] = useState(false);
  const phaseRef = useRef<"phase1" | "phase2">("phase1");
  const stepRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduce) {
      setDisplayText(text);
      setHasStarted(false);
    }
  }, [reduce, text]);

  useEffect(() => {
    if (reduce || !shouldAnimate || hasStarted) return;

    const begin = () => {
      phaseRef.current = "phase1";
      stepRef.current = 0;
      setDisplayText("\u00A0".repeat(text.length));
      setHasStarted(true);
    };

    if (delay <= 0) {
      begin();
      return;
    }

    startTimeoutRef.current = setTimeout(begin, delay * 1000);
    return () => {
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    };
  }, [shouldAnimate, hasStarted, delay, text, reduce]);

  useEffect(() => {
    if (reduce || !hasStarted) return;

    const tick = () => {
      const phase = phaseRef.current;
      const step = stepRef.current;

      if (phase === "phase1") {
        const maxSteps = text.length * 2;
        const currentLength = Math.min(step + 1, text.length);
        const chars: string[] = [];

        for (let i = 0; i < currentLength; i++) {
          if (text[i] === " ") {
            chars.push(" ");
          } else {
            chars.push(getRandomChar(i > 0 ? chars[i - 1] : undefined));
          }
        }
        for (let i = currentLength; i < text.length; i++) {
          chars.push("\u00A0");
        }

        setDisplayText(chars.join(""));

        if (step < maxSteps - 1) {
          stepRef.current = step + 1;
        } else {
          phaseRef.current = "phase2";
          stepRef.current = 0;
        }
        return;
      }

      // phase2 — resolve real characters left → right
      const revealedCount = Math.floor(step / 2);
      const chars: string[] = [];

      for (let i = 0; i < revealedCount && i < text.length; i++) {
        chars.push(text[i]!);
      }

      if (revealedCount < text.length) {
        if (text[revealedCount] === " ") {
          chars.push(" ");
        } else if (step % 2 === 0) {
          chars.push("_");
        } else {
          chars.push(getRandomChar());
        }
      }

      for (let i = chars.length; i < text.length; i++) {
        if (text[i] === " ") chars.push(" ");
        else chars.push(getRandomChar());
      }

      setDisplayText(chars.join(""));

      if (step < text.length * 2 - 1) {
        stepRef.current = step + 1;
      } else {
        setDisplayText(text);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    intervalRef.current = setInterval(tick, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasStarted, text, speed, reduce]);

  return (
    <span
      ref={containerRef}
      className={`inline-flex whitespace-pre font-stamp font-medium tabular-nums ${className}`}
      aria-hidden
    >
      {displayText}
    </span>
  );
}
