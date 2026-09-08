"use client";

import { useMemo, useState } from "react";
import type { GroupupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";

type GroupupProps = {
  activity: GroupupActivity;
};

/**
 * Tap a card, tap a bucket. Tap a placed card to send it back.
 * Check counts wrong turns — never a timer.
 */
export function Groupup({ activity }: GroupupProps) {
  const pool = useMemo(
    () =>
      shuffleUntilDifferent(
        activity.items.map((item) => item.label),
      ),
    [activity],
  );

  const answer = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of activity.items) map.set(item.label, item.bucket);
    return map;
  }, [activity]);

  const [selected, setSelected] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [wrongTurns, setWrongTurns] = useState(0);
  const [hint, setHint] = useState<string | null>(null);

  const unplaced = pool.filter((label) => !placement[label]);

  function onCard(label: string) {
    if (locked.has(label)) return;
    if (placement[label]) {
      setPlacement((current) => {
        const next = { ...current };
        delete next[label];
        return next;
      });
      setSelected(null);
      setHint(null);
      return;
    }
    setSelected((current) => (current === label ? null : label));
    setHint(null);
  }

  function onBucket(bucketId: string) {
    if (!selected || locked.has(selected)) return;
    setPlacement((current) => ({ ...current, [selected]: bucketId }));
    setSelected(null);
    setHint(null);
  }

  function onCheck() {
    const newlyLocked = new Set(locked);
    let anyWrong = false;
    for (const [label, bucketId] of Object.entries(placement)) {
      if (newlyLocked.has(label)) continue;
      if (answer.get(label) === bucketId) newlyLocked.add(label);
      else anyWrong = true;
    }
    const missing = pool.some((label) => !placement[label] && !newlyLocked.has(label));
    setLocked(newlyLocked);
    if (anyWrong || missing) {
      setWrongTurns((n) => n + 1);
      setHint(missing ? "Place every card, then check again." : "Some are in the wrong bucket.");
      // Send wrong placements back to the pool (keep locked)
      setPlacement((current) => {
        const next: Record<string, string> = {};
        for (const [label, bucketId] of Object.entries(current)) {
          if (newlyLocked.has(label) || answer.get(label) === bucketId) {
            next[label] = bucketId;
          }
        }
        return next;
      });
    } else {
      setHint(null);
    }
  }

  const done = locked.size === pool.length && pool.length > 0;

  return (
    <div className="grid gap-4">
      <div className="flex min-h-[2.75rem] flex-wrap gap-2 rounded-xl border border-dashed border-ink/20 bg-ink/[0.02] p-2 dark:border-white/20">
        {unplaced.length === 0 ? (
          <p className="m-0 px-1 py-1.5 font-body text-[12px] text-ink/50">
            All placed — tap a card in a bucket to pull it back
          </p>
        ) : (
          unplaced.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onCard(label)}
              className={cn(
                "max-w-full rounded-lg border px-2.5 py-1.5 text-left font-body text-[12.5px] font-semibold leading-snug touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
                selected === label
                  ? "border-orange bg-orange/10 text-ink"
                  : "border-black/[0.08] bg-paper text-ink dark:border-white/[0.12]",
              )}
            >
              {label}
            </button>
          ))
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {activity.buckets.map((bucket) => {
          const inBucket = pool.filter((label) => placement[label] === bucket.id);
          return (
            <div
              key={bucket.id}
              className="rounded-2xl border border-black/[0.08] bg-paper p-2.5 dark:border-white/[0.12]"
            >
              <button
                type="button"
                onClick={() => onBucket(bucket.id)}
                className={cn(
                  "mb-2 w-full rounded-xl border border-dashed px-2.5 py-2 text-left transition-colors duration-150 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
                  selected
                    ? "border-orange bg-orange/10"
                    : "border-ink/20 hover:border-teal/50",
                )}
              >
                <span className="font-body text-[13px] font-bold text-ink">
                  {bucket.label}
                </span>
                {bucket.hint ? (
                  <span className="mt-0.5 block font-body text-[11px] text-ink/55">
                    {bucket.hint}
                  </span>
                ) : null}
              </button>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {inBucket.map((label) => {
                  const isLocked = locked.has(label);
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => onCard(label)}
                        className={cn(
                          "w-full rounded-lg border px-2.5 py-1.5 text-left font-body text-[12.5px] font-semibold leading-snug touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
                          isLocked
                            ? "border-teal/30 bg-teal/10 text-ink/60"
                            : "border-black/[0.08] bg-ink/[0.03] text-ink dark:border-white/[0.12]",
                        )}
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 font-body text-[12px] font-medium text-ink/65" role="status">
          {done
            ? `Sorted · ${wrongTurns} wrong turn${wrongTurns === 1 ? "" : "s"}`
            : hint
              ? `${hint} · Wrong turns: ${wrongTurns}`
              : `Wrong turns: ${wrongTurns}`}
        </p>
        {!done ? (
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
