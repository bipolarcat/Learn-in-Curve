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
import type { PairupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";

type PairupProps = {
  activity: PairupActivity;
};

type DragState = {
  match: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
};

const TAP_SLOP_PX = 10;
const appleEase = [0.22, 1, 0.36, 1] as const;
const softSpring = { type: "spring" as const, bounce: 0.08, duration: 0.38 };

/**
 * Pair up — drag a meaning onto a term’s line.
 * Visual: continuous Apple list + quiet wells (not boxed game chrome).
 */
export function Pairup({ activity }: PairupProps) {
  const reduceMotion = useReducedMotion();
  const answer = useMemo(() => {
    const map = new Map<string, string>();
    for (const pair of activity.pairs) map.set(pair.term, pair.match);
    return map;
  }, [activity]);

  const terms = useMemo(
    () => shuffleUntilDifferent(activity.pairs.map((pair) => pair.term)),
    [activity],
  );
  const [pool, setPool] = useState(() =>
    shuffleUntilDifferent(activity.pairs.map((pair) => pair.match)),
  );
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [wrongTurns, setWrongTurns] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hotTerm, setHotTerm] = useState<string | null>(null);
  const [shakeTerm, setShakeTerm] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const lineRefs = useRef<Map<string, HTMLElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);

  const filledCount = Object.keys(filled).length;
  const total = activity.pairs.length;
  const done = filledCount === total;
  const dragging = Boolean(
    drag &&
      Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= TAP_SLOP_PX,
  );

  const hitTerm = useCallback(
    (clientX: number, clientY: number) => {
      for (const term of terms) {
        if (filled[term]) continue;
        const el = lineRefs.current.get(term);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const pad = 4;
        if (
          clientX >= r.left - pad &&
          clientX <= r.right + pad &&
          clientY >= r.top - pad &&
          clientY <= r.bottom + pad
        ) {
          return term;
        }
      }
      return null;
    },
    [filled, terms],
  );

  function commitPair(term: string, match: string) {
    if (filled[term]) return;
    if (answer.get(term) === match) {
      setFilled((current) => ({ ...current, [term]: match }));
      setPool((current) => current.filter((item) => item !== match));
      setSelected(null);
      setHotTerm(null);
      setShakeTerm(null);
      return;
    }
    setWrongTurns((n) => n + 1);
    setShakeTerm(term);
    setHotTerm(null);
    window.setTimeout(() => setShakeTerm(null), 380);
  }

  function onChipActivate(match: string) {
    if (done) return;
    setSelected((current) => (current === match ? null : match));
  }

  function onLineActivate(term: string) {
    if (filled[term] || !selected) return;
    commitPair(term, selected);
  }

  function startDrag(match: string, event: ReactPointerEvent) {
    if (done || event.button !== 0) return;
    if (reduceMotion) {
      onChipActivate(match);
      return;
    }
    const el = chipRefs.current.get(match);
    if (!el) return;
    event.preventDefault();
    const r = el.getBoundingClientRect();
    const next: DragState = {
      match,
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
        setHotTerm(hitTerm(event.clientX, event.clientY));
      }
    }

    function onUp(event: PointerEvent) {
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      setHotTerm(null);
      if (!current) return;
      const moved = Math.hypot(
        event.clientX - current.startX,
        event.clientY - current.startY,
      );
      if (moved < TAP_SLOP_PX) {
        onChipActivate(current.match);
        return;
      }
      const term = hitTerm(event.clientX, event.clientY);
      if (term) commitPair(term, current.match);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, hitTerm]);

  return (
    <LayoutGroup>
      <div className="grid gap-5">
        {/* Continuous list — hairlines, not stacked cards */}
        <ul className="m-0 list-none overflow-hidden rounded-[1.15rem] bg-ink/[0.035] p-0 dark:bg-white/[0.04]">
          {terms.map((term, index) => {
            const match = filled[term];
            const isHot = hotTerm === term && !match;
            const isShake = shakeTerm === term;
            const isTapTarget = Boolean(selected) && !match;
            const isLast = index === terms.length - 1;

            return (
              <li key={term} className="relative">
                {!isLast ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-ink/[0.06] dark:bg-white/[0.08]"
                  />
                ) : null}
                <motion.div
                  ref={(node) => {
                    if (node) lineRefs.current.set(term, node);
                    else lineRefs.current.delete(term);
                  }}
                  role={isTapTarget ? "button" : undefined}
                  tabIndex={isTapTarget ? 0 : undefined}
                  onClick={() => onLineActivate(term)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onLineActivate(term);
                    }
                  }}
                  animate={
                    isShake && !reduceMotion
                      ? { x: [0, -4, 4, -2, 2, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.36, ease: appleEase }}
                  className={cn(
                    "grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] items-center gap-3 px-3.5 py-2.5 transition-colors duration-200 ease-[var(--ease-out-quint)]",
                    match && "bg-teal/[0.06]",
                    isHot && "bg-orange/[0.07]",
                    isTapTarget && !isHot && "bg-orange/[0.04]",
                    isShake && "bg-rust/[0.07]",
                  )}
                >
                  <span className="min-w-0 font-body text-[13.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                    {term}
                  </span>

                  <div
                    className={cn(
                      "relative flex min-h-[2.65rem] items-center rounded-[0.7rem] px-3 py-2 transition-[background-color,box-shadow] duration-200 ease-[var(--ease-out-quint)]",
                      match
                        ? "bg-paper/80 dark:bg-paper/40"
                        : isHot
                          ? "bg-paper shadow-[0_0_0_1.5px_rgb(var(--orange-rgb)_/_0.55)]"
                          : isTapTarget
                            ? "bg-paper/90 shadow-[inset_0_0_0_1px_rgb(var(--orange-rgb)_/_0.35)]"
                            : "bg-paper/55 shadow-[inset_0_0_0_1px_rgb(var(--ink-rgb)_/_0.06)] dark:bg-paper/25",
                    )}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {match ? (
                        <motion.div
                          key={match}
                          initial={
                            reduceMotion
                              ? { opacity: 1 }
                              : { opacity: 0, y: 4 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={softSpring}
                          className="flex w-full items-center gap-2"
                        >
                          <span className="min-w-0 flex-1 font-body text-[13px] font-medium leading-snug tracking-tight text-ink/90">
                            {match}
                          </span>
                          <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-teal text-paper">
                            <Check
                              className="size-2.5"
                              strokeWidth={3}
                              aria-hidden
                            />
                          </span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="empty"
                          initial={false}
                          animate={{ opacity: isHot ? 1 : 0.45 }}
                          className="font-body text-[12.5px] font-medium tracking-tight text-ink/40"
                        >
                          {isHot ? "Release" : "\u00a0"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ul>

        <div className="grid gap-2.5">
          <div className="flex items-center justify-between gap-3 px-0.5">
            <span className="font-body text-[12px] font-medium tracking-tight text-ink/40">
              {pool.length === 0 ? "All paired" : "Meanings"}
            </span>
            <ProgressDots current={filledCount} total={total} done={done} />
          </div>

          <div className="flex min-h-[2.75rem] flex-wrap gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {pool.map((match) => {
                const isSelected = selected === match;
                const isDragging = drag?.match === match && dragging;
                return (
                  <motion.button
                    key={match}
                    ref={(node) => {
                      if (node) chipRefs.current.set(match, node);
                      else chipRefs.current.delete(match);
                    }}
                    type="button"
                    layout={!reduceMotion}
                    initial={
                      reduceMotion ? false : { opacity: 0, scale: 0.96 }
                    }
                    animate={{
                      opacity: isDragging ? 0.25 : 1,
                      scale: isSelected ? 1.02 : 1,
                    }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.94 }
                    }
                    transition={softSpring}
                    onPointerDown={(event) => startDrag(match, event)}
                    aria-pressed={isSelected}
                    className={cn(
                      "max-w-full touch-none select-none rounded-full border px-3.5 py-2 text-left font-body text-[13px] font-medium leading-snug tracking-tight transition-[border-color,background-color,box-shadow,color] duration-150 ease-[var(--ease-out-quint)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/45",
                      isSelected
                        ? "border-orange/40 bg-orange/[0.09] text-ink shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04)]"
                        : "border-black/[0.06] bg-paper text-ink/90 hover:border-ink/15 hover:bg-paper dark:border-white/[0.1]",
                    )}
                  >
                    {match}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Dots already show progress — status only when done or after a miss */}
        {done || wrongTurns > 0 ? (
          <p
            className={cn(
              "m-0 font-body text-[12px] font-medium tracking-tight",
              done ? "text-teal" : "text-ink/45",
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
            {filledCount} of {total} paired
          </span>
        )}

        {dragging && drag ? (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed z-[120] max-w-[min(18rem,72vw)] rounded-full border border-black/[0.06] bg-paper px-3.5 py-2 font-body text-[13px] font-medium leading-snug tracking-tight text-ink shadow-[0_8px_30px_rgb(var(--ink-rgb)_/_0.16),0_2px_6px_rgb(var(--ink-rgb)_/_0.06)] dark:border-white/[0.1]"
            style={{
              left: drag.x,
              top: drag.y,
              width: Math.max(drag.width, 72),
              x: "-50%",
              y: "-50%",
            }}
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 1.04, opacity: 1 }}
            transition={{ duration: 0.16, ease: appleEase }}
          >
            {drag.match}
          </motion.div>
        ) : null}
      </div>
    </LayoutGroup>
  );
}

function ProgressDots({
  current,
  total,
  done,
}: {
  current: number;
  total: number;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const on = i < current;
        return (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full transition-colors duration-200 ease-[var(--ease-out-quint)]",
              on ? (done ? "bg-teal" : "bg-ink/55") : "bg-ink/15",
            )}
          />
        );
      })}
    </div>
  );
}
