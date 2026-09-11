"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  LightbulbIcon,
  type LightbulbIconHandle,
} from "@animateicons/react/lucide/lightbulb-icon";
import type { ExamTip } from "@/types/pmq";
import { cn } from "@/lib/utils";

/** Motion Primitives / 21st.dev Disclosure ease. */
const disclosureEase = [0.22, 1, 0.36, 1] as const;

/**
 * Insights — inline footnote chip (all PMQ Learn LOs).
 * Underline is a separate motion element (21st.dev underline-animation pattern),
 * not CSS text-decoration. On open it layout-morphs into the vertical tip rail
 * (Motion shared `layoutId`); on close it re-plants under the label.
 * Expand/collapse follows Motion Primitives Disclosure height variants.
 */
export function InsightsDisclosure({ tip }: { tip: ExamTip }) {
  const panelId = useId();
  const railId = `insights-rail-${useId().replace(/:/g, "")}`;
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const bulbRef = useRef<LightbulbIconHandle>(null);

  useEffect(() => {
    if (reduceMotion) return;
    if (open) bulbRef.current?.startAnimation();
    else bulbRef.current?.stopAnimation();
  }, [open, reduceMotion]);

  const railTransition = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.8 };

  const panelTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.28, ease: disclosureEase };

  return (
    <LayoutGroup id={railId}>
      <div className="not-prose mt-0.5 mb-2 min-w-0 max-w-full">
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
          <span className="relative inline-block leading-snug">
            {open ? "Hide insights" : "Insights"}
            {/* Closed: underline under the label (21st separate-element underline) */}
            {!open ? (
              <motion.span
                layoutId={reduceMotion ? undefined : railId}
                className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-teal/40"
                transition={railTransition}
                aria-hidden
              />
            ) : null}
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
                reduceMotion ? false : { height: 0, opacity: 0 }
              }
              animate={{ height: "auto", opacity: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { height: 0, opacity: 0 }
              }
              transition={panelTransition}
              className="overflow-hidden"
            >
              <div className="mt-1.5 flex min-w-0 items-stretch gap-3">
                {/* Open: same rail, now vertical beside the tip */}
                <motion.span
                  layoutId={reduceMotion ? undefined : railId}
                  className="w-px shrink-0 self-stretch bg-teal/40"
                  transition={railTransition}
                  aria-hidden
                />
                <p className="m-0 min-w-0 flex-1 font-body text-[13px] italic leading-[1.55] text-ink/75">
                  {tip.tip}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

export function InsightsDisclosureList({ tips }: { tips: ExamTip[] }) {
  if (tips.length === 0) return null;
  return (
    // Pull toward the paragraph/table above (markdown still keeps its own mb).
    <div className="not-prose -mt-1.5 flex min-w-0 flex-col gap-0">
      {tips.map((tip) => (
        <InsightsDisclosure key={tip.id} tip={tip} />
      ))}
    </div>
  );
}
