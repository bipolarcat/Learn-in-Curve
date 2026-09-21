"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { ProBadge } from "@/components/pmq/tier-badge";

const INSIGHTS_COPY = "Unlock insights with the Pro bundle.";
const RECALL_COPY = "Unlock recall activities with the Pro bundle.";
const MOCK_COPY = "Unlock mock exams with the Pro bundle.";

const HINT_MS = 2800;
const HINT_GAP_PX = 8;
const VIEWPORT_PAD_PX = 12;
const CARD_PAD_PX = 10;

type HintKind = "insights" | "recall" | "mock";

type HintPayload = {
  id: number;
  message: string;
  /** Anchor element — tip re-syncs on scroll/resize from this. */
  anchor: HTMLElement;
};

type Listener = (payload: HintPayload | null) => void;

const listeners = new Set<Listener>();
let seq = 0;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function emit(payload: HintPayload | null) {
  listeners.forEach((fn) => fn(payload));
}

function copyFor(kind: HintKind): string {
  if (kind === "insights") return INSIGHTS_COPY;
  if (kind === "recall") return RECALL_COPY;
  return MOCK_COPY;
}

function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}

/** Dismiss the anchored Pro lock tip immediately. */
export function dismissProLockHint() {
  clearDismissTimer();
  emit(null);
}

/**
 * Short tip anchored to the tapped control — same placement model as the
 * learning-pathway disabled hint (under the icon, or above if no room).
 * Pass the clicked element so the tip sits next to it, not at screen top.
 */
export function showProLockHint(kind: HintKind, anchor: HTMLElement) {
  clearDismissTimer();
  const id = ++seq;
  emit({ id, message: copyFor(kind), anchor });
  dismissTimer = setTimeout(() => {
    emit(null);
    dismissTimer = null;
  }, HINT_MS);
}

/** Learn core card (or nearest section) — tip must stay inside this box on desktop. */
function findContainBounds(anchor: HTMLElement): {
  left: number;
  right: number;
} {
  const card =
    (anchor.closest('[aria-label="Core content"]') as HTMLElement | null) ??
    (anchor.closest("article") as HTMLElement | null) ??
    (anchor.closest("section") as HTMLElement | null);
  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  if (!card) {
    return { left: VIEWPORT_PAD_PX, right: vw - VIEWPORT_PAD_PX };
  }
  const r = card.getBoundingClientRect();
  return {
    left: Math.max(VIEWPORT_PAD_PX, r.left + CARD_PAD_PX),
    right: Math.min(vw - VIEWPORT_PAD_PX, r.right - CARD_PAD_PX),
  };
}

type TipPlacement = { left: number; top: number; placeAbove: boolean };

function placeTip(
  anchor: HTMLElement,
  tipWidth: number,
  tipHeight: number,
): TipPlacement {
  const rect = anchor.getBoundingClientRect();
  const bounds = findContainBounds(anchor);
  // Left-align under the control so left-edge Insights chips don't shove the
  // tip half outside the cream card.
  let left = rect.left;
  const maxLeft = Math.max(bounds.left, bounds.right - tipWidth);
  left = Math.min(Math.max(left, bounds.left), maxLeft);

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const belowTop = rect.bottom + HINT_GAP_PX;
  const aboveTop = rect.top - HINT_GAP_PX - tipHeight;
  const fitsBelow = belowTop + tipHeight <= vh - VIEWPORT_PAD_PX;
  const placeAbove = !fitsBelow && aboveTop >= VIEWPORT_PAD_PX;
  const top = placeAbove
    ? Math.max(VIEWPORT_PAD_PX, aboveTop)
    : Math.min(belowTop, vh - VIEWPORT_PAD_PX - tipHeight);
  return { left, top, placeAbove };
}

/** Mount once at app root (`AppToaster`) so Learn / mock taps always resolve. */
export function ProLockHintHost() {
  const [hint, setHint] = useState<HintPayload | null>(null);
  const [ready, setReady] = useState(false);
  const [placement, setPlacement] = useState<TipPlacement | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setReady(true);
    const listener: Listener = (payload) => {
      setPlacement(null);
      setHint(payload);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useLayoutEffect(() => {
    if (!hint || !tipRef.current) return;
    const el = tipRef.current;
    setPlacement(
      placeTip(hint.anchor, el.offsetWidth || 200, el.offsetHeight || 28),
    );
  }, [hint]);

  useEffect(() => {
    if (!hint) return;
    const sync = () => {
      if (!tipRef.current) return;
      setPlacement(
        placeTip(
          hint.anchor,
          tipRef.current.offsetWidth,
          tipRef.current.offsetHeight,
        ),
      );
    };
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
    };
  }, [hint]);

  if (!ready) return null;

  return createPortal(
    <AnimatePresence>
      {hint ? (
        <motion.div
          key={hint.id}
          ref={tipRef}
          role="status"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  y: placement?.placeAbove ? -4 : 4,
                }
          }
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: placement?.placeAbove ? -3 : 3 }
          }
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            left: placement?.left ?? -9999,
            top: placement?.top ?? 0,
            zIndex: 100,
            visibility: placement ? "visible" : "hidden",
            width: "max-content",
          }}
          className="pointer-events-auto inline-flex max-w-[min(22rem,calc(100vw-1.5rem))] items-center gap-1.5 rounded-[0.35rem] border border-ink/10 bg-paper px-1.5 py-1 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_4px_14px_rgb(var(--ink-rgb)_/_0.08)] dark:border-white/10"
        >
          <ProBadge />
          <span className="shrink-0 whitespace-nowrap font-body text-[11px] font-medium leading-none tracking-tight text-ink/65">
            {hint.message}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissProLockHint();
            }}
            className="shrink-0 rounded-md p-0.5 text-ink/40 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange touch-manipulation [-webkit-tap-highlight-color:transparent]"
            aria-label="Dismiss"
          >
            <X className="size-3" strokeWidth={2.25} aria-hidden />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
