"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./motion-button.module.css";

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
 * 21st.dev motion-button: circular orange disc; on press a fill expands across
 * the ink pill (transform only — disc stays a true circle at rest).
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
      <span className={styles.fill} aria-hidden />
      <span className={styles.disc} aria-hidden />
      <span className={styles.icon} aria-hidden>
        <ArrowRight className={styles.arrow} strokeWidth={2.25} />
      </span>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
