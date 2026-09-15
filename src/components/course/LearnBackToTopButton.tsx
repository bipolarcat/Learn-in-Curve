"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Learn-stage “Back to Top” — up arrow stacked above the label, left edge of
 * the Continue row. Magnetic pull from 21st.dev Button Magnetic.
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

export function LearnBackToTopButton({ className }: { className?: string }) {
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
        "group inline-flex max-w-full items-end gap-0 rounded-lg px-0.5 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="inline-flex flex-col items-center gap-0.5">
        <ChevronUp
          className="size-3.5 shrink-0 text-ink/55 transition-colors duration-150 group-hover:text-orange"
          strokeWidth={2.5}
          aria-hidden
        />
        <span className="font-body text-[12px] font-semibold leading-none tracking-tight text-ink/55 transition-colors duration-150 group-hover:text-orange sm:text-[13px]">
          Back
        </span>
      </span>
      <span className="pl-1.5 font-body text-[12px] font-semibold leading-none tracking-tight text-ink/55 transition-colors duration-150 group-hover:text-orange sm:text-[13px]">
        to Top
      </span>
    </motion.button>
  );
}
