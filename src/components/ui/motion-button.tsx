"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * 21st.dev motion-button pattern: circle expands to fill the pill.
 * Adapted to LIC tokens; expand is controlled via `pressed` (click), not hover.
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
      className={cn(
        "group relative flex h-11 w-full items-center rounded-full border-none bg-[rgb(var(--ink-rgb))] p-1 outline-none",
        className,
      )}
    >
      <span
        className={cn(
          "m-0 block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-orange transition-[width] duration-500 ease-[var(--ease-out-quint,cubic-bezier(0.22,1,0.36,1))] motion-reduce:transition-none",
          pressed ? "w-full" : "w-9",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[rgb(var(--ink-rgb))] transition-transform duration-500 ease-[var(--ease-out-quint,cubic-bezier(0.22,1,0.36,1))] motion-reduce:transition-none",
          pressed && "translate-x-[0.35rem]",
        )}
        aria-hidden
      >
        <ArrowRight className="size-5" strokeWidth={2.25} />
      </span>
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 ml-3 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-body text-[13px] font-bold uppercase tracking-[0.02em] text-[#f6efdd] transition-colors duration-500 ease-[var(--ease-out-quint,cubic-bezier(0.22,1,0.36,1))] motion-reduce:transition-none",
          pressed && "text-[rgb(var(--ink-rgb))]",
        )}
      >
        {label}
      </span>
    </span>
  );
}
