"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ActivityGroupupIcon,
  ActivityLineupIcon,
  ActivityPairupIcon,
} from "@/components/pmq/activities/ActivityIcons";
import { ACTIVITY_DISPLAY_NAMES } from "@/components/pmq/activities/names";
import { Groupup } from "@/components/pmq/activities/Groupup";
import { Lineup } from "@/components/pmq/activities/Lineup";
import { Pairup } from "@/components/pmq/activities/Pairup";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CtaArrow, stampCtaTealFlat } from "@/components/stamp-chip";
import type {
  GroupupActivity,
  LineupActivity,
  PairupActivity,
} from "@/types/pmq";
import { cn } from "@/lib/utils";

const CTA_PRIMARY =
  `${stampCtaTealFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;

/** Same topic, three recall angles — Sim to sanity-check PMQ wording before promote. */
const PAIRUP: PairupActivity = {
  id: "demo-pairup",
  type: "pairup",
  heading: "Change control",
  title: "Match each term to what it means.",
  pairs: [
    {
      term: "Change request",
      match: "The formal ask to alter an agreed baseline",
    },
    {
      term: "Change log",
      match: "The register of every request and its outcome",
    },
    {
      term: "Impact assessment",
      match: "The check on cost, time and risk before deciding",
    },
    {
      term: "Baseline",
      match: "The approved reference the project is measured against",
    },
  ],
};

const LINEUP: LineupActivity = {
  id: "demo-lineup",
  type: "lineup",
  heading: "Change control",
  title: "Put change control in order.",
  items: [
    "Request raised",
    "Logged in the change register",
    "Impact assessed",
    "Decision: approve or reject",
    "Baseline updated and communicated",
  ],
};

const GROUPUP: GroupupActivity = {
  id: "demo-groupup",
  type: "groupup",
  heading: "Change control",
  title: "Before or after the decision?",
  buckets: [
    { id: "before", label: "Before the decision" },
    { id: "after", label: "After the decision" },
  ],
  items: [
    { label: "Log the request", bucket: "before" },
    { label: "Assess cost and time impact", bucket: "before" },
    { label: "Update the baseline", bucket: "after" },
    { label: "Tell affected stakeholders", bucket: "after" },
  ],
};

type Mode = "pairup" | "lineup" | "groupup";

const MODES: {
  id: Mode;
  label: string;
  icon: (active: boolean) => ReactNode;
}[] = [
  {
    id: "pairup",
    label: ACTIVITY_DISPLAY_NAMES.pairup,
    icon: (active) => (
      <ActivityPairupIcon
        active={active}
        className="size-5 shrink-0"
        aria-hidden
      />
    ),
  },
  {
    id: "lineup",
    label: ACTIVITY_DISPLAY_NAMES.lineup,
    icon: (active) => (
      <ActivityLineupIcon
        active={active}
        className="size-5 shrink-0"
        aria-hidden
      />
    ),
  },
  {
    id: "groupup",
    label: ACTIVITY_DISPLAY_NAMES.groupup,
    icon: (active) => (
      <ActivityGroupupIcon
        active={active}
        className="size-5 shrink-0"
        aria-hidden
      />
    ),
  },
];

const ACTIVITY_BY_MODE = {
  pairup: PAIRUP,
  lineup: LINEUP,
  groupup: GROUPUP,
} as const;

/**
 * Lab-only live recall demo — one card, three modes.
 * Pairup + Lineup support tap/keyboard place. Groupup is pointer-drag only
 * (activities/ untouched); flagged in BUSINESS_STATE until a non-drag path exists.
 */
export function LabActivityDemo() {
  const baseId = useId();
  const [mode, setMode] = useState<Mode>("pairup");
  const [completedOnce, setCompletedOnce] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onComplete = useCallback(() => {
    setCompletedOnce(true);
  }, []);

  const selectMode = useCallback((next: Mode, focus = false) => {
    setMode(next);
    if (!focus) return;
    const index = MODES.findIndex((item) => item.id === next);
    requestAnimationFrame(() => tabRefs.current[index]?.focus());
  }, []);

  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index >= MODES.length - 1 ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index <= 0 ? MODES.length - 1 : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = MODES.length - 1;
    }
    if (nextIndex == null) return;
    event.preventDefault();
    selectMode(MODES[nextIndex]!.id, true);
  };

  const activity = ACTIVITY_BY_MODE[mode];
  const panelId = `${baseId}-panel`;

  return (
    <section
      id="lab-activity-demo"
      aria-labelledby="lab-activity-demo-heading"
      className="relative overflow-x-clip border-t border-ink/[0.06] pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">
        <ScrollReveal className="mx-auto max-w-[46rem] text-center">
          <p className="mb-2 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-teal sm:text-[13px]">
            How you practise
          </p>
          <h2
            id="lab-activity-demo-heading"
            className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            Recall it three ways
          </h2>
          <p className="mx-auto mt-3 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/65 sm:text-[16px]">
            Same idea from the course, tested three different ways. Have a go.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="mx-auto mt-8 max-w-[46rem] sm:mt-10">
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper/70 p-3.5 shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.04),0_12px_28px_-18px_rgb(var(--ink-rgb)_/_0.28)] sm:p-5">
            <div
              role="tablist"
              aria-label="Recall activity modes"
              className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
            >
              {MODES.map((item, index) => {
                const selected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${item.id}`}
                    aria-controls={panelId}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    onClick={() => selectMode(item.id)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 font-body text-[12.5px] font-semibold tracking-tight transition-[background-color,color,box-shadow] duration-150 ease-[var(--ease-out-quint)] sm:min-h-11 sm:gap-2 sm:px-3.5 sm:text-[13px]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                      selected
                        ? "bg-teal text-paper shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.12)]"
                        : "bg-ink/[0.045] text-ink/80 hover:bg-ink/[0.07] hover:text-ink",
                    )}
                  >
                    {item.icon(selected)}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 min-h-[2.75rem] text-center font-body text-[13px] font-medium leading-snug text-ink/60 sm:min-h-[1.5rem] sm:text-[14px]">
              <span className="font-semibold text-ink/75">
                {activity.heading}.
              </span>{" "}
              {activity.title}
            </p>

            <div
              role="tabpanel"
              id={panelId}
              aria-labelledby={`${baseId}-tab-${mode}`}
              className="mt-4 min-h-[34rem] overflow-x-clip sm:min-h-[32rem]"
            >
              {mode === "pairup" ? (
                <Pairup key="demo-pairup" activity={PAIRUP} onComplete={onComplete} />
              ) : null}
              {mode === "lineup" ? (
                <Lineup key="demo-lineup" activity={LINEUP} onComplete={onComplete} />
              ) : null}
              {mode === "groupup" ? (
                <Groupup
                  key="demo-groupup"
                  activity={GROUPUP}
                  onComplete={onComplete}
                />
              ) : null}
            </div>

            {completedOnce ? (
              <div className="mt-5 flex flex-col items-center gap-3 border-t border-ink/[0.06] pt-5 text-center">
                <p className="m-0 font-body text-[14px] leading-snug text-ink/70 sm:text-[15px]">
                  That&apos;s one of 60+ in the free course.
                </p>
                <Link
                  href="/courses/pmq-in-5-days/preview"
                  className={CTA_PRIMARY}
                >
                  Preview the free course
                  <CtaArrow />
                </Link>
              </div>
            ) : null}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
