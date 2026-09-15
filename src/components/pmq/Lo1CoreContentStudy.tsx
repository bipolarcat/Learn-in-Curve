"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  LayoutGroup,
  MotionConfig,
  animate,
  motion,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "framer-motion";
import {
  ChevronDown,
  Layers,
  Landmark,
  Milestone,
  Scale,
} from "lucide-react";
import type { CoreContentBlock as CoreContentBlockType } from "@/types/pmq";
import { CoreContentBlock } from "@/components/pmq/CoreContentBlock";
import { PfqTakeawayBody } from "@/components/pfq/PfqTakeawayBody";
import {
  OutcomeCodeBadge,
  formatOutcomeBadge,
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

const glassChrome =
  "border border-black/[0.08] bg-cream/80 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.55),0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_8px_24px_rgb(var(--ink-rgb)_/_0.08)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-cream/55 dark:border-white/[0.12] dark:bg-paper/80 dark:supports-[backdrop-filter]:bg-paper/60 [@media(prefers-reduced-transparency:reduce)]:bg-paper [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none";

/** Sticky Contents chrome: `pt-3` (12) + half of pill `h-9` (18). Jump targets
 * and scroll-spy use this so the outcome separator sits on the pill midline. */
const LEARN_OUTCOME_ANCHOR_PX = 12 + 36 / 2;

/** 21st.dev Morphing Popover default spring. */
const morphSpring = {
  type: "spring" as const,
  bounce: 0.1,
  duration: 0.4,
};

const menuTween = {
  type: "tween" as const,
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as const,
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function OutcomeLearnChrome({
  blocks,
  activeIndex,
  onSelect,
  compact,
}: {
  blocks: CoreContentBlockType[];
  activeIndex: number;
  onSelect: (index: number) => void;
  shortTitles?: Record<string, string>;
  compact: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const chromeLayoutId = `learn-chrome-${useId()}`;
  const morph = reduceMotion ? { duration: 0 } : morphSpring;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [menuBox, setMenuBox] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuBox(null);
      return;
    }

    const place = () => {
      const trigger = menuRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const gap = 6;
      const margin = 10;
      const vv = window.visualViewport;
      const viewTop = vv?.offsetTop ?? 0;
      const viewLeft = vv?.offsetLeft ?? 0;
      const viewWidth = vv?.width ?? window.innerWidth;
      const viewHeight = vv?.height ?? window.innerHeight;
      const viewBottom = viewTop + viewHeight;
      const width = Math.max(rect.width, 92);
      const left = Math.min(
        Math.max(rect.left, viewLeft + margin),
        viewLeft + viewWidth - width - margin,
      );
      const estimated = blocks.length * 36 + 8;
      const spaceBelow = viewBottom - rect.bottom - gap - margin;
      const spaceAbove = rect.top - viewTop - gap - margin;
      const placeBelow =
        spaceBelow >= Math.min(estimated, 120) || spaceBelow >= spaceAbove;
      const maxHeight = Math.max(96, placeBelow ? spaceBelow : spaceAbove);
      const height = Math.min(estimated, maxHeight);
      let top = placeBelow ? rect.bottom + gap : rect.top - gap - height;
      top = Math.min(
        Math.max(top, viewTop + margin),
        viewBottom - margin - height,
      );
      setMenuBox({ top, left, width, maxHeight });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
    };
  }, [menuOpen, blocks.length]);

  const pick = (index: number) => {
    onSelect(index);
    setMenuOpen(false);
  };

  const menu =
    menuOpen && menuBox ? (
      <motion.ul
        ref={listRef}
        id={menuId}
        role="listbox"
        aria-label="Outcomes"
        initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : menuTween}
        style={{
          position: "fixed",
          top: menuBox.top,
          left: menuBox.left,
          width: menuBox.width,
          maxHeight: menuBox.maxHeight,
          zIndex: 80,
        }}
        className="m-0 flex list-none flex-col gap-px overflow-y-auto overscroll-contain rounded-xl border border-black/[0.08] bg-paper p-0.5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.55),0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_8px_24px_rgb(var(--ink-rgb)_/_0.12)] dark:border-white/[0.12]"
      >
        {blocks.map((block, index) => {
          const code = block.outcome_code.toLowerCase();
          const selected = index === activeIndex;
          return (
            <li key={block.outcome_code}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`${formatOutcomeBadge(code)}: ${block.outcome_title}`}
                onClick={() => pick(index)}
                className={cn(
                  "flex h-9 w-full items-center justify-center rounded-xl touch-manipulation [-webkit-tap-highlight-color:transparent]",
                  "transition-colors duration-150 ease-[var(--ease-out-quint)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange/50",
                  selected ? "bg-ink/[0.08]" : "hover:bg-ink/[0.04]",
                )}
              >
                <span className="font-body text-[12px] font-semibold tabular-nums tracking-tight text-ink">
                  {formatOutcomeBadge(code)}
                </span>
              </button>
            </li>
          );
        })}
      </motion.ul>
    ) : null;

  const labelId = reduceMotion ? undefined : `${chromeLayoutId}-label`;
  /** Shared on both morph ends so Framer never interpolates through radius 0. */
  const chromeRadius = 12;

  return (
    <>
      <MotionConfig transition={morph}>
        <motion.nav
          ref={menuRef}
          layout={!reduceMotion}
          aria-label="Learning outcomes"
          initial={false}
          transition={morph}
          style={{
            // Compact Contents pill needs a uniform radius + clip.
            // Expanded must not clip the stamp track — that made its bottom
            // corners pick up the nav's 12px while the top stayed at 7px.
            borderRadius: compact ? chromeRadius : 0,
            overflow: compact ? "hidden" : "visible",
          }}
          className={
            compact
              ? cn(
                  glassChrome,
                  "pointer-events-auto inline-flex h-9 shrink-0 items-center",
                )
              : "pointer-events-auto w-full min-w-0 bg-paper"
          }
        >
          {compact ? (
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-haspopup="listbox"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((open) => !open);
              }}
              className="inline-flex h-9 items-center justify-center gap-1 px-3 font-semibold touch-manipulation [-webkit-tap-highlight-color:transparent] transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/50"
              style={{ borderRadius: chromeRadius }}
            >
              <motion.span
                layoutId={labelId}
                layout="position"
                className="font-body text-[12px] font-semibold leading-none tracking-tight text-ink"
              >
                Contents
              </motion.span>
              <motion.span
                className="inline-flex"
                animate={{ rotate: menuOpen ? 180 : 0 }}
                transition={reduceMotion ? { duration: 0 } : menuTween}
              >
                <ChevronDown
                  className="size-3.5 shrink-0 text-ink/50"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </motion.span>
            </button>
          ) : (
            <>
              <div className="mb-2.5 flex min-w-0 items-center gap-1.5">
                <Layers
                  className="size-7 shrink-0 text-orange sm:size-8"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <motion.h2
                  layoutId={labelId}
                  layout="position"
                  className="m-0 min-w-0 font-body text-lg font-semibold leading-none tracking-tight text-ink"
                >
                  Core content
                </motion.h2>
              </div>
              <OutcomeStampSwitcher
                options={blocks.map((block) => ({
                  code: block.outcome_code,
                  title: block.outcome_title,
                }))}
                value={activeIndex}
                onChange={pick}
              />
            </>
          )}
        </motion.nav>
      </MotionConfig>
      {/* Portal onto body. Do not wrap createPortal in AnimatePresence. */}
      {menu ? createPortal(menu, document.body) : null}
    </>
  );
}

