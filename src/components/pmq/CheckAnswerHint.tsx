"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export const CHECK_ANSWER_MCQ_COPY =
  "Choose an answer before you can check it.";

export const CHECK_ANSWER_DROPDOWN_COPY =
  "Fill every blank before you can check the answer.";

type HintPayload = {
  message: string;
  /** Viewport X of the tip center (clamped by the host). */
  x: number;
  /** Viewport Y — tip’s bottom edge sits here (just above card bottom / check row). */
  bottom: number;
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
 * Short teal tip anchored to the quiz card / Check answer control —
 * animates up from the card bottom (not the screen bottom).
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
    x: rect.left + rect.width / 2,
    bottom: rect.bottom - 10,
    id,
  });
  dismissTimer = setTimeout(() => {
    emit(null);
    dismissTimer = null;
  }, 3200);
}

/** Mount once near quiz UI (QuizRunner / TrialQuiz). */
export function CheckAnswerHintHost() {
  const [hint, setHint] = useState<HintPayload | null>(null);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setReady(true);
    const listener: Listener = (payload) => setHint(payload);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (!ready) return null;

  const pad = 12;
  const tipMax = 256;
  const vw = typeof window !== "undefined" ? window.innerWidth : tipMax;
  let left = hint?.x ?? 0;
  let transform = "translate(-50%, -100%)";
  if (hint) {
    const half = tipMax / 2;
    if (left + half > vw - pad) {
      left = vw - pad;
      transform = "translate(-100%, -100%)";
    } else if (left - half < pad) {
      left = pad;
      transform = "translate(0, -100%)";
    }
  }

  return createPortal(
    <AnimatePresence>
      {hint ? (
        <motion.div
          key={hint.id}
          role="status"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 10 }
          }
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0 }
          }
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 6 }
          }
          transition={{ duration: 0.18, delay: 0, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            left,
            top: hint.bottom,
            transform,
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
