"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyDefinition } from "@/types/pmq";
import { cn } from "@/lib/utils";

const GRID_COLS = 2;

const termClass =
  "font-body text-[13px] font-semibold leading-tight tracking-tight text-ink text-pretty break-words";
const bodyClass =
  "font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90";
const fieldLabelClass =
  "font-body text-[12px] font-semibold tracking-tight";

function usePanelHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const read = () => {
      const next = el.scrollHeight;
      if (next > 0) setHeight(next);
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
  const { ref, height } = usePanelHeight();

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-black/[0.08] bg-paper dark:border-white/[0.12]",
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
          className="group flex w-full min-h-11 items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:bg-ink/[0.07]"
        >
          <span
            className={cn(
              "inline-flex size-[1.85em] shrink-0 items-center justify-center rounded-full font-body text-[13px] font-bold tabular-nums leading-none tracking-tight",
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
              index >= 9 ? "line-clamp-2" : "line-clamp-1",
              "group-hover:text-orange",
            )}
          >
            {def.term}
          </span>
          <svg
            className={cn(
              "size-3.5 shrink-0 text-ink/45 transition-transform duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:duration-0",
              open && "rotate-180",
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9L12 15L18 9" />
          </svg>
        </button>
      </h3>

      <div
        className="overflow-hidden transition-[height] duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:duration-0"
        style={{ height: open ? (height > 0 ? height : "auto") : 0 }}
      >
        <div
          ref={ref}
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          <div className="grid gap-3 border-t border-black/[0.08] px-3.5 pb-4 pt-3 dark:border-white/[0.12]">
            <div>
              <p className={`${fieldLabelClass} text-ink/70`}>Plain English</p>
              <p className={`mt-1 ${bodyClass}`}>{def.plain_english}</p>
            </div>
            <div className="rounded-lg bg-teal/[0.08] px-3 py-2.5 dark:bg-teal/[0.14]">
              <p className={`${fieldLabelClass} text-teal`}>APM definition</p>
              <p className={`mt-1 ${bodyClass}`}>{def.apm_definition}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LO1-only key definitions. One clip animation on every viewport: measured
 * height, 220ms ease-out-quint (same curve as SiteHeaderMenu).
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
      <div
        className="grid grid-cols-2 gap-2.5"
        aria-label="Key definitions"
      >
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
