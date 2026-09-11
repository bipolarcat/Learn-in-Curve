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
import type { PairupActivity } from "@/types/pmq";
import { cn } from "@/lib/utils";
import { shuffleUntilDifferent } from "@/components/pmq/activities/shuffle";
import {
  ActivityPlayHint,
  ActivityPlayStatus,
  activityChipClass,
  activityDockClass,
} from "@/components/pmq/activities/ActivityPlayChrome";

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

/**
 * Pair up — drag a meaning onto a term’s line (Apple Reminders / Files snap).
 * Short press selects; drag drops onto a line. Wrong drops bounce home.
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

  const done = Object.keys(filled).length === activity.pairs.length;

  const hitTerm = useCallback(
    (clientX: number, clientY: number) => {
      for (const term of terms) {
        if (filled[term]) continue;
        const el = lineRefs.current.get(term);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
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
    window.setTimeout(() => setShakeTerm(null), 420);
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
    <div className="grid gap-4">
      <ActivityPlayHint>
        {reduceMotion
          ? "Select a meaning, then tap the matching term line."
          : "Drag a meaning onto a term’s line to pair them. Or tap both."}
      </ActivityPlayHint>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {terms.map((term) => {
          const match = filled[term];
          const isHot = hotTerm === term && !match;
          const isShake = shakeTerm === term;
          const isTapTarget = Boolean(selected) && !match;
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
                    ? { x: [0, -5, 5, -3, 3, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.42, ease: "easeOut" }}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-stretch gap-2 rounded-2xl border p-1.5 transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                  match
                    ? "border-teal/35 bg-teal/[0.07]"
                    : isHot
                      ? "border-orange bg-orange/[0.08] shadow-[0_0_0_3px_rgb(var(--orange-rgb)_/_0.18)]"
                      : isTapTarget
                        ? "border-orange/50 bg-orange/[0.04]"
                        : "border-black/[0.08] bg-ink/[0.015] dark:border-white/[0.12]",
                  isShake && "border-rust bg-rust/[0.08]",
                )}
              >
                <div className="flex items-center px-2.5 py-2">
                  <span className="font-body text-[13px] font-semibold leading-snug tracking-tight text-ink">
                    {term}
                  </span>
                </div>

                <div
                  className={cn(
                    activityDockClass,
                    "min-h-[3rem]",
                    match
                      ? "border-solid border-teal/30 bg-teal/10"
                      : isHot
                        ? "border-orange bg-orange/10"
                        : null,
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {match ? (
                      <motion.span
                        key={match}
                        initial={
                          reduceMotion
                            ? { opacity: 1 }
                            : { opacity: 0, scale: 0.92 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.35,
                        }}
                        className="font-body text-[13px] font-medium leading-snug text-ink"
                      >
                        {match}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="empty"
                        initial={false}
                        className="font-body text-[12px] font-medium text-ink/35"
                      >
                        {isHot ? "Release to pair" : "Drop here"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl border border-black/[0.06] bg-ink/[0.02] p-2.5 dark:border-white/[0.1]">
        <p className="mb-2 px-0.5 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-ink/40">
          Meanings
        </p>
        <div className="flex min-h-[3rem] flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {pool.map((match) => {
              const isSelected = selected === match;
              const isDragging = drag?.match === match;
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
                  onPointerDown={(event) => startDrag(match, event)}
                  aria-pressed={isSelected}
                  className={cn(
                    activityChipClass,
                    "max-w-full touch-none select-none",
                    isSelected &&
                      "border-orange bg-orange/10 ring-2 ring-orange/30",
                    "hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
                  )}
                >
                  {match}
                </motion.button>
              );
            })}
          </AnimatePresence>
          {pool.length === 0 ? (
            <p className="m-0 px-1 py-2 font-body text-[12px] text-ink/45">
              All paired
            </p>
          ) : null}
        </div>
      </div>

      <ActivityPlayStatus
        done={done}
        doneLabel="Paired"
        wrongTurns={wrongTurns}
        current={Object.keys(filled).length}
        total={activity.pairs.length}
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
          {drag.match}
        </motion.div>
      ) : null}
    </div>
  );
}
