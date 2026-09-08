"use client";

import { useMemo, useState } from "react";
import type { LineupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";

type LineupProps = {
  activity: LineupActivity;
};

/**
 * Tap two cards to swap. Check locks correct positions.
 * Counts wrong turns, never time.
 */
export function Lineup({ activity }: LineupProps) {
  const correct = activity.items;

  const [order, setOrder] = useState(() => shuffleUntilDifferent(correct));
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState<Set<number>>(() => new Set());
  const [wrongTurns, setWrongTurns] = useState(0);
  const [checkedEmpty, setCheckedEmpty] = useState(false);

  function onCard(index: number) {
    if (locked.has(index)) return;
    if (selected == null) {
      setSelected(index);
      setCheckedEmpty(false);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    setOrder((current) => {
      const next = [...current];
      const a = next[selected]!;
      next[selected] = next[index]!;
      next[index] = a;
      return next;
    });
    setSelected(null);
    setCheckedEmpty(false);
  }

  function onCheck() {
    const newlyLocked = new Set(locked);
    let anyWrong = false;
    order.forEach((item, index) => {
      if (newlyLocked.has(index)) return;
      if (item === correct[index]) newlyLocked.add(index);
      else anyWrong = true;
    });
    setLocked(newlyLocked);
    if (anyWrong) {
      setWrongTurns((n) => n + 1);
      setCheckedEmpty(true);
    } else {
      setCheckedEmpty(false);
    }
  }

  const done = locked.size === correct.length && correct.length > 0;
  const canCheck = !done && order.some((_, index) => !locked.has(index));

  const progressLabel = useMemo(() => {
    if (done) {
      return `In order · ${wrongTurns} wrong turn${wrongTurns === 1 ? "" : "s"}`;
    }
    return `Wrong turns: ${wrongTurns}${checkedEmpty ? " · keep swapping" : ""}`;
  }, [checkedEmpty, done, wrongTurns]);

  return (
    <div className="grid gap-4">
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {order.map((item, index) => {
          const isLocked = locked.has(index);
          const isSelected = selected === index;
          return (
            <li key={`${item}-${index}`}>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onCard(index)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 motion-reduce:transition-none",
                  isLocked
                    ? "border-teal/30 bg-teal/10 opacity-80"
                    : isSelected
                      ? "border-orange bg-orange/10"
                      : "border-black/[0.08] bg-paper hover:border-ink/25 dark:border-white/[0.12]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md font-body text-[11px] font-bold tabular-nums",
                    isLocked ? "bg-teal text-paper" : "bg-ink/[0.06] text-ink/70",
                  )}
                >
                  {index + 1}
                </span>
                <span className="font-body text-[13.5px] font-semibold leading-snug text-ink">
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 font-body text-[12px] font-medium text-ink/65" role="status">
          {progressLabel}
        </p>
        {canCheck ? (
          <button
            type="button"
            onClick={onCheck}
            className="inline-flex min-h-10 items-center rounded-xl bg-orange px-3.5 font-body text-[13px] font-semibold text-paper transition-colors duration-150 hover:bg-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Check
          </button>
        ) : null}
      </div>
    </div>
  );
}
