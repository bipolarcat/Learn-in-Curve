"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
} from "framer-motion";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Learn-stage “back to top” — circular scroll-progress ring (21st.dev bundui
 * Scroll Progress Bar) + magnetic cursor pull (21st.dev Button Magnetic).
 * Not a rectangle; sits beside Continue on Learn only.
 */

function scrollStudyToTop() {
  requestAnimationFrame(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });
}

const SIZE = 44;
const STROKE = 2.5;
const R = (SIZE - STROKE) / 2 - 1;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function LearnBackToTopButton({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 22 });
  const springY = useSpring(y, { stiffness: 220, damping: 22 });
  const [finePointer, setFinePointer] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setFinePointer(fine.matches);
      setReduceMotion(motion.matches);
    };
    sync();
    fine.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!finePointer || reduceMotion) {
      x.set(0);
      y.set(0);
      return;
    }

    const onMove = (e: MouseEvent) => {
      const el = buttonRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const magneticDistance = 100;
      const attraction = 0.4;

      if (distance < magneticDistance) {
        const strength = 1 - distance / magneticDistance;
        x.set(deltaX * strength * attraction);
        y.set(deltaY * strength * attraction);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [finePointer, reduceMotion, x, y]);

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={(event) => {
        event.preventDefault();
        x.set(0);
        y.set(0);
        scrollStudyToTop();
      }}
      style={
        finePointer && !reduceMotion
          ? { x: springX, y: springY }
          : undefined
      }
      whileTap={reduceMotion ? undefined : { scale: 0.92 }}
      className={cn(
        "group relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-paper text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_4px_14px_rgb(var(--ink-rgb)_/_0.06)] transition-colors duration-150 ease-[var(--ease-out-quint)] hover:border-orange/40 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 dark:border-white/15",
        className,
      )}
    >
      <svg
        className="pointer-events-none absolute inset-0 size-full -rotate-90"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden
      >
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-ink/12 dark:text-white/15"
        />
        <motion.circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="text-orange"
          style={{ pathLength: scrollYProgress }}
          pathLength={1}
          strokeDashoffset={0}
        />
      </svg>
      <ChevronUp
        className="relative size-5 text-ink/70 transition-colors duration-150 group-hover:text-orange"
        strokeWidth={2.25}
        aria-hidden
      />
    </motion.button>
  );
}
