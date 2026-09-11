"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared correct-tick for Pair up + Group up.
 * One definition only — do not restyle inline in either activity.
 */
export const ACTIVITY_CORRECT_MARK_PX = 18;

type ActivityCorrectMarkProps = {
  className?: string;
};

export function ActivityCorrectMark({ className }: ActivityCorrectMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-[1.125rem] shrink-0 items-center justify-center rounded-full bg-teal text-paper",
        className,
      )}
    >
      <Check className="size-2.5" strokeWidth={3} />
    </span>
  );
}
