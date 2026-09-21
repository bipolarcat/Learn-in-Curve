"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  LightbulbIcon,
  type LightbulbIconHandle,
} from "@animateicons/react/lucide/lightbulb-icon";
import type { ExamTip } from "@/types/pmq";
import { ProBadge } from "@/components/pmq/tier-badge";
import { showProLockHint } from "@/components/pmq/ProLockHint";
import { cn } from "@/lib/utils";

/** Motion Primitives / 21st.dev Disclosure ease. */
const disclosureEase = [0.22, 1, 0.36, 1] as const;

/** 21st.dev Morphing Popover-adjacent spring for the chevron flip. */
const chevronSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
  mass: 0.7,
};

type InsightsExpandProps = {
  children: ReactNode;
  /** Wrapper class for the chip + panel block. */
  className?: string;
  /** Accessible name for the open panel. */
  panelLabel?: string;
};

/**
 * Shared Insights chip: lightbulb + label + chevron that flips on open
 * (21st.dev disclosure affordance). Underline morphs into the tip rail.
 */
export function InsightsExpand({
  children,
  className,
  panelLabel = "Insights",
}: InsightsExpandProps) {
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

  const chevronTransition = reduceMotion
    ? { duration: 0.01 }
    : chevronSpring;

  return (
    <LayoutGroup id={railId}>
      <div className={cn("not-prose min-w-0 max-w-full", className)}>
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
            {!open ? (
              <motion.span
                layoutId={reduceMotion ? undefined : railId}
                className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-teal/40"
                transition={railTransition}
                aria-hidden
              />
            ) : null}
          </span>
          <motion.span
            className="inline-flex shrink-0"
            animate={{ rotate: open ? 180 : 0 }}
            transition={chevronTransition}
            aria-hidden
          >
            <ChevronDown
              className="size-3.5 text-current opacity-70"
              strokeWidth={2.25}
            />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={panelId}
              key="insight"
              role="region"
              aria-label={panelLabel}
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
              <div className="mt-1.5 flex min-w-0 items-stretch gap-3">
                <motion.span
                  layoutId={reduceMotion ? undefined : railId}
                  className="w-px shrink-0 self-stretch bg-teal/40"
                  transition={railTransition}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">{children}</div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

/**
 * Starter LO2–24: same Insights chrome as Pro, but static + de-emphasised,
 * with the locked Pro badge. Tip text was already stripped server-side.
 * Tap → short Pro unlock toast.
 */
export function InsightsLockedChip({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => showProLockHint("insights", e.currentTarget)}
      className={cn(
        "not-prose m-0 inline-flex cursor-pointer items-center gap-1 font-body text-[12.5px] font-medium leading-none tracking-tight text-ink/45 touch-manipulation [-webkit-tap-highlight-color:transparent]",
        "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55",
        className,
      )}
      aria-label="Insights locked — Pro. Unlock with the Pro bundle."
    >
      <LightbulbIcon
        size={14}
        duration={0.85}
        isAnimated={false}
        className="-mr-px shrink-0 text-current"
        aria-hidden
      />
      <span>Insights</span>
      <ProBadge locked />
    </button>
  );
}

/**
 * Insights — inline footnote chip (all PMQ Learn LOs).
 * Underline is a separate motion element (21st.dev underline-animation pattern),
 * not CSS text-decoration. On open it layout-morphs into the vertical tip rail
 * (Motion shared `layoutId`); on close it re-plants under the label.
 * Expand/collapse follows Motion Primitives Disclosure height variants.
 */
export function InsightsDisclosure({ tip }: { tip: ExamTip }) {
  return (
    <InsightsExpand className="mt-0.5 mb-2">
      <p className="m-0 min-w-0 font-body text-[13px] italic leading-[1.55] text-ink/75">
        {tip.tip}
      </p>
    </InsightsExpand>
  );
}

export function InsightsDisclosureList({
  tips,
  locked = false,
}: {
  tips: ExamTip[];
  locked?: boolean;
}) {
  if (tips.length === 0) return null;
  if (locked) {
    return (
      <div className="not-prose -mt-1.5 flex min-w-0 flex-col gap-0">
        <InsightsLockedChip className="mt-0.5 mb-2" />
      </div>
    );
  }
  return (
    // Pull toward the paragraph/table above (markdown still keeps its own mb).
    <div className="not-prose -mt-1.5 flex min-w-0 flex-col gap-0">
      {tips.map((tip) => (
        <InsightsDisclosure key={tip.id} tip={tip} />
      ))}
    </div>
  );
}
