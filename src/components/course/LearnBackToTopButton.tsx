"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Learn-stage “Back to Top” — progress-ring icon + label on the left edge of
 * the Continue row. Ring from 21st.dev bundui Scroll Progress; magnetic pull
 * from 21st.dev Button Magnetic. No arrow glyph.
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

const ICON = 22;
const STROKE = 2.25;
const R = (ICON - STROKE) / 2 - 0.5;
const CX = ICON / 2;
const CY = ICON / 2;

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
      const magneticDistance = 90;
      const attraction = 0.35;

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
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded-lg px-0.5 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        className,
      )}
    >
      <span
        className="relative inline-flex size-[1.375rem] shrink-0 items-center justify-center"
        aria-hidden
      >
        <svg
          className="size-full -rotate-90"
          width={ICON}
          height={ICON}
          viewBox={`0 0 ${ICON} ${ICON}`}
        >
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-ink/15 dark:text-white/20"
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
      </span>
      <span className="truncate font-body text-[12px] font-semibold leading-none tracking-tight text-ink/55 transition-colors duration-150 group-hover:text-orange sm:text-[13px]">
        Back to Top
      </span>
    </motion.button>
  );
}
