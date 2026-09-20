"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;

const SEG =
  "inline-flex items-center justify-center gap-1.5 px-3 py-[7px] text-center font-body text-[13px] font-semibold leading-[18px] tracking-[-0.01em] whitespace-nowrap sm:px-3.5";

export type SegmentedOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** Optional leading mark (icon, badge). Mirrored in the thumb mask. */
  icon?: ReactNode;
};

export type SegmentedControlProps = {
  options: SegmentedOption[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  /**
   * When set with tablist semantics, each option gets `id={`${idPrefix}-${value}`}`
   * and `aria-controls={panelId}` for pairing with a tabpanel.
   */
  idPrefix?: string;
  panelId?: string;
  /** `tablist` when switching panels; default `radiogroup` for a single choice. */
  semantics?: "radiogroup" | "tablist";
};

/**
 * Sliding segmented control — 21st.dev pattern, LIC tokens (teal thumb, ink track).
 * Uses `framer-motion` (already in the app); do not add the separate `motion` package.
 */
export function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  className = "",
  idPrefix,
  panelId,
  semantics = "radiogroup",
}: SegmentedControlProps) {
  const reactId = useId();
  const prefix = idPrefix ?? `seg-${reactId}`;
  const asTabs = semantics === "tablist";
  const count = Math.max(1, options.length);
  const template = `repeat(${count}, minmax(0, 1fr))`;

  const [internal, setInternal] = useState(
    () => defaultValue ?? options[0]?.value ?? "",
  );
  const [hovered, setHovered] = useState(-1);

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const found = options.findIndex((o) => o.value === current);
  const index = found < 0 ? 0 : found;

  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const emit = useRef(onValueChange);
  emit.current = onValueChange;

  const reduced = useReducedMotion();
  const pos = useMotionValue(index);
  const thumbX = useTransform(pos, (v) => `${v * 100}%`);
  const maskX = useTransform(pos, (v) => `${v * -100}%`);

  useEffect(() => {
    if (reduced) {
      pos.set(index);
      return;
    }
    const controls = animate(pos, index, CELL);
    return () => controls.stop();
  }, [index, reduced, pos]);

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      if (next !== current) emit.current?.(next);
    },
    [controlled, current],
  );

  const seek = useCallback(
    (from: number, dir: number) => {
      let i = from;
      for (let k = 0; k < count; k++) {
        i = (i + dir + count) % count;
        if (!options[i]?.disabled) return i;
      }
      return from;
    },
    [count, options],
  );

  const go = useCallback(
    (i: number) => {
      const option = options[i];
      if (!option || option.disabled) return;
      buttons.current[i]?.focus();
      select(option.value);
    },
    [options, select],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      go(seek(i, 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      go(seek(i, -1));
    } else if (e.key === "Home") {
      e.preventDefault();
      go(seek(count - 1, 1));
    } else if (e.key === "End") {
      e.preventDefault();
      go(seek(0, -1));
    }
  };

  return (
    <div
      role={asTabs ? "tablist" : "radiogroup"}
      aria-label={label}
      className={cn(
        "relative inline-block w-full max-w-md select-none rounded-[10px] border border-ink/10 bg-ink/[0.045] p-[3px] shadow-[inset_0_1px_2px_rgb(var(--ink-rgb)_/_0.08)] sm:w-auto sm:min-w-[18rem]",
        className,
      )}
    >
      <div
        className="relative grid"
        style={{ gridTemplateColumns: template, touchAction: "manipulation" }}
      >
        {options.map((option, i) => (
          <span
            key={`ghost-${option.value}`}
            aria-hidden
            className={cn(
              SEG,
              option.disabled
                ? "text-ink/25"
                : hovered === i && i !== index
                  ? "text-ink/75"
                  : "text-ink/50",
            )}
          >
            {option.icon}
            {option.label}
          </span>
        ))}

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden rounded-[7px] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.12)] ring-1 ring-ink/10"
          style={{ width: `${100 / count}%`, x: thumbX }}
          initial={false}
        >
          <motion.div
            className="absolute inset-0"
            style={{ x: maskX }}
            initial={false}
          >
            <div
              className="absolute inset-y-0 left-0 grid"
              style={{
                width: `${count * 100}%`,
                gridTemplateColumns: template,
              }}
            >
              {options.map((option) => (
                <span
                  key={`thumb-${option.value}`}
                  className={cn(SEG, "text-ink")}
                >
                  {option.icon}
                  {option.label}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: template }}
          onPointerLeave={() => setHovered(-1)}
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              type="button"
              id={`${prefix}-${option.value}`}
              role={asTabs ? "tab" : "radio"}
              {...(asTabs
                ? {
                    "aria-selected": i === index,
                    "aria-controls": panelId,
                  }
                : {
                    "aria-checked": i === index,
                  })}
              aria-disabled={option.disabled || undefined}
              tabIndex={i === index ? 0 : -1}
              onClick={() => !option.disabled && select(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onPointerEnter={() => !option.disabled && setHovered(i)}
              className="cursor-default rounded-[7px] outline-none focus-visible:bg-paper/50 focus-visible:shadow-[inset_0_0_0_2px_rgb(var(--ink-rgb)_/_0.28)]"
            >
              <span className="sr-only">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SegmentedControl;
