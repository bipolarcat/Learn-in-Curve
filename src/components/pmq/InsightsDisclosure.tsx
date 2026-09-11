"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  LightbulbIcon,
  type LightbulbIconHandle,
} from "@animateicons/react/lucide/lightbulb-icon";
import type { ExamTip } from "@/types/pmq";
import { cn } from "@/lib/utils";

/**
 * LO2 trial: Insights as an inline footnote chip — quiet annotation in the
 * prose flow, not a control strip. Bulb motion from AnimateIcons Lucide.
 */
export function InsightsDisclosure({ tip }: { tip: ExamTip }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const bulbRef = useRef<LightbulbIconHandle>(null);

  useEffect(() => {
    if (reduceMotion) return;
    if (open) bulbRef.current?.startAnimation();
    else bulbRef.current?.stopAnimation();
  }, [open, reduceMotion]);

  return (
    <div className="not-prose my-2 min-w-0 max-w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => {
          if (!reduceMotion && !open) bulbRef.current?.startAnimation();
        }}
        onMouseLeave={() => {
          if (!reduceMotion && !open) bulbRef.current?.stopAnimation();
        }}
        className={cn(
          "group inline-flex items-center gap-1 font-body text-[12.5px] font-medium leading-none tracking-tight text-teal/80 transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent]",
          // Optical hit target without bloating the footnote line.
          "-mx-0.5 px-0.5 py-0.5",
          "hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50",
          open && "text-teal",
        )}
      >
        <LightbulbIcon
          ref={bulbRef}
          size={14}
          duration={0.85}
          isAnimated={!reduceMotion}
          className="-mr-px shrink-0 text-current"
          aria-hidden
        />
        <span className="leading-snug underline decoration-teal/25 underline-offset-[3px] group-hover:decoration-teal/50">
          {open ? "Hide insights" : "Insights"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="insight"
            role="region"
            aria-label="Insights"
            initial={
              reduceMotion ? false : { height: 0, opacity: 0, y: -3 }
            }
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0, y: -3 }
            }
            transition={{
              duration: reduceMotion ? 0.01 : 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            {/* Indent to the label edge so the tip reads as a footnote under the chip */}
            <p className="m-0 mt-1.5 w-full min-w-0 border-l border-teal/20 pl-3 font-body text-[13px] italic leading-[1.55] text-ink/75">
              {tip.tip}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function InsightsDisclosureList({ tips }: { tips: ExamTip[] }) {
  if (tips.length === 0) return null;
  return (
    <div className="not-prose flex min-w-0 flex-col gap-0">
      {tips.map((tip) => (
        <InsightsDisclosure key={tip.id} tip={tip} />
      ))}
    </div>
  );
}
