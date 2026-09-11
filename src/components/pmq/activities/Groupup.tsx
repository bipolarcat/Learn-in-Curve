"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { GroupupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";
import {
  ActivityPlayHint,
  ActivityPlayStatus,
  activityChipClass,
} from "@/components/pmq/activities/ActivityPlayChrome";

type GroupupProps = {
  activity: GroupupActivity;
};

type DragState = {
  label: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
};

const TAP_SLOP_PX = 10;

/**
 * Group up — drag chips into labeled trays (Apple Files / folders).
 * Correct drops lock; wrong drops bounce home. Short press = select.
 */
export function Groupup({ activity }: GroupupProps) {
  const reduceMotion = useReducedMotion();
  const answer = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of activity.items) map.set(item.label, item.bucket);
    return map;
  }, [activity]);

  const [pool, setPool] = useState(() =>
    shuffleUntilDifferent(activity.items.map((item) => item.label)),
  );
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [wrongTurns, setWrongTurns] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hotBucket, setHotBucket] = useState<string | null>(null);
  const [shakeBucket, setShakeBucket] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const bucketRefs = useRef<Map<string, HTMLElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);

  const done =
    locked.size === activity.items.length && activity.items.length > 0;

  const hitBucket = useCallback(
    (clientX: number, clientY: number) => {
      for (const bucket of activity.buckets) {
        const el = bucketRefs.current.get(bucket.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
        ) {
          return bucket.id;
        }
      }
      return null;
    },
    [activity.buckets],
  );

  function commitDrop(label: string, bucketId: string) {
    if (locked.has(label)) return;
    if (answer.get(label) === bucketId) {
      setPlacement((current) => ({ ...current, [label]: bucketId }));
      setLocked((current) => new Set(current).add(label));
      setPool((current) => current.filter((item) => item !== label));
      setSelected(null);
      setHotBucket(null);
      setShakeBucket(null);
      return;
    }
    setWrongTurns((n) => n + 1);
    setShakeBucket(bucketId);
    setHotBucket(null);
    window.setTimeout(() => setShakeBucket(null), 420);
  }

  function onChipActivate(label: string) {
    if (done || locked.has(label) || !pool.includes(label)) return;
    setSelected((current) => (current === label ? null : label));
  }

  function onBucketActivate(bucketId: string) {
    if (!selected) return;
    commitDrop(selected, bucketId);
  }

  function startDrag(label: string, event: ReactPointerEvent) {
    if (done || locked.has(label) || event.button !== 0) return;
    if (reduceMotion) {
      onChipActivate(label);
      return;
    }
    if (!pool.includes(label)) return;
    const el = chipRefs.current.get(label);
    if (!el) return;
    event.preventDefault();
    const r = el.getBoundingClientRect();
    const next: DragState = {
      label,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      width: r.width,
      height: r.height,
    };
    dragRef.current = next;
    setDrag(next);
  }

  useEffect(() => {
    if (!drag) return;

    function onMove(event: PointerEvent) {
      const current = dragRef.current;
      if (!current) return;
      const next = { ...current, x: event.clientX, y: event.clientY };
      dragRef.current = next;
      setDrag(next);
      const moved = Math.hypot(
        event.clientX - current.startX,
        event.clientY - current.startY,
      );
      if (moved >= TAP_SLOP_PX) {
        setHotBucket(hitBucket(event.clientX, event.clientY));
      }
    }

    function onUp(event: PointerEvent) {
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      setHotBucket(null);
      if (!current) return;
      const moved = Math.hypot(
        event.clientX - current.startX,
        event.clientY - current.startY,
      );
      if (moved < TAP_SLOP_PX) {
        onChipActivate(current.label);
        return;
      }
      const bucketId = hitBucket(event.clientX, event.clientY);
      if (bucketId) commitDrop(current.label, bucketId);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, hitBucket]);

  return (
    <div className="grid gap-4">
      <ActivityPlayHint>
        {reduceMotion
          ? "Select a card, then tap the tray it belongs in."
          : "Drag each card into its tray. Wrong trays bounce it back."}
      </ActivityPlayHint>

      <div className="rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] p-2.5 dark:border-white/20">
        <p className="mb-2 px-0.5 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-ink/40">
          Cards
        </p>
        <div className="flex min-h-[2.75rem] flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {pool.map((label) => {
              const isSelected = selected === label;
              const isDragging = drag?.label === label;
              return (
                <motion.button
                  key={label}
                  ref={(node) => {
                    if (node) chipRefs.current.set(label, node);
                    else chipRefs.current.delete(label);
                  }}
                  type="button"
                  layout={!reduceMotion}
                  initial={
                    reduceMotion ? false : { opacity: 0, scale: 0.94 }
                  }
                  animate={{
                    opacity: isDragging ? 0.35 : 1,
                    scale: 1,
                  }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.9 }
                  }
                  transition={{
                    type: "spring",
                    bounce: 0.12,
                    duration: 0.3,
                  }}
                  onPointerDown={(event) => startDrag(label, event)}
                  aria-pressed={isSelected}
                  className={cn(
                    activityChipClass,
                    "max-w-full touch-none select-none",
                    isSelected &&
                      "border-orange bg-orange/10 ring-2 ring-orange/30",
                    "hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
                  )}
                >
                  {label}
                </motion.button>
              );
            })}
          </AnimatePresence>
          {pool.length === 0 ? (
            <p className="m-0 px-1 py-2 font-body text-[12px] text-ink/45">
              All sorted
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {activity.buckets.map((bucket) => {
          const inBucket = activity.items
            .map((item) => item.label)
            .filter((label) => placement[label] === bucket.id);
          const isHot = hotBucket === bucket.id;
          const isShake = shakeBucket === bucket.id;
          const isTapTarget = Boolean(selected);

          return (
            <motion.div
              key={bucket.id}
              ref={(node) => {
                if (node) bucketRefs.current.set(bucket.id, node);
                else bucketRefs.current.delete(bucket.id);
              }}
              role={isTapTarget ? "button" : undefined}
              tabIndex={isTapTarget ? 0 : undefined}
              onClick={() => onBucketActivate(bucket.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onBucketActivate(bucket.id);
                }
              }}
              animate={
                isShake && !reduceMotion
                  ? { x: [0, -5, 5, -3, 3, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.42, ease: "easeOut" }}
              className={cn(
                "min-h-[7.5rem] rounded-2xl border p-3 transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out-quint)]",
                isHot
                  ? "border-orange bg-orange/[0.08] shadow-[0_0_0_3px_rgb(var(--orange-rgb)_/_0.18)]"
                  : isTapTarget
                    ? "border-orange/45 bg-orange/[0.04]"
                    : "border-black/[0.08] bg-paper dark:border-white/[0.12]",
                isShake && "border-rust bg-rust/[0.08]",
              )}
            >
              <div className="mb-2.5">
                <p className="m-0 font-body text-[13px] font-bold tracking-tight text-ink">
                  {bucket.label}
                </p>
                {bucket.hint ? (
                  <p className="mt-0.5 font-body text-[11px] text-ink/50">
                    {bucket.hint}
                  </p>
                ) : null}
              </div>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                <AnimatePresence initial={false}>
                  {inBucket.map((label) => (
                    <motion.li
                      key={label}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 6, scale: 0.96 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.32,
                      }}
                      className="rounded-lg border border-teal/30 bg-teal/10 px-2.5 py-1.5 font-body text-[12.5px] font-semibold leading-snug text-ink"
                    >
                      {label}
                    </motion.li>
                  ))}
                </AnimatePresence>
                {inBucket.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-ink/15 px-2.5 py-3 text-center font-body text-[12px] text-ink/35">
                    {isHot ? "Release to drop" : "Drop cards here"}
                  </li>
                ) : null}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <ActivityPlayStatus
        done={done}
        doneLabel="Sorted"
        wrongTurns={wrongTurns}
        current={locked.size}
        total={activity.items.length}
      />

      {drag &&
      Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= TAP_SLOP_PX ? (
        <motion.div
          aria-hidden
          className={cn(
            activityChipClass,
            "pointer-events-none fixed z-[120] max-w-[min(18rem,70vw)] border-orange bg-paper shadow-[0_8px_28px_rgb(var(--ink-rgb)_/_0.18)] ring-2 ring-orange/35",
          )}
          style={{
            left: drag.x,
            top: drag.y,
            width: drag.width,
            x: "-50%",
            y: "-50%",
          }}
          initial={false}
        >
          {drag.label}
        </motion.div>
      ) : null}
    </div>
  );
}
