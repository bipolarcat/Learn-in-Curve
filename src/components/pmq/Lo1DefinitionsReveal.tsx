"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { KeyDefinition } from "@/types/pmq";
import { cn } from "@/lib/utils";

/** 21st.dev ddoemonn accordion (23530): snappy spring + quint fade. */
const EASE = [0.23, 1, 0.32, 1] as const;
const EXIT_EASE = [0.4, 0, 1, 1] as const;
const DISCLOSE = {
  type: "spring",
  stiffness: 480,
  damping: 40,
  mass: 0.6,
} as const;
const CHEVRON = {
  type: "spring",
  stiffness: 700,
  damping: 46,
  mass: 0.5,
} as const;
const GRID_COLS = 2;

const termClass =
  "font-body text-[12px] font-semibold leading-snug tracking-tight text-ink text-pretty break-words sm:text-[13px] sm:leading-tight";
const bodyClass =
  "font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90";
const fieldLabelClass =
  "font-body text-[12px] font-semibold tracking-tight";

function useAutoHeight(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () => {
      setHeight(el.getBoundingClientRect().height);
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  return { ref, height };
}

function DefinitionPlate({
  def,
  index,
  open,
  onToggle,
  onKeyDown,
  buttonRef,
  buttonId,
  panelId,
}: {
  def: KeyDefinition;
  index: number;
  open: boolean;
  onToggle: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
  buttonId: string;
  panelId: string;
}) {
  const reduced = useReducedMotion();
  const { ref, height } = useAutoHeight(open);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.inert = !open;
  }, [ref, open]);

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-black/[0.08] bg-paper dark:border-white/[0.12]",
        open && "col-span-2",
      )}
    >
      <h3 className="m-0">
        <button
          id={buttonId}
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="group flex w-full min-h-11 items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:bg-ink/[0.07] sm:gap-2 sm:px-3 sm:py-2.5"
        >
          <span
            className={cn(
              "inline-flex size-6 shrink-0 items-center justify-center rounded-full font-body text-[10px] font-bold tabular-nums leading-none tracking-tight transition-colors duration-150 ease-[var(--ease-out-quint)] sm:size-[1.85em] sm:text-[13px]",
              open ? "bg-teal text-paper" : "bg-teal/20 text-teal",
            )}
            style={
              open
                ? {
                    backgroundColor: "var(--teal)",
                    color: "rgb(var(--paper-rgb))",
                  }
                : {
                    backgroundColor:
                      "color-mix(in srgb, var(--teal) 22%, transparent)",
                    color: "var(--teal)",
                  }
            }
            aria-hidden
          >
            {index}
          </span>
          <span
            className={cn(
              "min-w-0 flex-1 transition-colors duration-150 ease-[var(--ease-out-quint)]",
              termClass,
              "line-clamp-2 sm:line-clamp-1",
              index >= 9 && "sm:line-clamp-2",
              "group-hover:text-orange",
            )}
          >
            {def.term}
          </span>
          <motion.span
            className="hidden shrink-0 text-ink/45 sm:inline-flex"
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduced ? { duration: 0 } : CHEVRON}
            aria-hidden
          >
            <ChevronDown className="size-3.5" strokeWidth={2} />
          </motion.span>
        </button>
      </h3>

      <motion.div
        initial={false}
        animate={{ height: open ? height : 0 }}
        transition={reduced ? { duration: 0 } : DISCLOSE}
        className="overflow-hidden"
      >
        <div
          ref={ref}
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
        >
          <div className="grid gap-3 border-t border-black/[0.08] px-3.5 pb-4 pt-3 dark:border-white/[0.12]">
            <motion.div
              initial={false}
              animate={
                open
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : {
                      opacity: 0,
                      y: reduced ? 0 : 4,
                      filter: reduced ? "blur(0px)" : "blur(4px)",
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : open
                    ? { duration: 0.18, delay: 0.04, ease: EASE }
                    : { duration: 0.14, ease: EXIT_EASE }
              }
            >
              <p className={`${fieldLabelClass} text-ink/70`}>Plain English</p>
              <p className={`mt-1 ${bodyClass}`}>{def.plain_english}</p>
            </motion.div>
            <motion.div
              initial={false}
              animate={
                open
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : {
                      opacity: 0,
                      y: reduced ? 0 : 4,
                      filter: reduced ? "blur(0px)" : "blur(4px)",
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : open
                    ? { duration: 0.18, delay: 0.08, ease: EASE }
                    : { duration: 0.14, ease: EXIT_EASE }
              }
              className="rounded-lg bg-teal/[0.08] px-3 py-2.5 dark:bg-teal/[0.14]"
            >
              <p className={`${fieldLabelClass} text-teal`}>APM definition</p>
              <p className={`mt-1 ${bodyClass}`}>{def.apm_definition}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * LO1-only key definitions: term plates, one open, click to uncover.
 * Height spring from 21st.dev accordion (ddoemonn, 23530). Content fade
 * uses the same quint in / quart out. APM sits on a teal plate.
 */
export function Lo1DefinitionsReveal({
  definitions,
}: {
  definitions: KeyDefinition[];
}) {
  const baseId = useId();
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const ids = useMemo(() => definitions.map((d) => d.term), [definitions]);

  const move = useCallback(
    (from: string, delta: number, edge: "first" | "last" | null) => {
      if (ids.length === 0) return;
      const at = ids.indexOf(from);
      if (at < 0) return;
      const next =
        edge === "first"
          ? 0
          : edge === "last"
            ? ids.length - 1
            : (at + delta + ids.length) % ids.length;
      buttons.current.get(ids[next] ?? "")?.focus();
    },
    [ids],
  );

  const bindRef = useCallback((term: string) => {
    return (node: HTMLButtonElement | null) => {
      if (node) buttons.current.set(term, node);
      else buttons.current.delete(term);
    };
  }, []);

  if (definitions.length === 0) return null;

  return (
    <div>
      <p className="mb-3 font-body text-sm font-medium leading-snug text-pretty text-ink/70">
        Reveal a term to see its Plain English and APM definitions.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5" aria-label="Key definitions">
        {definitions.map((def, index) => (
          <DefinitionPlate
            key={def.term}
            def={def}
            index={index + 1}
            open={openTerm === def.term}
            buttonId={`${baseId}-term-${index}`}
            panelId={`${baseId}-panel-${index}`}
            buttonRef={bindRef(def.term)}
            onToggle={() => {
              setOpenTerm((current) =>
                current === def.term ? null : def.term,
              );
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                move(def.term, 1, null);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                move(def.term, -1, null);
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                move(def.term, GRID_COLS, null);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                move(def.term, -GRID_COLS, null);
              } else if (event.key === "Home") {
                event.preventDefault();
                move(def.term, 0, "first");
              } else if (event.key === "End") {
                event.preventDefault();
                move(def.term, 0, "last");
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
