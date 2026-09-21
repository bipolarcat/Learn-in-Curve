"use client";

import { useCallback, useId, useState } from "react";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import {
  ActivityGroupupIcon,
  ActivityLineupIcon,
  ActivityPairupIcon,
} from "@/components/pmq/activities/ActivityIcons";
import { ACTIVITY_DISPLAY_NAMES } from "@/components/pmq/activities/names";
import { Groupup } from "@/components/pmq/activities/Groupup";
import { Lineup } from "@/components/pmq/activities/Lineup";
import { Pairup } from "@/components/pmq/activities/Pairup";
import { TrialQuiz } from "@/components/TrialQuiz";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CtaArrow, stampCtaTealFlat } from "@/components/stamp-chip";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/ui/segmented-control";
import type {
  GroupupActivity,
  LineupActivity,
  PairupActivity,
} from "@/types/pmq";

const CTA_PRIMARY =
  `${stampCtaTealFlat} !normal-case !text-[13px] !font-semibold !tracking-[-0.01em] sm:!text-[14px]`;

/** Same topic, three recall angles — Sim to sanity-check PMQ wording before promote. */
const PAIRUP: PairupActivity = {
  id: "demo-pairup",
  type: "pairup",
  heading: "Change control has four terms the exam keeps coming back to",
  title: "Drag each meaning up to the term it belongs to.",
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
  heading: "A change request has just landed on your project. Four steps, one right order",
  title: "Drag the steps into the order they happen.",
  items: [
    "Request raised and logged",
    "Impact assessed",
    "Decision: approve or reject",
    "Baseline updated and communicated",
  ],
};

