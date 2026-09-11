"use client";

import { useState } from "react";
import {
  Reorder,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import { GripVertical } from "lucide-react";
import type { LineupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";

type LineupProps = {
  activity: LineupActivity;
};

function ordersMatch(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, i) => item === b[i]);
}

/**
 * Lineup — free reorder into numbered seats, then Check answer.
 * Seat numbers stay fixed outside the cards. No mid-play locking.
 */
export function Lineup({ activity }: LineupProps) {
  const correct = activity.items;
  const reduceMotion = useReducedMotion();
  const [order, setOrder] = useState(() => shuffleUntilDifferent(correct));
  const [done, setDone] = useState(false);
  const [tryAgain, setTryAgain] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  function onCheck() {
    if (done) return;
    if (ordersMatch(order, correct)) {
      setDone(true);
      setTryAgain(false);
      setShaking(false);
      setSelected(null);
      return;
    }
    setTryAgain(true);
    setShaking(true);
    window.setTimeout(() => setShaking(false), 420);
  }

  function onTapSwap(index: number) {
    if (done) return;
    if (selected == null) {
      setSelected(index);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    const next = [...order];
    const a = next[selected]!;
    next[selected] = next[index]!;
    next[index] = a;
    setOrder(next);
    setSelected(null);
    setTryAgain(false);
  }

  return (
    <div className="grid gap-4">
      <div className="flex min-w-0 items-start gap-2.5">
        {/* Fixed seat numbers — not part of the drag list */}
        <ol
          className="m-0 flex list-none flex-col gap-2 p-0"
          aria-hidden
        >
          {correct.map((_, index) => (
            <li
              key={index}
              className="flex h-11 w-7 shrink-0 items-center justify-center"
            >
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-ink/[0.06] font-body text-[11px] font-bold tabular-nums text-ink/65">
                {index + 1}
              </span>
            </li>
          ))}
        </ol>

        {reduceMotion ? (
          <ol className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0">
            {order.map((item, index) => (
              <li key={item} className="min-w-0">
                <button
                  type="button"
                  disabled={done}
                  onClick={() => onTapSwap(index)}
                  className={cn(
                    "flex h-11 w-full items-center rounded-xl border px-3 text-left transition-colors duration-150",
                    done
                      ? "border-teal/35 bg-teal/[0.08]"
                      : selected === index
                        ? "border-teal/45 bg-teal/[0.06]"
                        : "border-black/[0.08] bg-paper dark:border-white/[0.12]",
                    shaking &&
                      "animate-[activity-shake_0.4s_ease-in-out]",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate font-body text-[13.5px] font-semibold leading-snug text-ink">
                    {item}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <Reorder.Group
            axis="y"
            values={order}
            onReorder={(next) => {
              if (done) return;
              setOrder(next);
              setTryAgain(false);
            }}
            className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0"
            as="ol"
          >
            {order.map((item) => (
              <LineupCard
                key={item}
                item={item}
                dragEnabled={!done}
                shaking={shaking}
                done={done}
              />
            ))}
          </Reorder.Group>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className={cn(
            "m-0 font-body text-[12px] font-medium tracking-tight",
            done ? "text-teal" : tryAgain ? "text-ink/70" : "text-ink/60",
          )}
          role="status"
          aria-live="polite"
        >
          {done ? "In order" : tryAgain ? "Try again." : null}
        </p>
        {!done ? (
          <button
            type="button"
            onClick={onCheck}
            className="inline-flex min-h-10 items-center rounded-xl bg-orange px-3.5 font-body text-[13px] font-semibold text-paper transition-colors duration-150 hover:bg-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Check answer
          </button>
        ) : null}
      </div>
    </div>
  );
}

function LineupCard({
  item,
  dragEnabled,
  shaking,
  done,
}: {
  item: string;
  dragEnabled: boolean;
  shaking: boolean;
  done: boolean;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      drag={dragEnabled}
      as="li"
      layout
      className={cn(
        "flex h-11 min-w-0 items-center gap-1 rounded-xl border px-1.5 transition-[border-color,background-color] duration-150 ease-[var(--ease-out-quint)]",
        done
          ? "border-teal/35 bg-teal/[0.08]"
          : "border-black/[0.08] bg-paper dark:border-white/[0.12]",
        shaking && "animate-[activity-shake_0.4s_ease-in-out]",
      )}
      whileDrag={
        dragEnabled
          ? {
              scale: 1.02,
              boxShadow: "0 12px 32px rgb(var(--ink-rgb) / 0.16)",
              zIndex: 20,
            }
          : undefined
      }
      transition={{ type: "spring", bounce: 0.1, duration: 0.28 }}
    >
      <button
        type="button"
        aria-label={dragEnabled ? `Drag to reorder: ${item}` : undefined}
        disabled={!dragEnabled}
        onPointerDown={(event) => {
          if (!dragEnabled) return;
          event.preventDefault();
          controls.start(event);
        }}
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/40 touch-none select-none",
          dragEnabled
            ? "cursor-grab active:cursor-grabbing hover:bg-ink/[0.05] hover:text-ink/70"
            : "opacity-30",
        )}
      >
        <GripVertical className="size-4" strokeWidth={2} aria-hidden />
      </button>
      <span className="min-w-0 flex-1 truncate pr-2 font-body text-[13.5px] font-semibold leading-snug text-ink">
        {item}
      </span>
    </Reorder.Item>
  );
}
