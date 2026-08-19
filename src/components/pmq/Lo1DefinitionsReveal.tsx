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

const EASE = [0.22, 1, 0.36, 1] as const;
const DISCLOSE = { duration: 0.22, ease: EASE } as const;
const REVEAL = { duration: 0.2, ease: EASE } as const;
const GRID_COLS = 2;

const termClass =
  "font-body text-sm font-semibold leading-snug tracking-tight text-ink text-pretty break-words sm:text-base";
const bodyClass =
  "font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90";
const fieldLabelClass =
  "font-body text-[12px] font-semibold tracking-tight text-ink/70";

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
          className="group flex w-full min-h-11 items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:bg-ink/[0.07] sm:gap-3 sm:px-3.5 sm:py-3"
        >
          <span
            className={cn(
              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-body text-[11px] font-bold tabular-nums tracking-tight transition-colors duration-200 ease-[var(--ease-out-quint)]",
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
              "group-hover:text-orange",
            )}
          >
            {def.term}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-ink/45 transition-transform duration-200 ease-[var(--ease-out-quint)] motion-reduce:transition-none",
              open && "rotate-180 text-ink/55",
            )}
            strokeWidth={2}
            aria-hidden
          />
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
                      y: reduced ? 0 : 6,
                      filter: reduced ? "blur(0px)" : "blur(5px)",
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { ...REVEAL, delay: open ? 0.04 : 0 }
              }
            >
              <p className={fieldLabelClass}>Plain English</p>
              <p className={`mt-1 ${bodyClass}`}>{def.plain_english}</p>
            </motion.div>
            <motion.div
              initial={false}
              animate={
                open
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : {
                      opacity: 0,
                      y: reduced ? 0 : 6,
                      filter: reduced ? "blur(0px)" : "blur(5px)",
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { ...REVEAL, delay: open ? 0.1 : 0 }
              }
              className="border-t border-black/[0.06] pt-3 dark:border-white/[0.1]"
            >
              <p className={fieldLabelClass}>APM definition</p>
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
 * Height ease from the LO accordion; blur-in on the two definition fields.
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
      <div className="grid grid-cols-2 gap-2.5" aria-label="Key definitions">
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
