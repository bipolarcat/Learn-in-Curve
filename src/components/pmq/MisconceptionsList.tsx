"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Misconception } from "@/types/pmq";

type MisconceptionsListProps = {
  items: Misconception[];
};

const fieldLabelClass =
  "font-body text-[12px] font-semibold tracking-tight text-ink/60";
const trapClass =
  "mt-1 block w-full min-w-0 font-body text-[15px] font-medium leading-snug tracking-tight text-pretty text-ink";
const rightClass =
  "mt-1 w-full min-w-0 font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90";

/**
 * One open at a time. Closed = the trap; open = the right take.
 */
export function MisconceptionsList({ items }: MisconceptionsListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <div className="w-full min-w-0" aria-label="Common misconceptions">
      {items.map((item, index) => (
        <MisconceptionItem
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

function MisconceptionItem({
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
  const trapText = item.wrong.trim();
  const rightText = item.right.trim();

  return (
    <div className="w-full min-w-0 border-b border-black/[0.06] last:border-b-0 dark:border-white/[0.1]">
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
          className="flex w-full min-h-11 items-start gap-3 py-3 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <span className="min-w-0 flex-1">
            <span className={fieldLabelClass}>
              Wrong{" "}
              <span className="tabular-nums text-ink/50">{number}</span>
            </span>
            <span id={summaryId} className={trapClass}>
              {trapText}
            </span>
          </span>
          <ChevronDown
            className={`mt-1 size-4 shrink-0 text-ink/40 transition-transform duration-150 ease-[var(--ease-out-quint)] motion-reduce:transition-none ${
              open ? "rotate-180 text-ink/55" : ""
            }`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={summaryId}
        hidden={!open}
        className={open ? "w-full min-w-0 pb-3.5" : undefined}
      >
        {open ? (
          <div className="w-full min-w-0">
            <p className={fieldLabelClass}>
              Right{" "}
              <span className="tabular-nums text-ink/50">{number}</span>
            </p>
            <p className={rightClass}>{rightText}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
