"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef?.current?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "flex max-h-[min(88vh,44rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-paper shadow-[0_12px_40px_rgb(var(--ink-rgb)_/_0.18)] dark:border-white/[0.12]",
        )}
      >
        <header className="relative shrink-0 border-b border-black/[0.08] px-4 pb-3 pt-4 pr-12 dark:border-white/[0.12] sm:px-5">
          {eyebrow ? (
            <p className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-teal">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={titleId}
            className="m-0 mt-0.5 font-body text-[17px] font-semibold leading-snug tracking-tight text-ink"
          >
            {title}
          </h2>
          {note ? (
            <p className="mt-1 font-body text-[13px] leading-snug text-ink/70">
              {note}
            </p>
          ) : null}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-ink/45 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55"
          >
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-black/[0.08] px-4 py-3 dark:border-white/[0.12] sm:px-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
