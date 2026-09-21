"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Hand-drawn underline path — adapted from 21st.dev “Draw Random Underline”
 * (Osmo / osmosupply). Animated with stroke pathLength on scroll into view.
 */
const HANDWRITTEN_UNDERLINE_D =
  "M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999";

type HandwrittenUnderlineProps = {
  children: React.ReactNode;
  className?: string;
};

export function HandwrittenUnderline({
  children,
  className,
}: HandwrittenUnderlineProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduce = useReducedMotion();
  const drawn = Boolean(reduce || inView);

  return (
    <span
      ref={ref}
      className={cn("relative inline-block whitespace-nowrap", className)}
    >
      <span className="relative z-[1] font-bold text-orange">{children}</span>
      <svg
        className="pointer-events-none absolute left-[-2%] top-[0.92em] h-[0.42em] w-[104%] overflow-visible text-orange"
        viewBox="0 0 310 40"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d={HANDWRITTEN_UNDERLINE_D}
          fill="none"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: 0.85,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.12,
                }
          }
        />
      </svg>
    </span>
  );
}
