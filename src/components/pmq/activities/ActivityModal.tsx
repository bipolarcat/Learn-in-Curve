"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Apple-like / 21st.dev Motion Primitives dialog open:
 * soft spring (almost no bounce) scale + rise on the panel, separate
 * backdrop fade. Ease matches SiteHeaderMenu. Blur stays static —
 * animating backdrop-filter is a common source of choppiness.
 */
const appleEase = [0.22, 1, 0.36, 1] as const;

const panelSpring = {
  type: "spring" as const,
  bounce: 0.05,
  duration: 0.35,
};

type ActivityModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  note?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Element that opened the modal — focus returns here on close. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

export function ActivityModal({
  open,
  onClose,
  title,
  note,
  eyebrow,
  children,
  footer,
  returnFocusRef,
}: ActivityModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, reduceMotion ? 0 : 40);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, reduceMotion]);

  function returnFocus() {
    returnFocusRef?.current?.focus();
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence onExitComplete={returnFocus}>
      {open ? (
        <motion.div
          key="activity-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : { duration: 0.18, ease: appleEase }
          }
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : { duration: 0.22, ease: appleEase }
            }
            onMouseDown={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.08 }
                : {
                    ...panelSpring,
                    opacity: {
                      type: "tween",
                      duration: 0.22,
                      ease: appleEase,
                    },
                  }
            }
            style={{ transformOrigin: "50% 50%" }}
            className={cn(
              "relative flex max-h-[min(90vh,48rem)] w-full max-w-xl flex-col overflow-hidden rounded-[1.35rem] border border-black/[0.06] bg-paper shadow-[0_24px_64px_rgb(var(--ink-rgb)_/_0.16),0_2px_6px_rgb(var(--ink-rgb)_/_0.04)] dark:border-white/[0.1]",
            )}
          >
            <header className="relative shrink-0 px-5 pb-1.5 pt-5 pr-12 sm:px-6">
              {eyebrow ? (
                <p className="m-0 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-teal/90">
                  {eyebrow}
                </p>
              ) : null}
              <h2
                id={titleId}
                className="m-0 mt-1 font-body text-[18px] font-semibold leading-snug tracking-[-0.02em] text-ink"
              >
                {title}
              </h2>
              {note ? (
                <p className="mt-1.5 font-body text-[13px] font-medium leading-snug tracking-tight text-ink/45">
                  {note}
                </p>
              ) : null}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 inline-flex size-8 items-center justify-center rounded-full text-ink/35 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
              >
                <X className="size-4" strokeWidth={2} aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6">
              {children}
            </div>

            {footer ? (
              <footer className="shrink-0 border-t border-black/[0.08] px-4 py-3 dark:border-white/[0.12] sm:px-5">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
