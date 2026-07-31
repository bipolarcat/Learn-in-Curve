"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "framer-motion";

type LoCheckpointCelebrationProps = {
  open: boolean;
  onDone: () => void;
};

/** Brand palette — matches LO chrome (olive / gold / orange / teal / rust). */
const COLORS = ["#5f7a3d", "#d9a441", "#d5501f", "#1b6560", "#b3341c"] as const;

const DURATION_MS = 5_000;

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Checklist-complete celebration — Magic UI / canvas-confetti fireworks.
 * Complete badge lives on the checkpoint panel; reduced-motion skips particles.
 */
export function LoCheckpointCelebration({
  open,
  onDone,
}: LoCheckpointCelebrationProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    if (reduceMotion) {
      const t = window.setTimeout(onDone, 600);
      return () => window.clearTimeout(t);
    }

    const animationEnd = Date.now() + DURATION_MS;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 90,
      colors: [...COLORS],
    };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        window.clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / DURATION_MS);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    const doneTimer = window.setTimeout(onDone, DURATION_MS + 400);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(doneTimer);
    };
  }, [open, onDone, reduceMotion]);

  return null;
}
