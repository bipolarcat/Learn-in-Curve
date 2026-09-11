"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Layers, Landmark, Milestone, Scale } from "lucide-react";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";
import { CoreContentBlock } from "@/components/pmq/CoreContentBlock";
import { Lo1SpineScrollbar } from "@/components/pmq/Lo1SpineScrollbar";
import {
  OutcomeCodeBadge,
  type OutcomeCodeBadgeVariant,
} from "@/components/pmq/OutcomeCodeBadge";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { OutcomeStampSwitcher } from "@/components/pmq/OutcomeStampSwitcher";
import { cn } from "@/lib/utils";

/** Short rail labels for LO1 outcomes (Magic Patterns demo). */
const LO1_SHORT_TITLE: Record<string, string> = {
  "1a": "Life cycles",
  "1b": "Extended life cycle",
  "1c": "Context & culture",
  "1d": "Trade-offs",
};

/** Short rail labels for LO3 outcomes. */
const LO3_SHORT_TITLE: Record<string, string> = {
  "3a": "Why & impact",
  "3b": "Monitor & report",
};

const OUTCOME_ICONS = [Layers, Milestone, Landmark, Scale] as const;

function shortTitleFor(
  block: CoreContentBlockType,
  map?: Record<string, string>,
) {
  const code = block.outcome_code.toLowerCase();
  return map?.[code] ?? block.outcome_title;
}

function sectionTop(root: HTMLElement, el: HTMLElement) {
  return (
    el.getBoundingClientRect().top -
    root.getBoundingClientRect().top +
    root.scrollTop
  );
}

