"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./motion-button.module.css";

/** Keep in sync with expand transition duration below */
export const MOTION_BUTTON_EXPAND_MS = 480;

/** Matches --motion-disc (2.25rem) at default 16px root */
const DISC_PX = 36;

type MotionButtonProps = {
  label: string;
  className?: string;
  /**
   * When true, play the expand animation.
   * Driven by click/press — never by hover (hover flashed while scrolling).
   */
  pressed?: boolean;
};

const EXPAND_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 21st.dev motion-button: orange disc grows into a full pill on press.
 * Width is pixel-tweened by Framer Motion for a clean circle→stadium morph.
 */
export function MotionButton({
  label,
  className,
  pressed = false,
}: MotionButtonProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [expandedWidth, setExpandedWidth] = useState(DISC_PX);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const cs = getComputedStyle(el);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      setExpandedWidth(Math.max(DISC_PX, el.clientWidth - padL - padR));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <span
      ref={rootRef}
      role="presentation"
      data-pressed={pressed ? "true" : "false"}
      className={cn(styles.root, pressed && styles.pressed, className)}
    >
      <motion.span
        className={styles.blob}
        aria-hidden
        initial={false}
        animate={{
          width: pressed ? expandedWidth : DISC_PX,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: MOTION_BUTTON_EXPAND_MS / 1000, ease: EXPAND_EASE }
        }
      />
      <span className={styles.icon} aria-hidden>
        <ArrowRight className={styles.arrow} strokeWidth={2.25} />
      </span>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
