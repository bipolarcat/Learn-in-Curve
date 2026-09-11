"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Reorder,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import { GripVertical } from "lucide-react";
import type { LineupActivity } from "@/types/pmq";
import { ActivityCorrectMark } from "@/components/pmq/activities/ActivityCorrectMark";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";
import { ActivityPlayStatus } from "@/components/pmq/activities/ActivityPlayChrome";

type LineupProps = {
  activity: LineupActivity;
};

/**
 * Keep locked items on their correct seats. Unlocked items fill the
 * remaining seats in the order Framer (or a tap-swap) proposed.
 */
function orderWithLockedSeats(
  proposed: string[],
  locked: Set<string>,
  correct: string[],
): string[] {
  if (locked.size === 0) return proposed;
  const unlockedQueue = proposed.filter((item) => !locked.has(item));
  let u = 0;
  return correct.map((item) => {
    if (locked.has(item)) return item;
    const next = unlockedQueue[u++];
    return next ?? item;
  });
}

function seatsCorrectInOrder(
  order: string[],
  locked: Set<string>,
  correct: string[],
): Set<string> {
  const next = new Set(locked);
  order.forEach((item, index) => {
    if (next.has(item)) return;
    if (item === correct[index]) next.add(item);
  });
  return next;
}

/**
 * Lineup — drag rows into the correct order (Apple Reminders reorder).
 * Locked seats stay put; new locks only settle after a finished move
 * (drag end / swap / Check), never mid-drag.
 */
export function Lineup({ activity }: LineupProps) {
  const correct = activity.items;
  const reduceMotion = useReducedMotion();
  const [order, setOrder] = useState(() => shuffleUntilDifferent(correct));
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [wrongTurns, setWrongTurns] = useState(0);
  const [justChecked, setJustChecked] = useState(false);
  const [shakeKeys, setShakeKeys] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const lockedRef = useRef(locked);
  const draggingRef = useRef(false);

  lockedRef.current = locked;

  const done = locked.size === correct.length && correct.length > 0;

  const commitLocks = useCallback(
    (nextOrder: string[]) => {
      setLocked((prev) => seatsCorrectInOrder(nextOrder, prev, correct));
      setJustChecked(false);
      setShakeKeys(new Set());
      setSelected(null);
    },
    [correct],
  );

  const onReorder = useCallback(
    (proposed: string[]) => {
      // Order only while dragging — never lock here (locking mid-drag
      // flips drag={false} on the active item and fights Reorder).
      setOrder(orderWithLockedSeats(proposed, lockedRef.current, correct));
      setJustChecked(false);
      setShakeKeys(new Set());
    },
    [correct],
  );

  const onDragStart = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const onDragEnd = useCallback(() => {
    draggingRef.current = false;
    setOrder((current) => {
      const pinned = orderWithLockedSeats(
        current,
        lockedRef.current,
        correct,
      );
      // Let Reorder finish its layout pass before locking (lock flips
      // drag={false}; doing it in the same tick as drop is glitchy).
      queueMicrotask(() => commitLocks(pinned));
      return pinned;
    });
  }, [commitLocks, correct]);

  function onCheck() {
    if (draggingRef.current) return;
    const newly = seatsCorrectInOrder(order, locked, correct);
    const wrong = new Set<string>();
    order.forEach((item, index) => {
      if (newly.has(item)) return;
      if (item !== correct[index]) wrong.add(item);
    });
    setLocked(newly);
    setSelected(null);
    if (wrong.size > 0) {
      setWrongTurns((n) => n + 1);
      setJustChecked(true);
      setShakeKeys(wrong);
      window.setTimeout(() => setShakeKeys(new Set()), 420);
    } else {
      setJustChecked(false);
      setShakeKeys(new Set());
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
    if (locked.has(order[selected]!)) {
      setSelected(index);
      return;
    }
    const next = [...order];
    const a = next[selected]!;
    next[selected] = next[index]!;
    next[index] = a;
    const pinned = orderWithLockedSeats(next, locked, correct);
    setOrder(pinned);
    commitLocks(pinned);
  }

  const progressHint = useMemo(() => {
    if (done) return null;
    return justChecked ? "Keep moving — some seats are still wrong" : null;
  }, [done, justChecked]);

  return (
    <div className="grid gap-4">
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
                        ? "border-teal/45 bg-teal/[0.06]"
                        : "border-black/[0.08] bg-paper dark:border-white/[0.12]",
                    shakeKeys.has(item) &&
                      "animate-[activity-shake_0.4s_ease-in-out]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md font-body text-[11px] font-bold tabular-nums",
                      isLocked
                        ? "bg-teal text-paper"
                        : "bg-ink/[0.06] text-ink/65",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 font-body text-[13.5px] font-semibold leading-snug text-ink">
                    {item}
                  </span>
                  {isLocked ? <ActivityCorrectMark className="mt-0.5" /> : null}
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={onReorder}
          className="m-0 flex list-none flex-col gap-2 p-0"
          as="ol"
        >
          {order.map((item, index) => (
            <LineupRow
              key={item}
              item={item}
              index={index}
              locked={locked.has(item)}
              shaking={shakeKeys.has(item)}
              dragEnabled={!locked.has(item) && !done}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
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
  shaking,
  dragEnabled,
  onDragStart,
  onDragEnd,
}: {
  item: string;
  index: number;
  locked: boolean;
  shaking: boolean;
  dragEnabled: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      drag={dragEnabled}
      as="li"
      layout={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-start gap-2 rounded-xl border px-2 py-2 transition-[border-color,background-color,opacity] duration-150 ease-[var(--ease-out-quint)]",
        locked
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
      transition={{ type: "spring", bounce: 0.12, duration: 0.28 }}
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
          "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/40 touch-none select-none",
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

      {locked ? <ActivityCorrectMark className="mt-1.5 mr-1" /> : null}
    </Reorder.Item>
  );
}
