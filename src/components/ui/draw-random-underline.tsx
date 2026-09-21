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
  // Hand-bent stroke (Osmo variant 0) — not the flat line
  d: "M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999",
  viewBox: "0 0 310 40",
  length: 305.77,
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
        // Flow layout (not absolute bottom): gap = margin-top under the glyphs.
        // Absolute + path in the top of the viewBox was painting through “g”
        // no matter how large pb was. nowrap keeps full phrase width on mobile.
        "inline-flex flex-col items-stretch whitespace-nowrap align-baseline",
        className,
      )}
    >
      <span className={cn("leading-none text-orange", textClassName)}>
        {text}
      </span>
      <svg
        className="pointer-events-none mt-px h-2.5 w-full overflow-visible"
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
