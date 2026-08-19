"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";
import { CoreContentBlock } from "@/components/pmq/CoreContentBlock";
import { cn } from "@/lib/utils";

const headingClass =
  "w-full min-w-0 font-body text-lg font-semibold leading-snug tracking-tight text-ink";

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

function OutcomePlate({
  block,
  open,
  seen,
  onToggle,
  onKeyDown,
  buttonRef,
  buttonId,
  panelId,
}: {
  block: CoreContentBlockType;
  open: boolean;
  seen: boolean;
  onToggle: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
  buttonId: string;
  panelId: string;
}) {
  const { ref, height } = usePanelHeight();
  const code = block.outcome_code.toLowerCase();
  const takeaway = block.key_takeaway?.trim() ?? "";

  return (
    <div className="min-w-0 rounded-xl border border-black/[0.08] bg-paper dark:border-white/[0.12]">
      <h3 className="m-0">
        <button
          id={buttonId}
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          onPointerUp={(event) => {
            if (event.pointerType === "touch") event.currentTarget.blur();
          }}
          onKeyDown={onKeyDown}
          className="group flex w-full min-h-11 items-start gap-2 py-2.5 pl-2.5 pr-2.5 text-left transition-colors duration-150 ease-[var(--ease-out-quint)] touch-manipulation [-webkit-tap-highlight-color:transparent] active:bg-ink/[0.06] [@media(hover:hover)]:hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:px-3"
        >
          <span
            className={cn(
              "mt-2 block h-2 w-2 min-h-2 min-w-2 shrink-0 rounded-[2px] bg-teal/55",
              (open || seen) && "bg-teal",
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                headingClass,
                "transition-colors duration-150 ease-[var(--ease-out-quint)] [@media(hover:hover)]:group-hover:text-orange",
              )}
            >
              <span className="mr-2 inline tabular-nums" aria-hidden>
                {code})
              </span>
              <span className="sr-only">{code}): </span>
              {block.outcome_title}
            </span>
            {!open && takeaway ? (
              <span className="mt-1 block font-body text-sm font-normal leading-snug text-pretty text-ink/70 line-clamp-2">
                {takeaway}
              </span>
            ) : null}
          </span>
          <svg
            className={cn(
              "mt-2.5 size-3.5 shrink-0 text-ink/45 transition-transform duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:duration-0",
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
          <div className="border-t border-black/[0.08] px-3.5 pb-4 pt-3 dark:border-white/[0.12] [&_.pmq-markdown]:mt-0 [&_.pmq-markdown]:w-full [&_.pmq-markdown_p]:w-full [&_.pmq-markdown_ul]:w-full [&_.pmq-markdown_ol]:w-full">
            <CoreContentBlock block={block} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LO1-only core content. One open outcome at a time. Closed plates show the
 * unused key_takeaway. Same teal seen-mark and 220ms clip as definitions.
 */
export function Lo1CoreContentReveal({
  blocks,
}: {
  blocks: CoreContentBlockType[];
}) {
  const baseId = useId();
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const ids = useMemo(() => blocks.map((b) => b.outcome_code), [blocks]);

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

  const bindRef = useCallback((code: string) => {
    return (node: HTMLButtonElement | null) => {
      if (node) buttons.current.set(code, node);
      else buttons.current.delete(code);
    };
  }, []);

  if (blocks.length === 0) return null;

  return (
    <div>
      <p className="mb-3 font-body text-sm font-medium leading-snug text-pretty text-ink/70">
        Open an outcome to read the core notes. Teal marks stay filled after you
        have opened them.
      </p>
      <div className="grid gap-2.5" aria-label="Core content outcomes">
        {blocks.map((block, index) => (
          <OutcomePlate
            key={block.outcome_code}
            block={block}
            open={openCode === block.outcome_code}
            seen={seen.has(block.outcome_code)}
            buttonId={`${baseId}-outcome-${index}`}
            panelId={`${baseId}-panel-${index}`}
            buttonRef={bindRef(block.outcome_code)}
            onToggle={() => {
              setSeen((prev) => {
                if (prev.has(block.outcome_code)) return prev;
                const next = new Set(prev);
                next.add(block.outcome_code);
                return next;
              });
              setOpenCode((current) =>
                current === block.outcome_code ? null : block.outcome_code,
              );
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                move(block.outcome_code, 1, null);
              } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                move(block.outcome_code, -1, null);
              } else if (event.key === "Home") {
                event.preventDefault();
                move(block.outcome_code, 0, "first");
              } else if (event.key === "End") {
                event.preventDefault();
                move(block.outcome_code, 0, "last");
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