const GROUPUP: GroupupActivity = {
  id: "demo-groupup",
  type: "groupup",
  heading:
    "Some change control work happens before the decision to approve. Some only after",
  title: "Drag each card into the bucket it belongs in.",
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

type Mode = "quiz" | "pairup" | "lineup" | "groupup";

const MODE_OPTIONS: SegmentedOption[] = [
  {
    value: "quiz",
    label: "Quiz",
    icon: <ListChecks className="size-4 shrink-0" aria-hidden strokeWidth={2.25} />,
  },
  {
    value: "pairup",
    label: ACTIVITY_DISPLAY_NAMES.pairup,
    icon: (
      <ActivityPairupIcon className="size-4 shrink-0" aria-hidden />
    ),
  },
  {
    value: "lineup",
    label: ACTIVITY_DISPLAY_NAMES.lineup,
    icon: (
      <ActivityLineupIcon className="size-4 shrink-0" aria-hidden />
    ),
  },
  {
    value: "groupup",
    label: ACTIVITY_DISPLAY_NAMES.groupup,
    icon: (
      <ActivityGroupupIcon className="size-4 shrink-0" aria-hidden />
    ),
  },
];

const ACTIVITY_BY_MODE = {
  pairup: PAIRUP,
  lineup: LINEUP,
  groupup: GROUPUP,
} as const;

type LabActivityDemoProps = {
  isSignedIn?: boolean;
  /**
   * Inside `HomeMethodBand`: no outer section/wrap — just the paper console card.
   * Standalone (e.g. `/lab`) keeps its own section padding.
   */
  embedded?: boolean;
};

/**
 * Live recall demo — quiz + three activity modes.
 * Pairup + Lineup support tap/keyboard place. Groupup is pointer-drag only
 * (activities/ untouched); flagged in BUSINESS_STATE until a non-drag path exists.
 */
export function LabActivityDemo({
  isSignedIn = false,
  embedded = false,
}: LabActivityDemoProps) {
  const baseId = useId();
  const [mode, setMode] = useState<Mode>("quiz");
  const [completedOnce, setCompletedOnce] = useState(false);

  const onComplete = useCallback(() => {
    setCompletedOnce(true);
  }, []);

  const activityMeta = mode === "quiz" ? null : ACTIVITY_BY_MODE[mode];
  const panelId = `${baseId}-panel`;
  const tabPrefix = `${baseId}-tab`;

  const card = (
    <ScrollReveal className="mx-auto w-full max-w-[46rem] md:max-w-none">
      <div
        className={
          embedded
            ? "overflow-hidden rounded-[1.35rem] border border-white/10 bg-paper p-3.5 text-ink shadow-[0_1px_0_rgb(255_255_255_/_0.12),0_22px_48px_-18px_rgb(0_0_0_/_0.5)] sm:rounded-2xl sm:p-5 md:p-6 lg:p-7"
            : "overflow-hidden rounded-2xl border border-ink/10 bg-paper p-3.5 shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.04),0_12px_28px_-18px_rgb(var(--ink-rgb)_/_0.28)] sm:p-5 md:p-6 lg:p-7"
        }
      >
        <header className="mb-4 sm:mb-5">
          <h2
            id="lab-activity-demo-heading"
            className="font-display text-[clamp(1.35rem,2.8vw,1.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink text-balance"
          >
            Real PMQ Practice
          </h2>
          <p className="mt-1.5 max-w-[36rem] text-pretty font-body text-[14px] leading-relaxed text-ink/65 sm:text-[15px]">
            Try questions and activities from the actual course.
          </p>
        </header>

        <div className="w-full">
          <SegmentedControl
            label="Practice modes"
            options={MODE_OPTIONS}
            value={mode}
            onValueChange={(next) => setMode(next as Mode)}
            semantics="tablist"
            idPrefix={tabPrefix}
            panelId={panelId}
            className="w-full max-w-none sm:w-full sm:min-w-0"
          />
        </div>

        {activityMeta ? (
          <p className="mt-4 min-h-[2.75rem] text-left font-body sm:min-h-[2.5rem]">
            <span className="block text-[15px] font-medium leading-[1.55] text-ink sm:text-base sm:leading-[1.6]">
              {activityMeta.heading}.
            </span>
            <span className="mt-0.5 block text-[13px] font-medium leading-snug text-ink/65 sm:text-[14px]">
              {activityMeta.title}
            </span>
          </p>
        ) : null}

        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${tabPrefix}-${mode}`}
          className="lab-activity-stage mt-4 min-h-[13.875rem] min-w-0 overflow-x-clip md:min-h-[14rem]"
        >
          {mode === "quiz" ? (
            <TrialQuiz
              key="demo-quiz"
              isSignedIn={isSignedIn}
              embedded
              idPrefix={`${baseId}-quiz`}
              onComplete={onComplete}
            />
          ) : null}
          {mode === "pairup" ? (
            <Pairup
              key="demo-pairup"
              activity={PAIRUP}
              onComplete={onComplete}
              compact
            />
          ) : null}
          {mode === "lineup" ? (
            <Lineup
              key="demo-lineup"
              activity={LINEUP}
              onComplete={onComplete}
              compact
            />
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
            <p className="m-0 font-body text-[14px] leading-snug text-ink/65 sm:text-[15px]">
              That&apos;s one of 60+ in the free course.
            </p>
            <Link href="/courses" className={CTA_PRIMARY}>
              Start the free course
              <CtaArrow />
            </Link>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-3 border-t border-ink/[0.06] pt-5 text-center">
            <Link href="/courses" className={CTA_PRIMARY}>
              Start the free course
              <CtaArrow />
            </Link>
          </div>
        )}
      </div>
    </ScrollReveal>
  );

  if (embedded) {
    return (
      <div
        id="lab-activity-demo"
        aria-labelledby="lab-activity-demo-heading"
        className="mt-8 sm:mt-10 lg:mt-12"
      >
        {card}
      </div>
    );
  }

  return (
    <section
      id="lab-activity-demo"
      aria-labelledby="lab-activity-demo-heading"
      className="relative overflow-x-clip pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">{card}</div>
    </section>
  );
}
