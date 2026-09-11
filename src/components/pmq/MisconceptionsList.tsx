"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { Misconception } from "@/types/pmq";
import { cn } from "@/lib/utils";

type MisconceptionsListProps = {
  items: Misconception[];
};

const fieldLabelClass =
  "font-body text-[12px] font-semibold tracking-tight";
const trapClass =
  "mt-1 block w-full min-w-0 font-body text-[15px] font-medium leading-snug tracking-tight text-pretty text-ink";
const rightClass =
  "mt-1 w-full min-w-0 font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90";

function useMeasuredHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () => {
      const next = el.scrollHeight;
      if (next > 0) setHeight(next);
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, height };
}

/**
 * Common misconceptions — one open at a time.
 * Soft rounded plates + measured height expand (same DNA as Key definitions).
 */
export function MisconceptionsList({ items }: MisconceptionsListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2.5"
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
  const { ref, height } = useMeasuredHeight();
  const trapText = item.wrong.trim();
  const rightText = item.right.trim();

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-black/[0.08] bg-paper dark:border-white/[0.12]",
        "shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.03)]",
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
            "group flex w-full min-h-11 items-start gap-2.5 py-3 pl-3.5 pr-3 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent]",
            "active:bg-ink/[0.05] [@media(hover:hover)]:hover:bg-ink/[0.03]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange/50",
            open ? "rounded-t-2xl" : "rounded-2xl",
          )}
        >
          <span
            className={cn(
              "mt-1.5 block size-1.5 shrink-0 rounded-full bg-rust/55 transition-colors duration-150 ease-[var(--ease-out-quint)]",
              open && "bg-rust",
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className={`${fieldLabelClass} text-ink/55`}>
              Wrong{" "}
              <span className="tabular-nums text-ink/40">{number}</span>
            </span>
            <span id={summaryId} className={trapClass}>
              {trapText}
            </span>
          </span>
          <svg
            className={cn(
              "mt-1 size-3.5 shrink-0 text-ink/40 transition-transform duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:duration-0",
              open && "rotate-180 text-ink/55",
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9L12 15L18 9" />
          </svg>
        </button>
      </h3>

      <div
        className="overflow-hidden transition-[height] duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:duration-0"
        style={{ height: open ? (height > 0 ? height : "auto") : 0 }}
      >
        <div
          ref={ref}
          id={panelId}
          role="region"
          aria-labelledby={summaryId}
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          <div className="border-t border-black/[0.06] px-3.5 pb-3.5 pt-3 dark:border-white/[0.1]">
            <div className="rounded-xl bg-teal/[0.08] px-3.5 py-3 dark:bg-teal/[0.14]">
              <p className={`${fieldLabelClass} text-teal`}>
                Right{" "}
                <span className="tabular-nums text-teal/70">{number}</span>
              </p>
              <p className={rightClass}>{rightText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
