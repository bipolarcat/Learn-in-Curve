"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

/**
 * Hand-drawn underline path from 21st.dev / Osmo “Draw Random Underline”.
 * DrawSVGPlugin is Club GSAP (paid) — draw uses stroke-dashoffset instead.
 * Draws once after layout; no hover re-draw.
 *
 * Layout note: underline is absolutely positioned under the text with a fixed
 * px height so mobile Safari doesn’t collapse/`clip` an em-sized flex child
 * (which made the stroke disappear after the gap was tightened).
 */
const UNDERLINE_PATH = {
  d: "M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999",
  viewBox: "0 0 310 40",
  /** Precomputed getTotalLength() — fallback when Safari reports 0 mid-layout. */
  length: 305.77,
} as const;

type DrawRandomUnderlineProps = {
  text: string;
  className?: string;
  textClassName?: string;
  /** Stroke colour — defaults to ink black. */
  stroke?: string;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function DrawRandomUnderline({
  text,
  className,
  textClassName,
  stroke = "#0a0806",
}: DrawRandomUnderlineProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const drawnRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const root = rootRef.current;
    if (!path || !root) return;

    let cancelled = false;
    let attempts = 0;

    const runDraw = () => {
      if (cancelled || drawnRef.current) return;

      let length = 0;
      try {
        length = path.getTotalLength();
      } catch {
        length = 0;
      }
      if (!length || length < 1) {
        length = UNDERLINE_PATH.length;
      }
      // Still wait for a real laid-out width so the stroke isn’t zero-wide.
      const svg = path.ownerSVGElement;
      const box = svg?.getBoundingClientRect();
      if ((!box || box.width < 8) && attempts++ < 20) {
        requestAnimationFrame(runDraw);
        return;
      }

      drawnRef.current = true;
      gsap.killTweensOf(path);

      if (prefersReducedMotion()) {
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: 0,
          opacity: 1,
        });
        return;
      }

      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 1,
      });
      tweenRef.current = gsap.to(path, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: "power2.inOut",
        delay: 0.12,
      });
    };

    gsap.set(path, { opacity: 0 });

    const start = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(runDraw);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "80px 0px" },
    );
    observer.observe(root);

    // Always schedule a fallback draw — IO can be flaky inside overflow-clip ancestors on iOS.
    const fallback = window.setTimeout(start, 350);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(fallback);
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-block align-baseline", className)}
    >
      <span className={cn("relative z-[1] text-orange", textClassName)}>
        {text}
      </span>
      {/*
        Absolute under the text with a fixed px height so the stroke stays
        visible on mobile; tight gap via top offset (not a collapsed flex row).
      */}
      <svg
        className="pointer-events-none absolute left-[-1%] top-[calc(100%-1px)] h-2.5 w-[102%] overflow-visible sm:h-3"
        viewBox={UNDERLINE_PATH.viewBox}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          ref={pathRef}
          d={UNDERLINE_PATH.d}
          stroke={stroke}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

/** Demo montage from the 21st.dev registry entry (optional). */
export const UnderlineAnimation: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 p-8">
      <DrawRandomUnderline text="Branding" />
      <DrawRandomUnderline text="Design" />
      <DrawRandomUnderline text="Development" />
    </div>
  );
};
