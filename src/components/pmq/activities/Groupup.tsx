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
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { GroupupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";

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

type SwallowState = {
  label: string;
  bucketId: string;
  fromX: number;
  fromY: number;
  width: number;
};

const TAP_SLOP_PX = 10;
const appleEase = [0.22, 1, 0.36, 1] as const;
const softSpring = { type: "spring" as const, bounce: 0.08, duration: 0.36 };

/** Pocket accent ink — teal / olive / gold / ink (no light wash fills). */
const POCKET_TONES = [
  { ink: "rgb(27, 101, 96)" },
  { ink: "rgb(79, 143, 46)" },
  { ink: "rgb(184, 132, 40)" },
  { ink: "rgba(36, 26, 18, 0.55)" },
] as const;

/**
 * Group up — drag chips into trays. Pointer drag only (no tap-to-select).
 * Correct drops swallow into the pocket; invite is teal wash, never orange outline.
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
  const [hotBucket, setHotBucket] = useState<string | null>(null);
  const [shakeBucket, setShakeBucket] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [swallow, setSwallow] = useState<SwallowState | null>(null);

  const bucketRefs = useRef<Map<string, HTMLElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);

  const done =
    locked.size === activity.items.length && activity.items.length > 0;
  const dragging = Boolean(
    drag &&
      Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= TAP_SLOP_PX,
  );

  const hitBucket = useCallback(
    (clientX: number, clientY: number) => {
      for (const bucket of activity.buckets) {
        const el = bucketRefs.current.get(bucket.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const pad = 6;
        if (
          clientX >= r.left - pad &&
          clientX <= r.right + pad &&
          clientY >= r.top - pad &&
          clientY <= r.bottom + pad
        ) {
          return bucket.id;
        }
      }
      return null;
    },
    [activity.buckets],
  );

  function finishCorrect(label: string, bucketId: string) {
    setPlacement((current) => ({ ...current, [label]: bucketId }));
    setLocked((current) => new Set(current).add(label));
    setPool((current) => current.filter((item) => item !== label));
    setHotBucket(null);
    setShakeBucket(null);
    setSwallow(null);
  }

  function commitDrop(
    label: string,
    bucketId: string,
    from?: { x: number; y: number; width: number },
  ) {
    if (locked.has(label) || swallow) return;
    if (answer.get(label) === bucketId) {
      if (reduceMotion || !from) {
        finishCorrect(label, bucketId);
        return;
      }
      setPool((current) => current.filter((item) => item !== label));
      setHotBucket(bucketId);
      setSwallow({
        label,
        bucketId,
        fromX: from.x,
        fromY: from.y,
        width: from.width,
      });
      return;
    }
    setWrongTurns((n) => n + 1);
    setShakeBucket(bucketId);
    setHotBucket(null);
    window.setTimeout(() => setShakeBucket(null), 360);
  }

  function startDrag(label: string, event: ReactPointerEvent) {
    if (done || locked.has(label) || event.button !== 0 || swallow) return;
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
      if (moved < TAP_SLOP_PX) return;
      const bucketId = hitBucket(event.clientX, event.clientY);
      if (bucketId) {
        commitDrop(current.label, bucketId, {
          x: event.clientX,
          y: event.clientY,
          width: current.width,
        });
      }
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

  const swallowTarget = swallow
    ? bucketRefs.current.get(swallow.bucketId)?.getBoundingClientRect()
    : null;

  return (
    <LayoutGroup>
      <div className="grid gap-4 [-webkit-text-size-adjust:100%] [text-size-adjust:100%]">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 px-0.5">
            <span className="font-body text-[12px] font-medium tracking-tight text-ink/40">
              {pool.length === 0 ? "All sorted" : "Cards"}
            </span>
            <ProgressTrack
              current={locked.size}
              total={activity.items.length}
              done={done}
            />
          </div>

          <div className="flex min-h-[2.25rem] flex-wrap gap-1.5">
            <AnimatePresence initial={false} mode="popLayout">
              {pool.map((label) => {
                const isDragging = drag?.label === label && dragging;
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
                      reduceMotion ? false : { opacity: 0, scale: 0.97 }
                    }
                    animate={{
                      opacity: isDragging ? 0.2 : 1,
                      scale: 1,
                    }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.92, y: 8 }
                    }
                    transition={softSpring}
                    onPointerDown={(event) => startDrag(label, event)}
                    className={cn(
                      "max-w-full touch-none select-none rounded-full bg-ink/[0.045] px-3 py-1.5 text-left font-body text-[12.5px] font-medium leading-snug tracking-tight text-ink/90 transition-[background-color,color,box-shadow] duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                      "cursor-grab active:cursor-grabbing",
                    )}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-2.5",
            activity.buckets.length === 3
              ? "grid-cols-3"
              : activity.buckets.length >= 4
                ? "grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {activity.buckets.map((bucket, index) => {
            const inBucket = activity.items
              .map((item) => item.label)
              .filter((label) => placement[label] === bucket.id);
            const isHot = hotBucket === bucket.id || swallow?.bucketId === bucket.id;
            const isShake = shakeBucket === bucket.id;
            const inviting = isHot && !isShake;
            const tone = POCKET_TONES[index % POCKET_TONES.length]!;
            const isSwallowing = swallow?.bucketId === bucket.id;
            const dense = activity.buckets.length >= 3;

            return (
              <motion.div
                key={bucket.id}
                ref={(node) => {
                  if (node) bucketRefs.current.set(bucket.id, node);
                  else bucketRefs.current.delete(bucket.id);
                }}
                animate={
                  isShake && !reduceMotion
                    ? { x: [0, -3, 3, -2, 2, 0] }
                    : inviting && !reduceMotion
                      ? { scale: 1.015, y: -1 }
                      : { scale: 1, x: 0, y: 0 }
                }
                transition={{ duration: 0.28, ease: appleEase }}
                className={cn(
                  "relative flex flex-col justify-start overflow-hidden rounded-[1.15rem] transition-colors duration-200 ease-[var(--ease-out-quint)]",
                  dense ? "gap-1.5 p-2" : "min-h-[9rem] gap-2 px-3.5 pb-3 pt-3.5",
                  inviting
                    ? "bg-teal/[0.07]"
                    : "bg-ink/[0.03] dark:bg-white/[0.035]",
                  isShake && "bg-rust/[0.08]",
                )}
              >
                <div className="flex shrink-0 items-start gap-1.5">
                  <PocketMark
                    open={inviting || isSwallowing}
                    swallowing={isSwallowing}
                    tone={tone}
                    reduceMotion={Boolean(reduceMotion)}
                    size={dense ? "sm" : "md"}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "m-0 font-body font-semibold leading-tight tracking-[-0.015em] text-ink",
                        dense ? "text-[11px] sm:text-[12px]" : "text-[14px]",
                      )}
                    >
                      {bucket.label}
                    </p>
                    {bucket.hint ? (
                      <p
                        className={cn(
                          "mt-0.5 font-body font-medium leading-tight text-ink/45",
                          dense ? "text-[9px] sm:text-[10px]" : "text-[12px]",
                        )}
                      >
                        {bucket.hint}
                      </p>
                    ) : null}
                  </div>
                </div>

                <ul className="m-0 flex w-full list-none flex-col justify-start gap-1 p-0">
                  {inBucket.map((label) => (
                    <li
                      key={label}
                      className={cn(
                        "w-full min-w-0 rounded-sm bg-paper/85 font-body font-medium text-ink/90 dark:bg-paper/40",
                        dense ? "px-1.5 py-1" : "px-2.5 py-1.5",
                      )}
                      style={{
                        fontSize: dense ? 10 : 12,
                        lineHeight: 1.2,
                      }}
                    >
                      {/*
                        Empty float spacer only (no flex/SVG children — those
                        inflate the float on iOS and block wrap-under). Tick is
                        painted via background so the exclusion box stays 14×14.
                      */}
                      <span
                        aria-hidden
                        style={{
                          float: "right",
                          width: 14,
                          height: 14,
                          marginLeft: 3,
                          borderRadius: "50%",
                          backgroundColor: "rgb(27, 101, 96)",
                          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23FBF3E1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
                          )}")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          backgroundSize: "9px 9px",
                        }}
                      />
                      {label}
                    </li>
                  ))}
                  {inBucket.length === 0 && !isSwallowing ? (
                    <li
                      className={cn(
                        "rounded-sm text-left font-body font-medium tracking-tight transition-colors duration-200",
                        dense
                          ? "py-0.5 text-[10px]"
                          : "px-3 py-3 text-[12px]",
                        inviting ? "text-teal/70" : "text-ink/30",
                      )}
                    >
                      {inviting ? "Drop here" : "Empty"}
                    </li>
                  ) : null}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {done || wrongTurns > 0 ? (
          <p
            className={cn(
              "m-0 font-body text-[12px] font-medium tracking-tight",
              done ? "text-teal" : "text-ink/40",
            )}
            role="status"
            aria-live="polite"
          >
            {done
              ? wrongTurns === 0
                ? "Perfect"
                : `Done · ${wrongTurns} miss${wrongTurns === 1 ? "" : "es"}`
              : `${wrongTurns} miss${wrongTurns === 1 ? "" : "es"}`}
          </p>
        ) : (
          <span className="sr-only" role="status" aria-live="polite">
            {locked.size} of {activity.items.length} sorted
          </span>
        )}

        {dragging && drag ? (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed z-[120] max-w-[min(18rem,72vw)] rounded-full bg-paper px-3.5 py-2 font-body text-[13px] font-medium leading-snug tracking-tight text-ink shadow-[0_10px_40px_rgb(var(--ink-rgb)_/_0.18),0_2px_8px_rgb(var(--ink-rgb)_/_0.06)] ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
            style={{
              left: drag.x,
              top: drag.y,
              width: Math.max(drag.width, 72),
              x: "-50%",
              y: "-50%",
            }}
            initial={{ scale: 1, opacity: 0.92 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 0.14, ease: appleEase }}
          >
            {drag.label}
          </motion.div>
        ) : null}

        <AnimatePresence>
          {swallow && swallowTarget ? (
            <motion.div
              key={`swallow-${swallow.label}`}
              aria-hidden
              className="pointer-events-none fixed z-[130] max-w-[min(16rem,70vw)] rounded-full bg-paper px-3.5 py-2 font-body text-[13px] font-medium leading-snug tracking-tight text-ink shadow-[0_12px_36px_rgb(var(--ink-rgb)_/_0.2)] ring-1 ring-black/[0.04]"
              initial={{
                left: swallow.fromX,
                top: swallow.fromY,
                x: "-50%",
                y: "-50%",
                scale: 1,
                opacity: 1,
              }}
              animate={{
                left: swallowTarget.left + swallowTarget.width / 2,
                top: swallowTarget.top + Math.min(40, swallowTarget.height * 0.35),
                x: "-50%",
                y: "-50%",
                scale: 0.22,
                opacity: 0,
                rotate: -8,
              }}
              transition={{
                duration: 0.42,
                ease: appleEase,
              }}
              onAnimationComplete={() => {
                finishCorrect(swallow.label, swallow.bucketId);
              }}
            >
              {swallow.label}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

/** Folder-pocket mark — lid + outline body; lid lifts on invite / swallow. */
function PocketMark({
  open,
  swallowing,
  tone,
  reduceMotion,
  size = "md",
}: {
  open: boolean;
  swallowing: boolean;
  tone: (typeof POCKET_TONES)[number];
  reduceMotion: boolean;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "size-9" : "size-12";
  return (
    <motion.div
      className={cn("relative shrink-0", box)}
      animate={
        swallowing && !reduceMotion
          ? { scale: [1, 1.08, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.42, ease: appleEase }}
    >
      <svg viewBox="0 0 48 48" className={cn(box, "overflow-visible")} aria-hidden>
        {/* Body — outline only */}
        <rect
          x="6"
          y="20"
          width="36"
          height="20"
          rx="7"
          fill="none"
          stroke={tone.ink}
          strokeWidth="1.75"
        />
        {/* Cap / lid — pivots open; sits above body with a clear gap */}
        <motion.g
          style={{ transformOrigin: "10px 14px" }}
          animate={
            reduceMotion
              ? { rotate: 0 }
              : { rotate: open ? -28 : 0 }
          }
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        >
          <path
            d="M8 14h14c1.2 0 2.2-.6 2.8-1.5L27 8c.4-.6 1.1-1 1.9-1H38c2.2 0 4 1.8 4 4v3H8z"
            fill={tone.ink}
          />
          <rect x="8" y="12" width="34" height="5" rx="2" fill={tone.ink} />
        </motion.g>
      </svg>
    </motion.div>
  );
}

function ProgressTrack({
  current,
  total,
  done,
}: {
  current: number;
  total: number;
  done: boolean;
}) {
  const pct = total === 0 ? 0 : (current / total) * 100;
  return (
    <div
      className="h-1 w-14 overflow-hidden rounded-full bg-ink/[0.08]"
      aria-hidden
    >
      <motion.div
        className={cn("h-full rounded-full", done ? "bg-teal" : "bg-ink/45")}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.28, ease: appleEase }}
      />
    </div>
  );
}
