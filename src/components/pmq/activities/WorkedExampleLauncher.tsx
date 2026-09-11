"use client";

import { useRef, useState } from "react";
import { ClipboardList } from "lucide-react";
import type { WorkedExampleCard } from "@/types/pmq";
import { ActivityModal } from "@/components/pmq/activities/ActivityModal";
import { cn } from "@/lib/utils";

type WorkedExampleLauncherProps = {
  example: WorkedExampleCard;
  className?: string;
};

/** Icon on a single table row — opens situation / ask / answer. */
export function WorkedExampleLauncher({
  example,
  className,
}: WorkedExampleLauncherProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        title="Worked example"
        aria-label={`Worked example: ${example.row_label}`}
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-orange transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent] hover:text-orange/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
          className,
        )}
      >
        <ClipboardList className="size-3.5" strokeWidth={2} aria-hidden />
      </button>

      <ActivityModal
        open={open}
        onClose={() => setOpen(false)}
        returnFocusRef={buttonRef}
        eyebrow="Worked example"
        title={example.row_label}
      >
        <div className="grid gap-4">
          <section>
            <h3 className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-teal">
              Situation
            </h3>
            <p className="mt-1.5 font-body text-[14px] leading-relaxed text-ink">
              {example.situation}
            </p>
          </section>
          <section>
            <h3 className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-orange">
              Ask
            </h3>
            <p className="mt-1.5 font-body text-[14px] font-semibold leading-relaxed text-ink">
              {example.ask}
            </p>
          </section>
          <section className="rounded-xl border border-teal/25 bg-teal/[0.06] px-3.5 py-3 dark:bg-teal/10">
            <h3 className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-teal">
              Answer
            </h3>
            <p className="mt-1.5 font-body text-[14px] leading-relaxed text-ink">
              {example.answer}
            </p>
          </section>
        </div>
      </ActivityModal>
    </>
  );
}

/**
 * Find a worked example for a row by trimmed first-column text.
 * Returns null (render nothing) when there is no match — never throws.
 */
export function workedExampleForRow(
  examples: WorkedExampleCard[] | undefined,
  rowLabel: string,
): WorkedExampleCard | null {
  if (!examples?.length) return null;
  const needle = rowLabel.trim();
  if (!needle) return null;
  return examples.find((example) => example.row_label.trim() === needle) ?? null;
}
