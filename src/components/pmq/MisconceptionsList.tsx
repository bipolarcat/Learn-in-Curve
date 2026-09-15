"use client";

import {
  useId,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Misconception } from "@/types/pmq";
import { cn } from "@/lib/utils";

type MisconceptionsListProps = {
  items: Misconception[];
};

const markClass = "size-3.5 shrink-0";
const trapClass =
  "min-w-0 w-full flex-1 font-body text-[15px] font-medium leading-snug tracking-tight text-ink";
const rightClass =
  "min-w-0 w-full flex-1 font-body text-[15px] font-normal leading-[1.5] tracking-tight text-ink/85";

/** 21st.dev expandable-tabs / Morphing Popover spring — snappy, slight settle. */
const accordionSpring = {
  type: "spring" as const,
  bounce: 0.12,
  duration: 0.4,
};

/**
 * Common misconceptions — flat FAQ accordion inside the Polish card.
 * Closed: the trap only. Open: the right take. One row at a time, all
 * closed by default, no nested plates.
 */
export function MisconceptionsList({ items }: MisconceptionsListProps) {
  const uid = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const spring = reduceMotion ? { duration: 0.01 } : accordionSpring;

  if (items.length === 0) return null;

  return (
    <ul
      className="m-0 w-full list-none p-0"
      aria-label="Common misconceptions"
    >
      {items.map((item, index) => {
        const open = openIndex === index;
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const triggerId = `${uid}-trigger-${index}`;
        const panelId = `${uid}-panel-${index}`;
        const wrong = item.wrong.trim();
        const right = item.right.trim();

        return (
          <li
            key={`${index}-${wrong.slice(0, 40)}`}
            className={cn(
              "w-full min-w-0 overflow-visible [overflow-anchor:none]",
              open && "py-2.5",
              open &&
                isFirst &&
                "border-t border-black/[0.07] dark:border-white/[0.1]",
              !isLast &&
                "border-b border-black/[0.07] dark:border-white/[0.1]",
              !open &&
                "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-ink/[0.035]",
            )}
          >
            <div
              className={cn(
                "relative w-full min-w-0 rounded-md",
                open && "px-1.5 py-1",
              )}
            >
              <motion.div
                aria-hidden
                initial={false}
                animate={{ opacity: open ? 1 : 0 }}
                transition={spring}
                className="pointer-events-none absolute inset-0 rounded-md bg-ink/[0.045] dark:bg-white/[0.06]"
              />
              <button
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`Wrong: ${wrong}`}
                onClick={() => setOpenIndex(open ? null : index)}
                onPointerUp={(event) => {
                  if (event.pointerType === "touch") event.currentTarget.blur();
                }}
                className={cn(
                  "relative flex min-h-11 w-full min-w-0 items-center gap-1.5 py-1.5 pr-5 text-left",
                  "touch-manipulation [-webkit-tap-highlight-color:transparent]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange/50",
                )}
              >
                <WrongMark className={`${markClass} text-rust`} />
                <span className={trapClass}>{wrong}</span>
                <motion.span
                  className={cn(
                    "absolute right-0 top-1/2 inline-flex",
                    open ? "text-orange" : "text-ink/55",
                  )}
                  initial={false}
                  animate={{ rotate: open ? 180 : 0, y: "-50%" }}
                  transition={spring}
                  aria-hidden
                >
                  <ChevronDown className="size-3.5" strokeWidth={2.25} />
                </motion.span>
              </button>
              <Collapse
                open={open}
                id={panelId}
                labelledBy={triggerId}
                spring={spring}
                reduceMotion={Boolean(reduceMotion)}
              >
                <div className="relative flex w-full min-w-0 items-start gap-1.5 pb-1.5">
                  <RightMark className={`${markClass} mt-0.5 text-olive`} />
                  <p className={rightClass}>
                    <span className="sr-only">Right. </span>
                    {right}
                  </p>
                </div>
              </Collapse>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Filled rust disc with a white X — exam-wrong mark. */
function WrongMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M5.15 5.15 10.85 10.85M10.85 5.15 5.15 10.85"
        className="text-paper"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Filled olive disc with a paper tick — matches WrongMark. */
function RightMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.45 8.2 6.95 10.7 11.6 5.4"
        className="text-paper"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Collapse({
  open,
  id,
  labelledBy,
  children,
  spring,
  reduceMotion,
}: {
  open: boolean;
  id: string;
  labelledBy: string;
  children: ReactNode;
  spring:
    | { type: "spring"; bounce: number; duration: number }
    | { duration: number };
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      aria-hidden={!open}
      inert={!open ? true : undefined}
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : {
              height: spring,
              opacity: {
                duration: open ? 0.2 : 0.12,
                ease: [0.22, 1, 0.36, 1],
              },
            }
      }
      className="relative overflow-hidden [overflow-anchor:none]"
    >
      {children}
    </motion.div>
  );
}
