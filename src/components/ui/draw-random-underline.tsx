"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

/**
 * Hand-drawn underline path from 21st.dev / Osmo “Draw Random Underline”.
 * DrawSVGPlugin is Club GSAP (paid) — draw uses stroke-dashoffset instead.
 *
 * - Full-width path under a nowrap phrase (fixes mobile cutting off “Effect”)
 * - Underline sits in padding inside the box (avoids overflow-x-clip ancestors)
 * - Draws once only after the user scrolls AND the phrase is in view
 */
const UNDERLINE_PATH = {
  // Near-full-width stroke so the right edge reaches the last word on narrow screens
  d: "M4.99805 20.9998C65.6267 17.4649 126.268 13.845 187.208 12.8887C226.483 12.2723 265.751 13.2796 304.998 13.9998",
  viewBox: "0 0 310 40",
  length: 300.5,
} as const;

type DrawRandomUnderlineProps = {
  text: string;
  className?: string;
  textClassName?: string;
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
    let userHasScrolled = false;
    let attempts = 0;

    const runDraw = () => {
      if (cancelled || drawnRef.current) return;

      let length = 0;
      try {
        length = path.getTotalLength();
      } catch {
        length = 0;
      }
      if (!length || length < 1) length = UNDERLINE_PATH.length;

      const box = path.ownerSVGElement?.getBoundingClientRect();
      if ((!box || box.width < 24) && attempts++ < 24) {
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
      });
    };

    const tryDrawIfReady = () => {
      if (cancelled || drawnRef.current || !userHasScrolled) return;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
      if (!visible) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(runDraw);
      });
    };

    gsap.set(path, { opacity: 0 });

    const onScrollOrTouch = () => {
      userHasScrolled = true;
      tryDrawIfReady();
    };

    // Gate: ignore “already in view on load” — only after a real scroll/touch move.
    window.addEventListener("scroll", onScrollOrTouch, { passive: true });
    window.addEventListener("touchmove", onScrollOrTouch, { passive: true });
    // wheel covers trackpad without changing scroll position much on some pages
    window.addEventListener("wheel", onScrollOrTouch, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!userHasScrolled) return;
        if (entries.some((e) => e.isIntersecting)) {
          tryDrawIfReady();
        }
      },
      { threshold: 0.35, rootMargin: "0px" },
    );
    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScrollOrTouch);
      window.removeEventListener("touchmove", onScrollOrTouch);
      window.removeEventListener("wheel", onScrollOrTouch);
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <span
      ref={rootRef}
      className={cn(
        // nowrap = full phrase width on mobile; pb keeps stroke inside the box
        // so section overflow-x-clip doesn’t chop the right end / “Effect”
        "relative inline-block whitespace-nowrap pb-[0.4em] align-baseline",
        className,
      )}
    >
      <span className={cn("relative z-[1] text-orange", textClassName)}>
        {text}
      </span>
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-full overflow-visible sm:h-3"
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
          strokeWidth={8}
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
