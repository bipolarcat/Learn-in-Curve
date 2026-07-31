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
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "0.75rem" : ".5rem",
    paddingRight: isSelected ? "0.75rem" : ".5rem",
  }),
};

const compactButtonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".25rem",
    paddingRight: ".25rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".35rem" : 0,
    paddingLeft: isSelected ? ".5rem" : ".25rem",
    paddingRight: isSelected ? ".5rem" : ".25rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.05, type: "spring" as const, bounce: 0, duration: 0.45 };

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
  const motionTransition = reduceMotion ? { duration: 0 } : transition;
  const compact = size === "compact";

  useOnClickOutside(outsideClickRef as React.RefObject<HTMLElement>, () => {
    if (!clearOnOutsideClick) return;
    if (!isControlled) setUncontrolled(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    const item = tabs[index];
    if (!item || item.type === "separator" || item.disabled) return;
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
          <motion.button
            key={tab.title}
            type="button"
            variants={compact ? compactButtonVariants : buttonVariants}
            initial={false}
            animate="animate"
            custom={isSelected}
            onClick={() => handleSelect(index)}
            disabled={isDisabled}
            aria-current={isSelected ? "true" : undefined}
            aria-disabled={isDisabled || undefined}
            aria-label={tab.title}
            title={tab.title}
            transition={motionTransition}
            className={cn(
              "relative inline-flex items-center justify-center font-medium tracking-tight transition-colors duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-1 focus-visible:ring-offset-cream",
              compact
                ? "h-7 min-w-0 rounded-md text-[11px]"
                : "rounded-lg py-1.5 text-[12px]",
              compact && !showLabel && "flex-1 px-0",
              compact && showLabel && "shrink-0",
              isSelected
                ? cn(
                    "bg-ink/[0.05]",
                    compact && showLabel && "shrink-0",
                    activeColor,
                  )
                : isDisabled
                  ? "cursor-not-allowed text-ink/30"
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
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={motionTransition}
                  className={cn(
                    "overflow-hidden whitespace-nowrap",
                    compact ? "text-[11px]" : "text-[12px]",
                  )}
                >
                  {tab.title}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
