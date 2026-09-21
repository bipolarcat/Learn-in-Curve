"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./motion-button.module.css";

/** Keep in sync with `.blob` transition duration in motion-button.module.css */
export const MOTION_BUTTON_EXPAND_MS = 500;

type MotionButtonProps = {
  label: string;
  className?: string;
  /**
   * When true, play the expand animation.
   * Driven by click/press — never by hover (hover flashed while scrolling).
   */
  pressed?: boolean;
};

/**
 * 21st.dev motion-button: orange blob is a true circle at rest, then the
 * clip-path opens to a full pill on press (no scaleX squash / square flash).
 */
export function MotionButton({
  label,
  className,
  pressed = false,
}: MotionButtonProps) {
  return (
    <span
      role="presentation"
      data-pressed={pressed ? "true" : "false"}
      className={cn(styles.root, pressed && styles.pressed, className)}
    >
      <span className={styles.blob} aria-hidden />
      <span className={styles.icon} aria-hidden>
        <ArrowRight className={styles.arrow} strokeWidth={2.25} />
      </span>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
