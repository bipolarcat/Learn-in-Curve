"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Quiet play instruction under the modal title. */
export function ActivityPlayHint({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mb-3.5 font-body text-[12.5px] font-medium leading-snug text-ink/55">
      {children}
    </p>
  );
}

type ActivityPlayStatusProps = {
  done: boolean;
  doneLabel: string;
  wrongTurns: number;
  current?: number;
  total?: number;
  hint?: string | null;
};

/** Bottom status — progress + wrong turns, never a timer. */
export function ActivityPlayStatus({
  done,
  doneLabel,
  wrongTurns,
  current,
  total,
  hint,
}: ActivityPlayStatusProps) {
  const turns = `Wrong turns: ${wrongTurns}`;
  let label: string;
  if (done) {
    label = `${doneLabel} · ${wrongTurns} wrong turn${wrongTurns === 1 ? "" : "s"}`;
  } else if (hint) {
    label = `${hint} · ${turns}`;
  } else if (current != null && total != null) {
    label = `${current} of ${total} · ${turns}`;
  } else {
    label = turns;
  }

  return (
    <p
      className={cn(
        "m-0 font-body text-[12px] font-medium tracking-tight",
        done ? "text-teal" : "text-ink/60",
      )}
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  );
}

export const activityChipClass =
  "rounded-xl border border-black/[0.08] bg-paper px-3 py-2.5 text-left font-body text-[13px] font-semibold leading-snug tracking-tight text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04)] dark:border-white/[0.12]";

export const activityDockClass =
  "flex min-h-[2.75rem] items-center rounded-xl border border-dashed border-ink/20 bg-ink/[0.02] px-3 py-2 transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out-quint)] dark:border-white/20";
