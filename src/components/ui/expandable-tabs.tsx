"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
  disabled?: boolean;
  /** Optional trailing glyph (e.g. Pro lock) — no wrapper chrome. */
  trailing?: React.ReactNode;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  disabled?: never;
  trailing?: never;
}

export type ExpandableTabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: ExpandableTabItem[];
  className?: string;
  activeColor?: string;
  /** Controlled selected index. Separators count in the index space. */
  value?: number | null;
  /** Uncontrolled initial selection. */
  defaultValue?: number | null;
  /** When false, outside click does not clear selection (nav tabs). Default true. */
  clearOnOutsideClick?: boolean;
  /** Expand selected tab to show its title. Default true. */
  expandSelectedLabel?: boolean;
  /** Compact hit targets for tight chrome (e.g. mobile LO header). */
  size?: "default" | "compact";
  onChange?: (index: number | null) => void;
  /**
   * Fired when a disabled tab is activated (click / Enter / Space).
   * Keeps the control focusable so we can explain why navigation is blocked
   * (native `disabled` would swallow the event).
   */
  onDisabledActivate?: (index: number) => void;
}

/*
 * Why nothing here animates size any more (LIC-106).
 *
 * The tab row used to spring-animate `gap`, `paddingLeft`, `paddingRight` and
 * `width: 0 → "auto"`. Every one of those is layout-affecting, and `width:
 * auto` is the worst of them: Framer has to measure the label and drive a
 * numeric width, so each of the ~27 frames forced a full layout of the flex row
 * — with seven tabs, one growing while another shrinks, that relayout
 * propagates across the whole LO header. The header sits inside
 * `backdrop-blur-xl`, so every one of those layouts also re-rasterised a 24px
 * blurred backdrop.
 *
 * Measured in-browser against a transform/opacity-only equivalent of the same
 * seven-tab row inside the same blur ancestor: ~11.7x the cost for identical
 * frame counts, on a fast desktop with a trivial DOM. On a mid-range phone with
 * the real page behind it, that is the choppiness.
 *
 * The size change is now plain CSS, so switching tabs costs ONE layout pass
 * instead of one per frame. The only thing still animated is the label's
 * opacity and a small translate — both compositor properties, which is why it
 * reads smooth. The label leaves instantly so the row never has two expanded
 * tabs fighting for width mid-transition (that would overflow the nowrap
 * compact row).
 */
const LABEL_ENTER = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

const labelEnter = {
  initial: { opacity: 0, x: -4 },
  animate: { opacity: 1, x: 0 },
  /**
   * Leaves instantly. An animated exit would keep the old tab's label
   * occupying width while the new one expands, so the row would briefly need
   * space for two expanded tabs — which the nowrap compact row cannot give it.
   */
  exit: { opacity: 0, transition: { duration: 0 } },
};

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-orange",
  value,
  defaultValue = null,
  clearOnOutsideClick = true,
  expandSelectedLabel = true,
  size = "default",
  onChange,
  onDisabledActivate,
}: ExpandableTabsProps) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<number | null>(
    defaultValue,
  );
  const selected = isControlled ? value! : uncontrolled;
  const outsideClickRef = React.useRef<HTMLDivElement>(null);
  const reduceMotionPref = useReducedMotion();
  const [motionReady, setMotionReady] = React.useState(false);
  React.useEffect(() => {
    setMotionReady(true);
  }, []);
  // SSR + first client paint both treat as “motion on” so Framer style attrs match.
  const reduceMotion = motionReady && Boolean(reduceMotionPref);
  const enterTransition = reduceMotion ? { duration: 0 } : LABEL_ENTER;
  const compact = size === "compact";

  useOnClickOutside(outsideClickRef as React.RefObject<HTMLElement>, () => {
    if (!clearOnOutsideClick) return;
    if (!isControlled) setUncontrolled(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    const item = tabs[index];
    if (!item || item.type === "separator") return;
    if (item.disabled) {
      onDisabledActivate?.(index);
      return;
    }
    if (!isControlled) setUncontrolled(index);
    onChange?.(index);
  };

  const Separator = () => (
    <div
      className="mx-0.5 h-4 w-px shrink-0 bg-black/[0.08] dark:bg-white/[0.12]"
      aria-hidden
    />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex items-center rounded-xl border border-black/[0.08] bg-paper/80 p-1 dark:border-white/[0.12]",
        compact ? "flex-nowrap gap-0" : "flex-wrap gap-1",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isSelected = selected === index;
        const isDisabled = Boolean(tab.disabled);
        const showLabel = expandSelectedLabel && isSelected;

        return (
          <button
            key={tab.title}
            type="button"
            onClick={() => handleSelect(index)}
            aria-current={isSelected ? "true" : undefined}
            aria-disabled={isDisabled || undefined}
            aria-label={
              isDisabled
                ? `${tab.title} — not available yet`
                : tab.title
            }
            title={isDisabled ? undefined : tab.title}
            className={cn(
              "relative inline-flex items-center justify-center font-medium tracking-tight transition-colors duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-1 focus-visible:ring-offset-cream",
              compact
                ? "h-7 min-w-0 rounded-md text-[11px]"
                : "rounded-lg py-1.5 text-[12px]",
              // Sizing is static, not animated — see the note at the top of this
              // file. One layout pass per switch instead of one per frame.
              compact
                ? showLabel
                  ? "gap-[.35rem] px-2"
                  : "gap-0 px-1"
                : showLabel
                  ? "gap-2 px-3"
                  : "gap-0 px-2",
              compact && !showLabel && "flex-1 px-0",
              compact && showLabel && "shrink-0",
              isSelected
                ? cn(
                    "bg-ink/[0.05]",
                    compact && showLabel && "shrink-0",
                    activeColor,
                  )
                : isDisabled
                  ? "cursor-help text-ink/30 hover:bg-ink/[0.03] hover:text-ink/40"
                  : "text-ink hover:text-ink/80",
              !isSelected && !isDisabled && "hover:bg-ink/[0.04]",
            )}
          >
            <span className="relative inline-flex shrink-0 items-center justify-center">
              <Icon
                size={compact ? 15 : 18}
                strokeWidth={isSelected ? 2.25 : 1.75}
                className={cn(
                  "transition-[fill,color] duration-150",
                  isSelected ? "fill-current" : "fill-none",
                )}
                aria-hidden
              />
              {tab.trailing ? (
                <span
                  className={cn(
                    "absolute text-ink/40",
                    compact ? "-right-0.5 -top-0.5" : "-right-1 -top-1",
                  )}
                >
                  {tab.trailing}
                </span>
              ) : null}
            </span>
            <AnimatePresence initial={false}>
              {showLabel ? (
                <motion.span
                  initial={labelEnter.initial}
                  animate={labelEnter.animate}
                  exit={labelEnter.exit}
                  transition={enterTransition}
                  // Opacity and translate only — both compositor properties, so
                  // this never triggers layout while it runs.
                  className={cn(
                    "whitespace-nowrap",
                    compact ? "text-[11px]" : "text-[12px]",
                  )}
                >
                  {tab.title}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
