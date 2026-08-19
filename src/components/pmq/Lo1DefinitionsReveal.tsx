"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { KeyDefinition } from "@/types/pmq";
import { cn } from "@/lib/utils";

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

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const termClass =
  "font-body text-[13px] font-semibold leading-snug tracking-tight text-ink sm:text-base";
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
  panelId,
}: {
  def: KeyDefinition;
  index: number;
  open: boolean;
  onToggle: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
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
        "min-w-0 overflow-hidden rounded-xl border border-black/[0.08] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04)] dark:border-white/[0.12]",
        open && "col-span-2",
      )}
    >
      <h3 className="m-0">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="flex w-full min-h-11 items-center gap-2 px-2.5 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:gap-2.5 sm:px-3.5 sm:py-3"
        >
          <span
            className={cn(
              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-body text-[10px] font-bold tabular-nums tracking-tight transition-colors duration-200 ease-[var(--ease-out-quint)]",
              open
                ? "bg-[#1B6560] text-[#FBF3E1]"
                : "bg-[#1B6560]/25 text-[#1B6560]/60",
            )}
            aria-hidden
          >
            {index}
          </span>
          <span className={`min-w-0 flex-1 ${termClass}`}>{def.term}</span>
          <motion.span
            className="inline-flex shrink-0 text-ink/40"
            initial={false}
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduced ? { duration: 0 } : CHEVRON}
            aria-hidden
          >
            <ChevronDown className="size-4" strokeWidth={2} />
          </motion.span>
        </button>
      </h3>

      <motion.div
        initial={false}
        animate={{ height: open ? height : 0 }}
        transition={reduced ? { duration: 0 } : DISCLOSE}
        className="overflow-hidden"
      >
        <div ref={ref} id={panelId} role="region">
          <div className="space-y-3 border-t border-black/[0.08] px-3.5 pb-3.5 pt-3 dark:border-white/[0.12]">
            <motion.div
              initial={false}
              animate={
                open
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : {
                      opacity: 0,
                      y: reduced ? 0 : 8,
                      filter: reduced ? "blur(0px)" : "blur(6px)",
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.22, delay: open ? 0.04 : 0, ease: BLUR_EASE }
              }
            >
              <p className={`${fieldLabelClass} text-ink/60`}>Plain English</p>
              <p className={`mt-1 ${bodyClass}`}>{def.plain_english}</p>
            </motion.div>
            <motion.div
              initial={false}
              animate={
                open
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : {
                      opacity: 0,
                      y: reduced ? 0 : 8,
                      filter: reduced ? "blur(0px)" : "blur(6px)",
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.22, delay: open ? 0.12 : 0, ease: BLUR_EASE }
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
 * Height spring from 21st.dev accordion (ddoemonn, 23530). Blur-in from
 * Blur Out Up (framecn, 19317).
 */
export function Lo1DefinitionsReveal({
  definitions,
}: {
  definitions: KeyDefinition[];
}) {
  const baseId = useId();
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  const ids = definitions.map((d) => d.term);

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

  return (
    <div>
      <p className="mb-3 font-body text-[13px] font-medium leading-snug text-pretty text-ink/55">
        Reveal a term to see its Plain English and APM definitions.
      </p>
      <div
        className="grid grid-cols-2 gap-2"
        aria-label="Key definitions"
      >
        {definitions.map((def, index) => (
          <DefinitionPlate
            key={def.term}
            def={def}
            index={index + 1}
            open={openTerm === def.term}
            panelId={`${baseId}-panel-${index}`}
            buttonRef={bindRef(def.term)}
            onToggle={() => {
              setOpenTerm((current) =>
                current === def.term ? null : def.term,
              );
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                move(def.term, 1, null);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                move(def.term, -1, null);
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
