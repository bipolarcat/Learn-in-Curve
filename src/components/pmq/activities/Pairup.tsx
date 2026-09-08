"use client";

import { useMemo, useState } from "react";
import type { PairupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";

type PairupProps = {
  activity: PairupActivity;
};

type Flash = "wrong" | null;

/**
 * Tap a term, tap a meaning. Correct pairs lock; wrong pairs flash and reset.
 * Counts wrong turns, never time.
 */
export function Pairup({ activity }: PairupProps) {
  const terms = useMemo(
    () =>
      shuffleUntilDifferent(
        activity.pairs.map((pair) => pair.term),
      ),
    [activity],
  );
  const matches = useMemo(
    () =>
      shuffleUntilDifferent(
        activity.pairs.map((pair) => pair.match),
      ),
    [activity],
  );

  const answer = useMemo(() => {
    const map = new Map<string, string>();
    for (const pair of activity.pairs) map.set(pair.term, pair.match);
    return map;
  }, [activity]);

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [wrongTurns, setWrongTurns] = useState(0);
  const [flash, setFlash] = useState<Flash>(null);

  function tryPair(term: string, match: string) {
    if (answer.get(term) === match) {
      setLocked((current) => new Set(current).add(term));
      setSelectedTerm(null);
      setSelectedMatch(null);
      setFlash(null);
      return;
    }
    setWrongTurns((n) => n + 1);
    setFlash("wrong");
    window.setTimeout(() => {
      setFlash(null);
      setSelectedTerm(null);
      setSelectedMatch(null);
    }, 420);
  }

  function onTerm(term: string) {
    if (locked.has(term) || flash) return;
    if (selectedMatch) {
      tryPair(term, selectedMatch);
      return;
    }
    setSelectedTerm((current) => (current === term ? null : term));
  }

  function onMatch(match: string) {
    if (flash) return;
    const matchedByLocked = [...locked].some((term) => answer.get(term) === match);
    if (matchedByLocked) return;
    if (selectedTerm) {
      tryPair(selectedTerm, match);
      return;
    }
    setSelectedMatch((current) => (current === match ? null : match));
  }

  const done = locked.size === activity.pairs.length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {terms.map((term) => {
            const isLocked = locked.has(term);
            const isSelected = selectedTerm === term;
            return (
              <li key={term}>
                <button
                  type="button"
                  disabled={isLocked || Boolean(flash)}
                  onClick={() => onTerm(term)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left font-body text-[13px] font-semibold leading-snug tracking-tight transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 motion-reduce:transition-none",
                    isLocked
                      ? "border-teal/30 bg-teal/10 text-ink/55 opacity-70"
                      : isSelected
                        ? "border-orange bg-orange/10 text-ink"
                        : flash === "wrong" && isSelected
                          ? "border-rust bg-rust/10 text-ink"
                          : "border-black/[0.08] bg-paper text-ink hover:border-ink/25 dark:border-white/[0.12]",
                  )}
                >
                  {term}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {matches.map((match) => {
            const isLocked = [...locked].some((term) => answer.get(term) === match);
            const isSelected = selectedMatch === match;
            return (
              <li key={match}>
                <button
                  type="button"
                  disabled={isLocked || Boolean(flash)}
                  onClick={() => onMatch(match)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left font-body text-[13px] leading-snug tracking-tight transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 motion-reduce:transition-none",
                    isLocked
                      ? "border-teal/30 bg-teal/10 text-ink/55 opacity-70"
                      : isSelected
                        ? "border-orange bg-orange/10 text-ink"
                        : "border-black/[0.08] bg-paper text-ink hover:border-ink/25 dark:border-white/[0.12]",
                  )}
                >
                  {match}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="m-0 font-body text-[12px] font-medium text-ink/65" role="status">
        {done
          ? `Done · ${wrongTurns} wrong turn${wrongTurns === 1 ? "" : "s"}`
          : `Wrong turns: ${wrongTurns}`}
      </p>
    </div>
  );
}
