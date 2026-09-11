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
 * Inline footnote chrome: body-sized control, tight bulb↔label, prose rhythm.
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
          "group inline-flex items-center gap-1 rounded-md py-0.5 font-body text-[13px] font-semibold leading-none tracking-tight text-teal transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent]",
          // Expand hit area without bloating the optical size in the prose flow.
          "-mx-1 px-1",
          "hover:text-teal/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50",
          open && "text-teal",
        )}
      >
        <LightbulbIcon
          ref={bulbRef}
          size={15}
          duration={0.85}
          isAnimated={!reduceMotion}
          // AnimateIcons viewBox runs a touch wide — pull in toward the label.
          className="-mr-0.5 shrink-0 text-teal"
          aria-hidden
        />
        <span className="leading-snug">
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
            <p className="m-0 mt-1.5 w-full min-w-0 font-body text-[13.5px] leading-[1.6] text-ink/85">
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
    <div className="not-prose flex min-w-0 flex-col gap-0.5">
      {tips.map((tip) => (
        <InsightsDisclosure key={tip.id} tip={tip} />
      ))}
    </div>
  );
}
