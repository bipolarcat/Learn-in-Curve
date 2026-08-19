"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  trackLoCoreSequenceChecked,
  trackLoCoreSequenceRevealed,
  trackLoCoreSequenceRetried,
  trackLoCoreSequenceStarted,
  trackLoCoreSequenceViewed,
} from "@/lib/analytics/events";
import {
  seedFromLabels,
  shuffleIndices,
} from "@/lib/pmq/interactive-tables";
import {
  productActionPrimary,
  productActionSecondary,
} from "@/components/ui/semantic";

type SequenceTableProps = {
  loNumber: number;
  outcomeCode: string;
  headers: [string, string];
  rows: [string, string][];
};

type Mode = "place" | "checked" | "revealed";

function FullTable({
  headers,
  rows,
}: {
  headers: [string, string];
  rows: [string, string][];
}) {
  return (
    <div className="markdown-wide-artifact markdown-table-shell my-3 max-w-full min-w-0">
      <table>
        <thead>
          <tr>
            <th>{headers[0]}</th>
            <th>{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([left, right]) => (
            <tr key={left}>
              <td>{left}</td>
              <td>{right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SequenceTable({
  loNumber,
  outcomeCode,
  headers,
  rows,
}: SequenceTableProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const viewedRef = useRef(false);

  const labelsKey = rows.map(([left]) => left).join("\0");
  const displayOrder = useMemo(
    () => shuffleIndices(rows.length, seedFromLabels(labelsKey.split("\0"))),
    [labelsKey, rows.length],
  );

  const [placed, setPlaced] = useState<number[]>([]);
  const [mode, setMode] = useState<Mode>("place");

  useEffect(() => {
    const el = rootRef.current;
    if (!el || viewedRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || viewedRef.current) return;
        viewedRef.current = true;
        trackLoCoreSequenceViewed({
          lo_number: loNumber,
          outcome_code: outcomeCode,
        });
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loNumber, outcomeCode]);

  const positionOf = (originalIndex: number) => placed.indexOf(originalIndex);

  const liveMessage = (() => {
    if (mode === "revealed") return "Showing the full table.";
    if (mode === "checked") {
      const correct = placed.filter((original, pos) => original === pos).length;
      if (correct === rows.length) return `All ${rows.length} in the right order.`;
      return `${correct} of ${rows.length} in the right place. The correct order is below.`;
    }
    return `${placed.length} of ${rows.length} placed.`;
  })();

  function place(originalIndex: number) {
    if (mode !== "place") return;
    if (placed.includes(originalIndex)) return;
    if (!startedRef.current) {
      startedRef.current = true;
      trackLoCoreSequenceStarted({
        lo_number: loNumber,
        outcome_code: outcomeCode,
      });
    }
    setPlaced((prev) => [...prev, originalIndex]);
  }

  function undo() {
    if (mode !== "place") return;
    setPlaced((prev) => prev.slice(0, -1));
  }

  function check() {
    if (placed.length !== rows.length) return;
    const correct = placed.filter((original, pos) => original === pos).length;
    trackLoCoreSequenceChecked({
      lo_number: loNumber,
      outcome_code: outcomeCode,
      correct_count: correct,
      total: rows.length,
    });
    setMode("checked");
  }

  function reveal() {
    trackLoCoreSequenceRevealed({
      lo_number: loNumber,
      outcome_code: outcomeCode,
    });
    setMode("revealed");
  }

  function retry() {
    trackLoCoreSequenceRetried({
      lo_number: loNumber,
      outcome_code: outcomeCode,
    });
    startedRef.current = false;
    setPlaced([]);
    setMode("place");
  }

  const correctCount =
    mode === "checked"
      ? placed.filter((original, pos) => original === pos).length
      : 0;

  return (
    <div ref={rootRef} className="my-3 max-w-full min-w-0">
      {mode === "place" ? (
        <>
          <p className="mb-2 font-body text-sm font-medium leading-snug text-pretty text-ink/70">
            Put the phases in the order they happen.
          </p>
          <div className="grid gap-1.5" role="group" aria-label="Phases">
            {displayOrder.map((originalIndex) => {
              const pos = positionOf(originalIndex);
              const label = rows[originalIndex]?.[0] ?? "";
              return (
                <button
                  key={originalIndex}
                  type="button"
                  onClick={() => place(originalIndex)}
                  className="flex w-full min-h-11 items-center gap-2 rounded-xl border border-black/[0.08] bg-paper px-3 py-2 text-left font-body text-[15px] font-normal leading-snug text-ink transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent] active:bg-ink/[0.06] [@media(hover:hover)]:hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:border-white/[0.12]"
                >
                  <span
                    className="w-5 shrink-0 text-center font-body text-sm tabular-nums text-ink/45"
                    aria-hidden
                  >
                    {pos >= 0 ? pos + 1 : "·"}
                  </span>
                  <span className="min-w-0 flex-1 text-pretty">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={`${productActionPrimary} disabled:pointer-events-none disabled:opacity-45`}
              disabled={placed.length !== rows.length}
              onClick={check}
            >
              Check
            </button>
            <button
              type="button"
              className={`${productActionSecondary} disabled:pointer-events-none disabled:opacity-45`}
              disabled={placed.length === 0}
              onClick={undo}
            >
              Undo
            </button>
            <button
              type="button"
              className={productActionSecondary}
              onClick={reveal}
            >
              Show me the table
            </button>
          </div>
        </>
      ) : null}

      {mode === "checked" ? (
        <>
          <div className="grid gap-1.5">
            {placed.map((originalIndex, pos) => {
              const ok = originalIndex === pos;
              const label = rows[originalIndex]?.[0] ?? "";
              return (
                <button
                  key={`${originalIndex}-${pos}`}
                  type="button"
                  disabled
                  className={cn(
                    "flex w-full min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left font-body text-[15px] font-normal leading-snug text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                    ok
                      ? "border-olive/40 bg-olive/[0.08]"
                      : "border-rust/40 bg-rust/[0.08]",
                  )}
                >
                  <span
                    className="w-5 shrink-0 text-center font-body text-sm tabular-nums text-ink/45"
                    aria-hidden
                  >
                    {pos + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-pretty">{label}</span>
                </button>
              );
            })}
          </div>
          <p
            className={cn(
              "mt-3 font-body text-sm font-medium leading-snug text-pretty",
              correctCount === rows.length ? "text-olive" : "text-rust",
            )}
          >
            {liveMessage}
          </p>
          <FullTable headers={headers} rows={rows} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={productActionSecondary}
              onClick={retry}
            >
              Try again
            </button>
          </div>
        </>
      ) : null}

      {mode === "revealed" ? (
        <>
          <FullTable headers={headers} rows={rows} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={productActionSecondary}
              onClick={retry}
            >
              Try again
            </button>
          </div>
        </>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>
    </div>
  );
}
