"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { PairupActivity } from "@/types/pmq";
import { ActivityCorrectMark } from "@/components/pmq/activities/ActivityCorrectMark";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";

type PairupProps = {
  activity: PairupActivity;
  wrongTurns?: number;
  onWrongTurn?: (detail: {
    item: string | null;
    chosen: string | null;
    expected: string | null;
    detail?: Record<string, unknown> | null;
  }) => void;
  onComplete?: (moves: number) => void;
  /** Lab/home demo — denser 2-col desktop layout; LO path leaves this off. */
  compact?: boolean;
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
const softSpring = { type: "spring" as const, bounce: 0.06, duration: 0.34 };

/**
 * Pair up — drag a meaning onto a term’s line.
 * Highlight language is teal/ink lift only — never orange outlines
 * (orange reads as error next to rust).
 */
export function Pairup({
  activity,
  wrongTurns = 0,
  onWrongTurn,
  onComplete,
  compact = false,
}: PairupProps) {
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
  const [selected, setSelected] = useState<string | null>(null);
  const [hotTerm, setHotTerm] = useState<string | null>(null);
  const [shakeTerm, setShakeTerm] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const lineRefs = useRef<Map<string, HTMLElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);
  const movesRef = useRef(0);
  const completedSentRef = useRef(false);

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
        const pad = 6;
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
    movesRef.current += 1;
    if (answer.get(term) === match) {
      setFilled((current) => ({ ...current, [term]: match }));
      setPool((current) => current.filter((item) => item !== match));
      setSelected(null);
      setHotTerm(null);
      setShakeTerm(null);
      return;
    }
    onWrongTurn?.({
      item: term,
      chosen: match,
      expected: answer.get(term) ?? null,
    });
    setShakeTerm(term);
    setHotTerm(null);
    window.setTimeout(() => setShakeTerm(null), 360);
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

  useEffect(() => {
    if (!done || completedSentRef.current) return;
    completedSentRef.current = true;
    onComplete?.(movesRef.current);
  }, [done, onComplete]);

  return (
    <LayoutGroup>
      <div
        className={cn(
          "grid",
          compact
            ? "gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(12rem,1fr)] md:items-start md:gap-4"
            : "gap-6",
        )}
      >
        <ul
          className={cn(
            "m-0 list-none p-0",
            compact
              ? "grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2"
              : "flex flex-col gap-1.5",
          )}
        >
          {terms.map((term) => {
            const match = filled[term];
            const isHot = hotTerm === term && !match;
            const isShake = shakeTerm === term;
            const isTapTarget = Boolean(selected) && !match;
            const inviting = isHot || isTapTarget;

            return (
              <li key={term}>
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
                      ? { x: [0, -3, 3, -2, 2, 0] }
                      : inviting && !reduceMotion
                        ? { scale: 1.01 }
                        : { scale: 1, x: 0 }
                  }
                  transition={{ duration: 0.28, ease: appleEase }}
                  className={cn(
                    "grid items-center rounded-2xl transition-[background-color] duration-200 ease-[var(--ease-out-quint)]",
                    compact
                      ? "grid-cols-1 gap-1.5 px-3 py-2"
                      : "grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3 px-3.5 py-3",
                    match
                      ? "bg-teal/[0.08]"
                      : inviting
                        ? "bg-teal/[0.06]"
                        : "bg-ink/[0.03] dark:bg-white/[0.035]",
                    isShake && "bg-rust/[0.08]",
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 font-body font-semibold leading-snug tracking-[-0.015em] text-ink",
                      compact ? "text-[13px]" : "text-[14px]",
                    )}
                  >
                    {term}
                  </span>

                  <motion.div
                    animate={
                      inviting && !match && !reduceMotion
                        ? { backgroundColor: "rgb(var(--teal-rgb) / 0.1)" }
                        : {}
                    }
                    transition={{ duration: 0.2, ease: appleEase }}
                    className={cn(
                      "relative flex items-center rounded-xl px-3.5 py-2 transition-colors duration-200 ease-[var(--ease-out-quint)]",
                      compact ? "min-h-[2.25rem]" : "min-h-[2.75rem]",
                      match
                        ? "bg-paper/90 dark:bg-paper/50"
                        : inviting
                          ? "bg-paper/95 dark:bg-paper/45"
                          : "bg-paper/70 dark:bg-paper/30",
                    )}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {match ? (
                        <motion.div
                          key={match}
                          initial={
                            reduceMotion
                              ? { opacity: 1 }
                              : { opacity: 0, y: 3 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={softSpring}
                          className="flex w-full items-center gap-2.5"
                        >
                          <span className="min-w-0 flex-1 font-body text-[13.5px] font-medium leading-snug tracking-tight text-ink/90">
                            {match}
                          </span>
                          <ActivityCorrectMark />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="empty"
                          aria-hidden
                          className="block h-2 w-8 rounded-full bg-ink/[0.08]"
                          animate={{
                            opacity: inviting ? 0.35 : 0.2,
                            scaleX: inviting ? 1.15 : 1,
                          }}
                          transition={{ duration: 0.2, ease: appleEase }}
                          style={{ transformOrigin: "left center" }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </li>
            );
          })}
        </ul>

        <div className={cn("grid", compact ? "gap-2" : "gap-3")}>
          <div className="flex items-center justify-between gap-3 px-0.5">
            <span className="font-body text-[12px] font-medium tracking-tight text-ink/40">
              {pool.length === 0 ? "All paired" : "Meanings"}
            </span>
            <ProgressTrack current={filledCount} total={total} done={done} />
          </div>

          <div
            className={cn(
              "flex flex-wrap gap-2",
              compact ? "min-h-[2.25rem]" : "min-h-[2.75rem]",
            )}
          >
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
                      reduceMotion ? false : { opacity: 0, scale: 0.97 }
                    }
                    animate={{
                      opacity: isDragging ? 0.2 : 1,
                      scale: isSelected ? 1.015 : 1,
                    }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.96 }
                    }
                    transition={softSpring}
                    onPointerDown={(event) => startDrag(match, event)}
                    aria-pressed={isSelected}
                    className={cn(
                      "max-w-full touch-none select-none rounded-full px-3.5 py-2 text-left font-body text-[13px] font-medium leading-snug tracking-tight transition-[background-color,color,box-shadow] duration-150 ease-[var(--ease-out-quint)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                      isSelected
                        ? "bg-teal/[0.12] text-ink shadow-[inset_0_0_0_1px_rgb(var(--teal-rgb)_/_0.28)]"
                        : "bg-ink/[0.045] text-ink/90 hover:bg-ink/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.09]",
                    )}
                  >
                    {match}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
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
                : `Done · Wrong turns: ${wrongTurns}`
              : `Wrong turns: ${wrongTurns}`}
          </p>
        ) : (
          <span className="sr-only" role="status" aria-live="polite">
            {filledCount} of {total} paired
          </span>
        )}

        {typeof document !== "undefined" && dragging && drag
          ? createPortal(
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
                {drag.match}
              </motion.div>,
              document.body,
            )
          : null}
      </div>
    </LayoutGroup>
  );
}

/** Quiet capsule progress — reads as modern SaaS, not game HUD. */
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
        className={cn(
          "h-full rounded-full",
          done ? "bg-teal" : "bg-ink/45",
        )}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.28, ease: appleEase }}
      />
    </div>
  );
}
