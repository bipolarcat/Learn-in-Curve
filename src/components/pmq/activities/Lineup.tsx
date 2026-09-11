"use client";

import { useMemo, useState } from "react";
import {
  Reorder,
  useDragControls,
  useReducedMotion,
  motion,
} from "framer-motion";
import { GripVertical } from "lucide-react";
import type { LineupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";
import {
  ActivityPlayHint,
  ActivityPlayStatus,
} from "@/components/pmq/activities/ActivityPlayChrome";

type LineupProps = {
  activity: LineupActivity;
};

/**
 * Lineup — drag rows into the correct order (Apple Reminders reorder).
 * Correct seats click into place and lock. Reduced-motion: tap two to swap.
 */
export function Lineup({ activity }: LineupProps) {
  const correct = activity.items;
  const reduceMotion = useReducedMotion();
  const [order, setOrder] = useState(() => shuffleUntilDifferent(correct));
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [wrongTurns, setWrongTurns] = useState(0);
  const [justChecked, setJustChecked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const done = locked.size === correct.length && correct.length > 0;

  function settleOrder(next: string[]) {
    setOrder(next);
    const newly = new Set(locked);
    next.forEach((item, index) => {
      if (newly.has(item)) return;
      if (item === correct[index]) newly.add(item);
    });
    setLocked(newly);
    setJustChecked(false);
    setSelected(null);
  }

  function onCheck() {
    const newly = new Set(locked);
    let anyWrong = false;
    order.forEach((item, index) => {
      if (newly.has(item)) return;
      if (item === correct[index]) newly.add(item);
      else anyWrong = true;
    });
    setLocked(newly);
    if (anyWrong) {
      setWrongTurns((n) => n + 1);
      setJustChecked(true);
    } else {
      setJustChecked(false);
    }
  }

  function onTapSwap(index: number) {
    if (locked.has(order[index]!)) return;
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
    settleOrder(next);
  }

  const progressHint = useMemo(() => {
    if (done) return null;
    return justChecked ? "Keep moving — some seats are still wrong" : null;
  }, [done, justChecked]);

  return (
    <div className="grid gap-4">
      <ActivityPlayHint>
        {reduceMotion
          ? "Tap two rows to swap them, then Check seats."
          : "Drag by the handle to reorder. Correct seats click into place — or hit Check seats."}
      </ActivityPlayHint>

      {reduceMotion ? (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {order.map((item, index) => {
            const isLocked = locked.has(item);
            return (
              <li key={item}>
                <button
                  type="button"
                  disabled={isLocked || done}
                  onClick={() => onTapSwap(index)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors duration-150",
                    isLocked
                      ? "border-teal/35 bg-teal/[0.08]"
                      : selected === index
                        ? "border-orange bg-orange/10"
                        : "border-black/[0.08] bg-paper dark:border-white/[0.12]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md font-body text-[11px] font-bold tabular-nums",
                      isLocked ? "bg-teal text-paper" : "bg-ink/[0.06] text-ink/65",
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
      ) : (
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={(next) => {
            const pinned = [...next];
            correct.forEach((item, index) => {
              if (!locked.has(item)) return;
              const at = pinned.indexOf(item);
              if (at === -1 || at === index) return;
              pinned.splice(at, 1);
              pinned.splice(index, 0, item);
            });
            settleOrder(pinned);
          }}
          className="m-0 flex list-none flex-col gap-2 p-0"
          as="ol"
        >
          {order.map((item, index) => (
            <LineupRow
              key={item}
              item={item}
              index={index}
              locked={locked.has(item)}
              dragEnabled={!locked.has(item) && !done}
            />
          ))}
        </Reorder.Group>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ActivityPlayStatus
          done={done}
          doneLabel="In order"
          wrongTurns={wrongTurns}
          current={locked.size}
          total={correct.length}
          hint={progressHint}
        />
        {!done ? (
          <button
            type="button"
            onClick={onCheck}
            className="inline-flex min-h-10 items-center rounded-xl bg-orange px-3.5 font-body text-[13px] font-semibold text-paper transition-colors duration-150 hover:bg-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Check seats
          </button>
        ) : null}
      </div>
    </div>
  );
}

function LineupRow({
  item,
  index,
  locked,
  dragEnabled,
}: {
  item: string;
  index: number;
  locked: boolean;
  dragEnabled: boolean;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      drag={dragEnabled}
      as="li"
      className={cn(
        "flex items-start gap-2 rounded-xl border px-2 py-2 transition-[border-color,background-color,opacity] duration-150 ease-[var(--ease-out-quint)]",
        locked
          ? "border-teal/35 bg-teal/[0.08]"
          : "border-black/[0.08] bg-paper dark:border-white/[0.12]",
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
      transition={{ type: "spring", bounce: 0.12, duration: 0.28 }}
    >
      <button
        type="button"
        aria-label={dragEnabled ? `Drag to reorder: ${item}` : undefined}
        disabled={!dragEnabled}
        onPointerDown={(event) => {
          if (!dragEnabled) return;
          controls.start(event);
        }}
        className={cn(
          "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/40 touch-none",
          dragEnabled
            ? "cursor-grab active:cursor-grabbing hover:bg-ink/[0.05] hover:text-ink/70"
            : "opacity-30",
        )}
      >
        <GripVertical className="size-4" strokeWidth={2} aria-hidden />
      </button>

      <span
        className={cn(
          "mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md font-body text-[11px] font-bold tabular-nums",
          locked ? "bg-teal text-paper" : "bg-ink/[0.06] text-ink/65",
        )}
      >
        {index + 1}
      </span>

      <span className="min-w-0 flex-1 py-1 font-body text-[13.5px] font-semibold leading-snug text-ink">
        {item}
      </span>

      {locked ? (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-1.5 mr-1 size-2 shrink-0 rounded-full bg-teal"
          aria-hidden
        />
      ) : null}
    </Reorder.Item>
  );
}
