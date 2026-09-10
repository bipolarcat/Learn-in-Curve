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
 * LO2 trial: exam coaching as an Insights disclosure — no callout card.
 * Bulb motion from 21st.dev / AnimateIcons Lucide (`LightbulbIcon`).
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
    <div className="not-prose my-3 min-w-0 max-w-full">
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
          "group inline-flex min-h-10 items-center gap-2 rounded-lg px-1.5 py-1.5 font-body text-[13px] font-semibold tracking-tight text-teal transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent]",
          "hover:bg-teal/[0.08] hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50",
          open && "bg-teal/[0.1] text-teal",
        )}
      >
        <LightbulbIcon
          ref={bulbRef}
          size={18}
          duration={0.85}
          isAnimated={!reduceMotion}
          className="shrink-0 text-teal"
          aria-hidden
        />
        <span>{open ? "Hide insights" : "Insights"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="insight"
            role="region"
            aria-label="Insights"
            initial={
              reduceMotion ? false : { height: 0, opacity: 0, y: -4 }
            }
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0, y: -4 }
            }
            transition={{
              duration: reduceMotion ? 0.01 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            <p className="m-0 mt-1.5 max-w-prose pl-1 font-body text-[13.5px] leading-[1.6] text-pretty text-ink/85">
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
    <div className="not-prose flex min-w-0 flex-col gap-1">
      {tips.map((tip) => (
        <InsightsDisclosure key={tip.id} tip={tip} />
      ))}
    </div>
  );
}
