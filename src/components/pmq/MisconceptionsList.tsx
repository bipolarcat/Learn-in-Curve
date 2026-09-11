"use client";

import { useId, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { Misconception } from "@/types/pmq";
import { cn } from "@/lib/utils";

type MisconceptionsListProps = {
  items: Misconception[];
};

const fieldLabelClass =
  "font-body text-[12px] font-semibold tracking-tight text-ink/55";
const trapClass =
  "mt-1 block w-full min-w-0 font-body text-[15px] font-medium leading-snug tracking-tight text-pretty text-ink";
const rightClass =
  "mt-1 w-full min-w-0 font-body text-[15px] font-normal leading-[1.65] text-pretty text-ink/90";

/** Soft disclosure curve — same family as Insights. */
const panelEase = [0.22, 1, 0.36, 1] as const;

/**
 * Common misconceptions — one open at a time.
 * Quiet plates; Framer height/opacity expand (no measured-height chop).
 */
export function MisconceptionsList({ items }: MisconceptionsListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2"
      aria-label="Common misconceptions"
    >
      {items.map((item, index) => (
        <MisconceptionPlate
          key={`${index}-${item.wrong.slice(0, 40)}`}
          item={item}
          number={index + 1}
          open={openIndex === index}
          onToggle={() =>
            setOpenIndex((current) => (current === index ? null : index))
          }
        />
      ))}
    </div>
  );
}

function MisconceptionPlate({
  item,
  number,
  open,
  onToggle,
}: {
  item: Misconception;
  number: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const summaryId = useId();
  const reduceMotion = useReducedMotion();
  const trapText = item.wrong.trim();
  const rightText = item.right.trim();

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.32, ease: panelEase };

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-black/[0.08] bg-paper dark:border-white/[0.12]",
      )}
    >
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={
            open
              ? `Hide the right take for misconception ${number}. Trap: ${trapText}`
              : `Show the right take for misconception ${number}. Trap: ${trapText}`
          }
          onClick={onToggle}
          onPointerUp={(event) => {
            if (event.pointerType === "touch") event.currentTarget.blur();
          }}
          className={cn(
            "group flex w-full items-start gap-2 py-2.5 pl-3 pr-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent]",
            "active:bg-ink/[0.04] [@media(hover:hover)]:hover:bg-ink/[0.025]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange/50",
            open ? "rounded-t-2xl" : "rounded-2xl",
          )}
        >
          <span className="min-w-0 flex-1">
            {/* Bullet + label share one baseline so the dot lines up with “Wrong”. */}
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "block size-1.5 shrink-0 rounded-full bg-rust/55 transition-colors duration-150 ease-[var(--ease-out-quint)]",
                  open && "bg-rust",
                )}
                aria-hidden
              />
              <span className={fieldLabelClass}>
                Wrong{" "}
                <span className="tabular-nums text-ink/40">{number}</span>
              </span>
            </span>
            <span id={summaryId} className={`${trapClass} pl-3.5`}>
              {trapText}
            </span>
          </span>
          <motion.svg
            className="mt-0.5 size-3.5 shrink-0 text-ink/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : { duration: 0.28, ease: panelEase }
            }
          >
            <path d="M6 9L12 15L18 9" />
          </motion.svg>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="right"
            role="region"
            aria-labelledby={summaryId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0 }
            }
            transition={panelTransition}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2.5 pl-[1.625rem] pr-2.5">
              <p className={fieldLabelClass}>
                Right{" "}
                <span className="tabular-nums text-ink/40">{number}</span>
              </p>
              <p className={rightClass}>{rightText}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
