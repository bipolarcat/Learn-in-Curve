"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./purchase-cta.module.css";

/**
 * Compact purchase CTA motion shell.
 *
 * Inspired by 21st.dev Native Button (spring whileHover / whileTap + loading
 * calm) and Subtle / Interactive Hover CTAs, but LIC-specific: ink→teal press,
 * ticket specular sheen, Pro chip stamp-lift — not glassmorphism or purple glow.
 *
 * Framer owns physics; CSS owns colour/sheen so reduced-motion can kill both.
 */
const PURCHASE_SPRING = {
  type: "spring" as const,
  stiffness: 440,
  damping: 24,
  mass: 0.55,
};

type PurchaseCtaButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: ReactNode;
  pending?: boolean;
};

export const PurchaseCtaButton = forwardRef<
  HTMLButtonElement,
  PurchaseCtaButtonProps
>(function PurchaseCtaButton(
  {
    className,
    children,
    pending = false,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const inert = Boolean(disabled || pending);

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={inert}
      className={cn(styles.root, className)}
      whileHover={
        reduceMotion || inert ? undefined : { scale: 1.045, y: -1.5 }
      }
      whileTap={reduceMotion || inert ? undefined : { scale: 0.96, y: 0 }}
      transition={PURCHASE_SPRING}
      {...props}
    >
      <span className={styles.sheen} aria-hidden />
      <span className={styles.glow} aria-hidden />
      <span className={styles.label}>{children}</span>
    </motion.button>
  );
});

/** Shared Pro mark — chip lifts via `[data-pro-chip]` CSS on the purchase CTA. */
export function ProBundleChip({ className }: { className?: string }) {
  return (
    <span
      data-pro-chip
      className={cn(
        "inline-flex h-4 shrink-0 items-center rounded-[0.2rem] bg-teal px-1 text-[9px] font-bold leading-none tracking-tight text-paper",
        className,
      )}
    >
      Pro
    </span>
  );
}