/**
 * Notebook Learn shell: sticky outcome chrome that morphs into a top-right
 * Contents pill. Table behaviour is opt-in so LO3 can keep study tables +
 * recall activities while sharing this chrome.
 */
export function Lo1CoreContentStudy({
  blocks,
  studyTables = false,
  activities = false,
  shortTitles,
  badgeVariant = "stamp",
  focusOutcomeCode = null,
  onFocusOutcomeConsumed,
  bodyVariant = "default",
  insightsLocked = false,
  isSignedIn = true,
  objectiveNumber,
}: {
  blocks: CoreContentBlockType[];
  studyTables?: boolean;
  activities?: boolean;
  shortTitles?: Record<string, string>;
  /** Ink-stamp outcome codes (default). Pass `outline` only to opt out. */
  badgeVariant?: OutcomeCodeBadgeVariant;
  /** Orient badge jump target (e.g. "2a"). */
  focusOutcomeCode?: string | null;
  onFocusOutcomeConsumed?: () => void;
  /** PFQ: key takeaway + collapsed Understand it. */
  bodyVariant?: "default" | "pfq-takeaway";
  /** PFQ Starter: Insights expand shows Pro upsell; body already redacted. */
  insightsLocked?: boolean;
  isSignedIn?: boolean;
  objectiveNumber?: number;
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
  const sectionEls = useRef(new Map<string, HTMLElement>());
  const jumping = useRef(false);
  const scrollAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const compactSentinelRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  const active = blocks[activeIndex];

  const registerSection = useCallback((code: string, node: HTMLElement | null) => {
    if (node) sectionEls.current.set(code, node);
    else sectionEls.current.delete(code);
  }, []);

  useEffect(() => {
    return () => {
      scrollAnimRef.current?.stop();
    };
  }, []);

  const jumpToCode = useCallback((code: string) => {
    const el = sectionEls.current.get(code);
    if (!el) return;

    scrollAnimRef.current?.stop();

    const targetTop = Math.max(
      0,
      window.scrollY + el.getBoundingClientRect().top - LEARN_OUTCOME_ANCHOR_PX,
    );

    jumping.current = true;

    if (prefersReducedMotion()) {
      window.scrollTo(0, targetTop);
      jumping.current = false;
      return;
    }

    // Spring scroll — native `behavior: "smooth"` is choppy on mobile Safari.
    // Same settle as pathway / Morphing Popover chrome (bounce 0.12).
    scrollAnimRef.current = animate(window.scrollY, targetTop, {
      type: "spring",
      bounce: 0.12,
      duration: 0.55,
      onUpdate: (latest) => {
        window.scrollTo(0, latest);
      },
      onComplete: () => {
        jumping.current = false;
        scrollAnimRef.current = null;
      },
    });
  }, []);

  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index);
      const block = blocks[index];
      if (!block) return;
      jumpToCode(block.outcome_code.toLowerCase());
    },
    [blocks, jumpToCode],
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
    const tryJump = () => {
      if (!sectionEls.current.get(code)) return false;
      jumpToCode(code);
      return true;
    };
    if (!tryJump()) {
      requestAnimationFrame(() => {
        tryJump();
      });
    }
  }, [focusOutcomeCode, blocks, jumpToCode, onFocusOutcomeConsumed]);

  useEffect(() => {
    const onScroll = () => {
      if (jumping.current) return;

      let nextIndex = 0;
      blocks.forEach((block, index) => {
        const el = sectionEls.current.get(block.outcome_code.toLowerCase());
        if (el && el.getBoundingClientRect().top <= LEARN_OUTCOME_ANCHOR_PX) {
          nextIndex = index;
        }
      });

      setActiveIndex((current) => {
        if (nextIndex === current) return current;
        return nextIndex;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [blocks]);

  useLayoutEffect(() => {
    const sentinel = compactSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setCompact(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [blocks.length]);

  if (blocks.length === 0 || !active) return null;

  const contentProps = {
    studyTables,
    activities,
  };

  const renderBody = (block: CoreContentBlockType) =>
    bodyVariant === "pfq-takeaway" ? (
      <PfqTakeawayBody
        block={block}
        insightsLocked={insightsLocked}
        isSignedIn={isSignedIn}
        objectiveNumber={objectiveNumber}
      />
    ) : (
      <CoreContentBlock block={block} {...contentProps} />
    );

  const cardClass =
    "min-w-0 rounded-2xl border border-black/[0.08] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_6px_20px_rgb(var(--ink-rgb)_/_0.06)] dark:border-white/[0.12]";

  const chrome = (
    <div
      className={cn(
        "pointer-events-none sticky top-0 z-40 w-full min-w-0 rounded-t-2xl px-3.5 sm:px-8",
        compact
          ? "mb-3 flex justify-end bg-transparent pt-3 sm:mb-4"
          : "flex justify-end bg-paper pb-2.5 pt-3 sm:pt-4",
      )}
    >
      <LayoutGroup>
        <OutcomeLearnChrome
          blocks={blocks}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          shortTitles={titleMap}
          compact={compact}
        />
      </LayoutGroup>
    </div>
  );

  if (badgeVariant !== "stamp") {
    return (
      <section className={`${cardClass} lg:hidden`} aria-label="Core content">
        <header className="sticky top-0 z-10 rounded-t-2xl border-b border-black/[0.08] bg-paper px-3 pb-2.5 pt-3 dark:border-white/[0.12]">
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
        </header>
        <div className="px-3.5 pb-6 pt-3.5">
          {renderBody(active)}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${cardClass} relative overflow-visible pb-6 sm:pb-10`}
      aria-label="Core content"
    >
      <h2 className="sr-only">Core content</h2>
      <div
        ref={compactSentinelRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden
      />
      {chrome}

      <div className="min-w-0 px-3.5 sm:px-8">
        {blocks.map((block, outcomeIndex) => {
          const code = block.outcome_code.toLowerCase();
          return (
            <article
              key={block.outcome_code}
              id={`outcome-${code}`}
              ref={(node) => registerSection(code, node)}
              style={{ scrollMarginTop: LEARN_OUTCOME_ANCHOR_PX }}
              className={
                outcomeIndex > 0
                  ? "mt-10 border-t border-black/[0.08] pt-8 dark:border-white/[0.12]"
                  : undefined
              }
            >
              <header className="mb-5 flex min-w-0 items-center gap-2.5">
                <OutcomeCodeBadge
                  code={code}
                  variant={badgeVariant}
                />
                <h3 className="m-0 min-w-0 flex-1 font-body text-[20px] font-semibold leading-tight tracking-tight text-ink">
                  <span className="sr-only">{code}: </span>
                  {block.outcome_title}
                </h3>
              </header>
              <div className="min-w-0 [&_.pmq-markdown]:mt-0 [&_.pmq-markdown]:w-full [&_.pmq-markdown_p]:w-full [&_.pmq-markdown_ul]:w-full [&_.pmq-markdown_ol]:w-full">
                {renderBody(block)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export { LO3_SHORT_TITLE };
