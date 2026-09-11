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
import { Check } from "lucide-react";
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

/** LIC-tinted pocket accents — Matter/Crouton-style character without rainbow noise. */
const POCKET_TONES = [
  { fill: "rgba(27, 101, 96, 0.14)", ink: "rgb(27, 101, 96)" },
  { fill: "rgba(79, 143, 46, 0.16)", ink: "rgb(79, 143, 46)" },
  { fill: "rgba(217, 164, 65, 0.2)", ink: "rgb(184, 132, 40)" },
  { fill: "rgba(36, 26, 18, 0.08)", ink: "rgba(36, 26, 18, 0.55)" },
] as const;

/**
 * Group up — drag chips into character pockets (Crouton/Matter folder metaphor).
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
  const [selected, setSelected] = useState<string | null>(null);
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
    setSelected(null);
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
      setSelected(null);
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

  function onChipActivate(label: string) {
    if (done || locked.has(label) || !pool.includes(label) || swallow) return;
    setSelected((current) => (current === label ? null : label));
  }

  function onBucketActivate(bucketId: string) {
    if (!selected || swallow) return;
    const el = chipRefs.current.get(selected);
    const r = el?.getBoundingClientRect();
    commitDrop(
      selected,
      bucketId,
      r
        ? {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            width: r.width,
          }
        : undefined,
    );
  }

  function startDrag(label: string, event: ReactPointerEvent) {
    if (done || locked.has(label) || event.button !== 0 || swallow) return;
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
      <div className="grid gap-6">
        <div className="grid gap-3">
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

          <div className="flex min-h-[2.75rem] flex-wrap gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {pool.map((label) => {
                const isSelected = selected === label;
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
                      scale: isSelected ? 1.015 : 1,
                    }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.92, y: 8 }
                    }
                    transition={softSpring}
                    onPointerDown={(event) => startDrag(label, event)}
                    aria-pressed={isSelected}
                    className={cn(
                      "max-w-full touch-none select-none rounded-full px-3.5 py-2 text-left font-body text-[13px] font-medium leading-snug tracking-tight transition-[background-color,color,box-shadow] duration-150 ease-[var(--ease-out-quint)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                      isSelected
                        ? "bg-teal/[0.12] text-ink shadow-[inset_0_0_0_1px_rgb(var(--teal-rgb)_/_0.28)]"
                        : "bg-ink/[0.045] text-ink/90 hover:bg-ink/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]",
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
            "grid gap-3",
            activity.buckets.length > 2
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2",
          )}
        >
          {activity.buckets.map((bucket, index) => {
            const inBucket = activity.items
              .map((item) => item.label)
              .filter((label) => placement[label] === bucket.id);
            const isHot = hotBucket === bucket.id || swallow?.bucketId === bucket.id;
            const isShake = shakeBucket === bucket.id;
            const isTapTarget = Boolean(selected) && !swallow;
            const inviting = (isHot || isTapTarget) && !isShake;
            const tone = POCKET_TONES[index % POCKET_TONES.length]!;
            const isSwallowing = swallow?.bucketId === bucket.id;

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
                    ? { x: [0, -3, 3, -2, 2, 0] }
                    : inviting && !reduceMotion
                      ? { scale: 1.015, y: -1 }
                      : { scale: 1, x: 0, y: 0 }
                }
                transition={{ duration: 0.28, ease: appleEase }}
                className={cn(
                  "relative flex min-h-[10.5rem] flex-col overflow-hidden rounded-[1.25rem] px-3.5 pb-3 pt-3.5 transition-colors duration-200 ease-[var(--ease-out-quint)]",
                  inviting
                    ? "bg-teal/[0.07]"
                    : "bg-ink/[0.03] dark:bg-white/[0.035]",
                  isShake && "bg-rust/[0.08]",
                )}
              >
                <div className="mb-2.5 flex items-start gap-2.5">
                  <PocketMark
                    open={inviting || isSwallowing}
                    swallowing={isSwallowing}
                    tone={tone}
                    reduceMotion={Boolean(reduceMotion)}
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="m-0 font-body text-[14px] font-semibold leading-snug tracking-[-0.015em] text-ink">
                      {bucket.label}
                    </p>
                    {bucket.hint ? (
                      <p className="mt-0.5 font-body text-[11.5px] font-medium text-ink/45">
                        {bucket.hint}
                      </p>
                    ) : null}
                  </div>
                </div>

                <ul className="m-0 mt-auto flex list-none flex-col gap-1.5 p-0">
                  <AnimatePresence initial={false}>
                    {inBucket.map((label) => (
                      <motion.li
                        key={label}
                        layout={!reduceMotion}
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, y: -10, scale: 0.92 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={softSpring}
                        className="flex items-center gap-2 rounded-xl bg-paper/85 px-3 py-2 dark:bg-paper/40"
                      >
                        <span className="min-w-0 flex-1 font-body text-[12.5px] font-medium leading-snug tracking-tight text-ink/90">
                          {label}
                        </span>
                        <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-teal text-paper">
                          <Check
                            className="size-2"
                            strokeWidth={3}
                            aria-hidden
                          />
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {inBucket.length === 0 && !isSwallowing ? (
                    <li
                      className={cn(
                        "rounded-xl px-3 py-3 text-center font-body text-[12px] font-medium tracking-tight transition-colors duration-200",
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
                left: swallowTarget.left + swallowTarget.width * 0.22,
                top: swallowTarget.top + 52,
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

/** Folder-pocket mark — lid lifts when inviting / swallowing (Crouton pocket vibe). */
function PocketMark({
  open,
  swallowing,
  tone,
  reduceMotion,
}: {
  open: boolean;
  swallowing: boolean;
  tone: (typeof POCKET_TONES)[number];
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      className="relative size-12 shrink-0"
      animate={
        swallowing && !reduceMotion
          ? { scale: [1, 1.08, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.42, ease: appleEase }}
    >
      <svg viewBox="0 0 48 48" className="size-12 overflow-visible" aria-hidden>
        {/* Back panel */}
        <rect
          x="6"
          y="14"
          width="36"
          height="26"
          rx="7"
          fill={tone.fill}
        />
        {/* Lid — pivots open */}
        <motion.g
          style={{ transformOrigin: "10px 16px" }}
          animate={
            reduceMotion
              ? { rotate: 0 }
              : { rotate: open ? -28 : 0 }
          }
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        >
          <path
            d="M8 16h14c1.2 0 2.2-.6 2.8-1.5L27 10c.4-.6 1.1-1 1.9-1H38c2.2 0 4 1.8 4 4v3H8v-0z"
            fill={tone.ink}
            opacity={0.9}
          />
          <rect x="8" y="14" width="34" height="5" rx="2" fill={tone.ink} />
        </motion.g>
        {/* Front pocket flap */}
        <path
          d="M6 24c4 6 10 10 18 10s14-4 18-10v12c0 3.3-2.7 6-6 6H12c-3.3 0-6-2.7-6-6V24z"
          fill={tone.ink}
          opacity={0.22}
        />
        <rect
          x="6"
          y="22"
          width="36"
          height="18"
          rx="7"
          fill="none"
          stroke={tone.ink}
          strokeWidth="1.5"
          opacity={0.35}
        />
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