function OutcomeLedger({
  blocks,
  activeIndex,
  seen,
  onSelect,
  shortTitles,
}: {
  blocks: CoreContentBlockType[];
  activeIndex: number;
  seen: Set<number>;
  onSelect: (index: number) => void;
  shortTitles?: Record<string, string>;
}) {
  return (
    <nav aria-label="Learning outcomes" className="relative pl-5">
      <span
        className="absolute bottom-2 left-1 top-2 w-px bg-teal/25"
        aria-hidden
      />
      <ol className="m-0 list-none p-0">
        {blocks.map((block, index) => {
          const code = block.outcome_code.toLowerCase();
          const isCurrent = index === activeIndex;
          const isSeen = !isCurrent && seen.has(index);

          return (
            <li key={block.outcome_code} className="relative">
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={isCurrent ? "step" : undefined}
                className="group flex min-h-11 w-full items-center gap-2.5 py-2.5 pr-1 text-left touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-md"
              >
                <span
                  className={cn(
                    "absolute -left-[17px] top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] transition-[background-color,border-color,width,height] duration-[220ms] ease-[var(--ease-out-quint)] motion-reduce:transition-none",
                    isCurrent
                      ? "size-[9px] border-orange bg-orange"
                      : isSeen
                        ? "size-[7px] border-teal bg-teal"
                        : "size-[7px] border-teal bg-paper group-hover:bg-teal/25 dark:bg-paper",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "inline-flex min-h-5 min-w-[1.75rem] items-center justify-center rounded-[0.2rem] px-1 font-body text-[12px] font-bold uppercase tabular-nums leading-none tracking-tight transition-colors duration-[220ms] motion-reduce:transition-none",
                    isCurrent
                      ? "bg-orange/15 text-ink"
                      : "text-teal",
                  )}
                >
                  {code}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 font-body text-xs leading-snug transition-colors duration-[220ms] motion-reduce:transition-none",
                    isCurrent
                      ? "font-bold text-ink"
                      : isSeen
                        ? "font-semibold text-ink/75"
                        : "font-semibold text-ink/70 group-hover:text-ink",
                  )}
                >
                  {shortTitleFor(block, shortTitles)}
                </span>
                <span className="sr-only">
                  {block.outcome_title}.{" "}
                  {isCurrent
                    ? "Current outcome"
                    : isSeen
                      ? "Seen"
                      : "Upcoming"}
                  .
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function OutcomeMarginRail({
  blocks,
  activeIndex,
  seen,
  onSelect,
  shortTitles,
}: {
  blocks: CoreContentBlockType[];
  activeIndex: number;
  seen: Set<number>;
  onSelect: (index: number) => void;
  shortTitles?: Record<string, string>;
}) {
  const active = blocks[activeIndex]!;

  return (
    <div className="min-w-0 lg:pr-6">
      <OutcomeLedger
        blocks={blocks}
        activeIndex={activeIndex}
        seen={seen}
        onSelect={onSelect}
        shortTitles={shortTitles}
      />

      <div
        className="mb-4 mt-5 h-px bg-black/[0.08] dark:bg-white/[0.12]"
        aria-hidden
      />

      <h3 className="font-body text-[22px] font-semibold leading-[1.3] tracking-tight text-ink lg:text-[23px]">
        {active.outcome_title}
      </h3>
    </div>
  );
}

/**
 * Notebook Learn shell (LO1 design): outcome rail, spine scrollbar, single
 * scroll with jump-to. Table behaviour is opt-in so LO3 can keep study tables
 * + recall activities while sharing this chrome.
 */
export function Lo1CoreContentStudy({
  blocks,
  studyTables = false,
  activities = false,
  shortTitles,
  badgeVariant = "outline",
  focusOutcomeCode = null,
  onFocusOutcomeConsumed,
}: {
  blocks: CoreContentBlockType[];
  studyTables?: boolean;
  activities?: boolean;
  shortTitles?: Record<string, string>;
  /** LO2 trial: ink-stamp outcome codes. */
  badgeVariant?: OutcomeCodeBadgeVariant;
  /** Orient badge jump target (e.g. "2a"). */
  focusOutcomeCode?: string | null;
  onFocusOutcomeConsumed?: () => void;
}) {
  const titleMap = shortTitles ?? LO1_SHORT_TITLE;
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!focusOutcomeCode) return 0;
    const idx = blocks.findIndex(
      (block) =>
        block.outcome_code.toLowerCase() === focusOutcomeCode.toLowerCase(),
    );
    return idx >= 0 ? idx : 0;
  });
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const readerScrollRef = useRef<HTMLDivElement>(null);
  const sectionEls = useRef(new Map<string, HTMLElement>());
  const jumping = useRef(false);

  const active = blocks[activeIndex];
  const jumpHint = blocks
    .map((block) => block.outcome_code.toLowerCase())
    .join("–");

  const markSeen = useCallback((index: number) => {
    setSeen((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });
  }, []);

  const registerSection = useCallback((code: string, node: HTMLElement | null) => {
    if (node) sectionEls.current.set(code, node);
    else sectionEls.current.delete(code);
  }, []);

  const handleSelect = useCallback(
    (index: number) => {
      if (index !== activeIndex) markSeen(activeIndex);
      setActiveIndex(index);
      const root = readerScrollRef.current;
      if (!root || root.clientHeight === 0) return;
      const block = blocks[index];
      const el = block
        ? sectionEls.current.get(block.outcome_code.toLowerCase())
        : undefined;
      if (!el) return;
      jumping.current = true;
      root.scrollTo({
        top: Math.max(0, sectionTop(root, el) - 8),
        behavior: "smooth",
      });
      window.setTimeout(() => {
        jumping.current = false;
      }, 560);
    },
    [activeIndex, blocks, markSeen],
  );

  useEffect(() => {
    if (!focusOutcomeCode) return;
    const code = focusOutcomeCode.toLowerCase();
    const idx = blocks.findIndex(
      (block) => block.outcome_code.toLowerCase() === code,
    );
    onFocusOutcomeConsumed?.();
    if (idx < 0) return;

    setActiveIndex(idx);
    // Desktop notebook sections register after paint; retry scroll once.
    const scrollToFocused = () => {
      const root = readerScrollRef.current;
      const el = sectionEls.current.get(code);
      if (!root || root.clientHeight === 0 || !el) return false;
      jumping.current = true;
      root.scrollTo({
        top: Math.max(0, sectionTop(root, el) - 8),
        behavior: "smooth",
      });
      window.setTimeout(() => {
        jumping.current = false;
      }, 560);
      return true;
    };
    if (!scrollToFocused()) {
      requestAnimationFrame(() => {
        scrollToFocused();
      });
    }
  }, [focusOutcomeCode, blocks, onFocusOutcomeConsumed]);

  useEffect(() => {
    const root = readerScrollRef.current;
    if (!root) return;

    const onScroll = () => {
      if (jumping.current) return;

      const marker = root.scrollTop + 36;
      if (root.clientHeight === 0) return;
      let nextIndex = 0;
      blocks.forEach((block, index) => {
        const el = sectionEls.current.get(block.outcome_code.toLowerCase());
        if (el && sectionTop(root, el) <= marker) nextIndex = index;
      });

      setActiveIndex((current) => {
        if (nextIndex === current) return current;
        if (nextIndex > current) markSeen(current);
        return nextIndex;
      });
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [blocks, markSeen]);

  if (blocks.length === 0 || !active) return null;

  const contentProps = {
    studyTables,
    activities,
  };

  return (
    <section
      className="min-w-0 overflow-hidden rounded-2xl border border-black/[0.08] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] dark:border-white/[0.12]"
      aria-label="Core content"
    >
      <div className="lg:hidden">
        <header
          className={cn(
            "sticky top-0 z-10 bg-paper px-3 pb-2.5 pt-3",
            badgeVariant === "stamp"
              ? ""
              : "border-b border-black/[0.08] dark:border-white/[0.12]",
          )}
        >
          {badgeVariant === "stamp" ? (
            <>
              <div className="mb-2.5 flex min-w-0 items-center gap-2">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-teal/10"
                  aria-hidden
                >
                  <Layers className="size-3.5 text-teal" strokeWidth={1.8} />
                </span>
                <h2 className="m-0 font-body text-[14px] font-semibold leading-none tracking-tight text-ink">
                  Core content
                </h2>
              </div>
              <nav aria-label="Learning outcomes">
                <OutcomeStampSwitcher
                  options={blocks.map((block) => ({
                    code: block.outcome_code,
                    title: block.outcome_title,
                  }))}
                  value={activeIndex}
                  onChange={handleSelect}
                  badgeVariant={badgeVariant}
                />
              </nav>
              <h3 className="m-0 mt-3 min-w-0 font-body text-[20px] font-semibold leading-[1.25] tracking-tight text-ink">
                <span className="sr-only">{active.outcome_code}: </span>
                {active.outcome_title}
              </h3>
            </>
          ) : (
            <>
              <h2 className="m-0 flex min-w-0 items-center gap-2 font-body text-[13px] font-semibold leading-snug tracking-tight text-ink">
                <OutcomeCodeBadge
                  code={active.outcome_code}
                  variant={badgeVariant}
                />
                <span className="min-w-0 text-ink">
                  <span className="sr-only">{active.outcome_code}: </span>
                  {active.outcome_title}
                </span>
              </h2>
              <p className="mt-1.5 font-body text-[12px] leading-snug text-ink/75">
                One outcome at a time · tap to switch
              </p>
              <nav aria-label="Learning outcomes" className="mt-2.5">
                <ExpandableTabs
                  tabs={blocks.map((block, index) => ({
                    title: shortTitleFor(block, titleMap),
                    icon: OUTCOME_ICONS[index % OUTCOME_ICONS.length] ?? Layers,
                  }))}
                  value={activeIndex}
                  clearOnOutsideClick={false}
                  expandSelectedLabel
                  size="touch"
                  activeColor="text-ink"
                  className="w-full"
                  onChange={(index) => {
                    if (index == null) return;
                    handleSelect(index);
                  }}
                />
              </nav>
            </>
          )}
        </header>

        <div
          className={cn(
            "px-3.5 pb-6",
            badgeVariant === "stamp" ? "pt-2" : "pt-3.5",
          )}
        >
          <div
            className={cn(
              "min-w-0 [&_.pmq-markdown]:mt-0 [&_.pmq-markdown]:w-full [&_.pmq-markdown_p]:w-full [&_.pmq-markdown_ul]:w-full [&_.pmq-markdown_ol]:w-full",
              badgeVariant === "stamp"
                ? "mt-0 [&_.not-prose:first-child]:mt-0"
                : "mt-2",
            )}
          >
            <CoreContentBlock block={active} {...contentProps} />
          </div>
        </div>
      </div>

      <div className="hidden px-5 pb-4 pt-5 sm:px-8 sm:pt-6 lg:block">
        <header className="flex items-center gap-2.5 border-b border-black/[0.08] pb-3.5 dark:border-white/[0.12]">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-teal/10"
            aria-hidden
          >
            <Layers className="size-[18px] text-teal" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 font-body text-[18px] font-semibold leading-tight tracking-tight text-ink">
              Core content
            </h2>
            <p className="mt-px font-body text-xs leading-snug text-ink/75">
              One scroll · click {jumpHint} to jump
            </p>
          </div>
        </header>

        <div className="mt-5 scroll-mt-4 lg:grid lg:grid-cols-[254px_44px_minmax(0,1fr)] lg:items-stretch">
          <div className="min-w-0">
            <div className="lg:sticky lg:top-4">
              <OutcomeMarginRail
                blocks={blocks}
                activeIndex={activeIndex}
                seen={seen}
                onSelect={handleSelect}
                shortTitles={titleMap}
              />
            </div>
          </div>

          <Lo1SpineScrollbar scrollRef={readerScrollRef} />

          <div
            ref={readerScrollRef}
            className="min-w-0 lg:max-h-[min(72vh,920px)] lg:overflow-y-auto lg:pl-[22px] lg:pt-1 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
          >
            <div className="min-w-0">
              {blocks.map((block, outcomeIndex) => {
                const code = block.outcome_code.toLowerCase();
                return (
                  <article
                    key={block.outcome_code}
                    id={`outcome-${code}`}
                    ref={(node) => registerSection(code, node)}
                    className={
                      outcomeIndex > 0
                        ? "mt-10 border-t border-black/[0.08] pt-8 dark:border-white/[0.12]"
                        : ""
                    }
                  >
                    <header className="mb-5">
                      <OutcomeCodeBadge code={code} variant={badgeVariant} />
                      <h3 className="mt-2 font-body text-[20px] font-semibold leading-tight tracking-tight text-ink">
                        <span className="sr-only">{code}: </span>
                        {block.outcome_title}
                      </h3>
                    </header>
                    <div className="min-w-0 [&_.pmq-markdown]:mt-0 [&_.pmq-markdown]:w-full [&_.pmq-markdown_p]:w-full [&_.pmq-markdown_ul]:w-full [&_.pmq-markdown_ol]:w-full">
                      <CoreContentBlock block={block} {...contentProps} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { LO3_SHORT_TITLE };
