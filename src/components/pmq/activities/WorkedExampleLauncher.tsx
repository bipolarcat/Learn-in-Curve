"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WorkedExampleCard } from "@/types/pmq";
import { ActivityModal } from "@/components/pmq/activities/ActivityModal";
import { WorkedExampleIcon } from "@/components/pmq/activities/WorkedExampleIcon";
import { cn } from "@/lib/utils";

const appleEase = [0.22, 1, 0.36, 1] as const;

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
  const reduceMotion = useReducedMotion();

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
        delayChildren: reduceMotion ? 0 : 0.14,
      },
    },
  };

  const itemVariants = {
    hidden: reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0.01 }
        : { duration: 0.32, ease: appleEase },
    },
  };

  const answerVariants = {
    hidden: reduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 12, scale: 0.985 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0.01 }
        : { duration: 0.38, ease: appleEase },
    },
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        title="Worked example"
        aria-label={`Worked example: ${example.row_label}`}
        className={cn(
          // Negative margin keeps a ≥44px hit target without kicking the glyph
          // off the text baseline next to the row label.
          "inline-flex size-9 shrink-0 -m-1.5 items-center justify-center rounded-md transition-opacity duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
          className,
        )}
      >
        <WorkedExampleIcon className="size-4" />
      </button>

      <ActivityModal
        open={open}
        onClose={() => setOpen(false)}
        returnFocusRef={buttonRef}
        eyebrow="Worked example"
        eyebrowIcon={<WorkedExampleIcon className="size-3.5" />}
        title={example.row_label}
      >
        <motion.div
          className="grid gap-4"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          <motion.section variants={itemVariants}>
            <h3 className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-teal">
              Situation
            </h3>
            <p className="mt-1.5 font-body text-[14px] leading-relaxed text-ink">
              {example.situation}
            </p>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h3 className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-orange">
              Ask
            </h3>
            <p className="mt-1.5 font-body text-[14px] font-semibold leading-relaxed text-ink">
              {example.ask}
            </p>
          </motion.section>
          <motion.section
            variants={answerVariants}
            className="rounded-xl border border-teal/25 bg-teal/[0.06] px-3.5 py-3 dark:bg-teal/10"
          >
            <h3 className="m-0 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-teal">
              Answer
            </h3>
            <p className="mt-1.5 font-body text-[14px] leading-relaxed text-ink">
              {example.answer}
            </p>
          </motion.section>
        </motion.div>
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
