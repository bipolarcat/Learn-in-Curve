"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export const CHECK_ANSWER_MCQ_COPY =
  "Choose an answer before you can check it.";

export const CHECK_ANSWER_DROPDOWN_COPY =
  "Fill every blank before you can check the answer.";

type HintPayload = {
  message: string;
  /** Quiz card horizontal bounds (viewport). Tip centers within these. */
  cardLeft: number;
  cardRight: number;
  cardBottom: number;
  id: number;
};

type Listener = (payload: HintPayload | null) => void;

const listeners = new Set<Listener>();
let seq = 0;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function emit(payload: HintPayload | null) {
  listeners.forEach((fn) => fn(payload));
}

/**
 * Short teal tip anchored to the quiz card —
 * centered horizontally on the card, sits just above the card bottom.
 *
 * Uses fixed `left`/`bottom` (tip’s own edges), never CSS `transform` for
 * placement — Framer’s `y` animation would overwrite that and shove the tip
 * off-center / off-screen.
 */
export function showCheckAnswerHint(
  kind: "mcq" | "dropdown",
  anchor: HTMLElement,
) {
  const card =
    (anchor.closest("[data-quiz-card]") as HTMLElement | null) ??
    (anchor.closest("section") as HTMLElement | null) ??
    anchor;
  const rect = card.getBoundingClientRect();
  const message =
    kind === "dropdown" ? CHECK_ANSWER_DROPDOWN_COPY : CHECK_ANSWER_MCQ_COPY;

  if (dismissTimer) clearTimeout(dismissTimer);
  const id = ++seq;
  emit({
    message,
    cardLeft: rect.left,
    cardRight: rect.right,
    cardBottom: rect.bottom,
    id,
  });
  dismissTimer = setTimeout(() => {
    emit(null);
    dismissTimer = null;
  }, 3200);
}

function clampTipLeft(
  preferredCenter: number,
  tipWidth: number,
  minLeft: number,
  maxRight: number,
  viewportPad: number,
) {
  const vw =
    typeof window !== "undefined" ? window.innerWidth : preferredCenter * 2;
  let left = preferredCenter - tipWidth / 2;
  // Prefer staying inside the quiz card.
  left = Math.max(minLeft, Math.min(left, maxRight - tipWidth));
  // Hard clamp to the viewport so nothing ever spills off-screen.
  left = Math.max(
    viewportPad,
    Math.min(left, vw - viewportPad - tipWidth),
  );
  return left;
}

/** Mount once near quiz UI (QuizRunner / TrialQuiz). */
export function CheckAnswerHintHost() {
  const [hint, setHint] = useState<HintPayload | null>(null);
  const [ready, setReady] = useState(false);
  const [tipWidth, setTipWidth] = useState(200);
  const tipRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setReady(true);
    const listener: Listener = (payload) => setHint(payload);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useLayoutEffect(() => {
    if (!hint || !tipRef.current) return;
    const w = tipRef.current.offsetWidth;
    if (w > 0 && w !== tipWidth) setTipWidth(w);
  }, [hint, tipWidth]);

  if (!ready) return null;

  const pad = 12;
  const inset = 10;
  const cardCenter = hint
    ? (hint.cardLeft + hint.cardRight) / 2
    : 0;
  const left = hint
    ? clampTipLeft(
        cardCenter,
        tipWidth,
        hint.cardLeft + inset,
        hint.cardRight - inset,
        pad,
      )
    : 0;
  // Tip’s bottom edge sits just above the card bottom.
  const bottom = hint
    ? Math.max(
        pad,
        (typeof window !== "undefined" ? window.innerHeight : 0) -
          hint.cardBottom +
          10,
      )
    : 0;

  return createPortal(
    <AnimatePresence>
      {hint ? (
        <motion.div
          key={hint.id}
          ref={tipRef}
          role="status"
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
          }
          animate={
            reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          exit={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
          }
          transition={{
            duration: 0.18,
            delay: 0,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: "fixed",
            left,
            bottom,
            zIndex: 100,
          }}
          className="pointer-events-none inline-flex w-fit max-w-[min(16rem,calc(100vw-1.5rem))] items-center gap-1.5 rounded-[0.35rem] border border-teal/25 bg-[color-mix(in_srgb,var(--teal)_16%,rgb(var(--paper-rgb)))] px-1.5 py-1 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_4px_14px_rgb(var(--ink-rgb)_/_0.08)] dark:border-teal/35 dark:bg-[color-mix(in_srgb,var(--teal)_28%,rgb(var(--paper-rgb)))]"
        >
          <AlertTriangle
            className="size-3.5 shrink-0 self-center text-teal"
            strokeWidth={2.25}
            aria-hidden
          />
          <p className="font-body text-[11px] font-medium leading-snug tracking-tight text-teal-deep text-pretty">
            {hint.message}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
