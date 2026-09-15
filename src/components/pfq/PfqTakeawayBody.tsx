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
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import { InsightsDisclosureList } from "@/components/pmq/InsightsDisclosure";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";
import { cn } from "@/lib/utils";

/** Same ease as InsightsDisclosure / Motion Primitives Disclosure. */
const disclosureEase = [0.22, 1, 0.36, 1] as const;

/**
 * PFQ Learn body: key takeaway always visible; deeper explanation behind the
 * same Insights chip (icon, copy, underline→rail morph) as PMQ Learn.
 */
export function PfqTakeawayBody({
  block,
}: {
  block: CoreContentBlockType;
}) {
  const takeaway = block.key_takeaway?.trim() ?? "";
  const body = block.body_markdown?.trim() ?? "";
  const tips = block.exam_tips ?? [];

  const panelId = useId();
  const railId = `pfq-insights-rail-${useId().replace(/:/g, "")}`;
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

  if (!takeaway && !body) return null;

  return (
    <div className="min-w-0">
      {takeaway ? (
        <p className="m-0 font-body text-[16px] leading-relaxed text-ink">
          {takeaway}
        </p>
      ) : null}

      {body ? (
        <LayoutGroup id={railId}>
          <div
            className={cn(
              "not-prose min-w-0 max-w-full",
              takeaway ? "mt-2" : "mt-0.5",
            )}
          >
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
                    <motion.span
                      layoutId={reduceMotion ? undefined : railId}
                      className="w-px shrink-0 self-stretch bg-teal/40"
                      transition={railTransition}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="pmq-markdown pmq-markdown--learn-core min-w-0 max-w-full [&_.pmq-markdown]:mt-0">
                        <MarkdownBlock content={body} />
                      </div>
                      {tips.length > 0 ? (
                        <div className="mt-2">
                          <InsightsDisclosureList tips={tips} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      ) : null}
    </div>
  );
}
