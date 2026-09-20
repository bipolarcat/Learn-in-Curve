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

const QUIZ_COPY = {
  heading: "Practice questions",
  title: "Three real questions from the course bank.",
} as const;

type LabActivityDemoProps = {
  isSignedIn?: boolean;
};

/**
 * Lab-only live recall demo — quiz + three activity modes.
 * Pairup + Lineup support tap/keyboard place. Groupup is pointer-drag only
 * (activities/ untouched); flagged in BUSINESS_STATE until a non-drag path exists.
 */
export function LabActivityDemo({ isSignedIn = false }: LabActivityDemoProps) {
  const baseId = useId();
  const [mode, setMode] = useState<Mode>("quiz");
  const [completedOnce, setCompletedOnce] = useState(false);

  const onComplete = useCallback(() => {
    setCompletedOnce(true);
  }, []);

  const activityMeta =
    mode === "quiz" ? QUIZ_COPY : ACTIVITY_BY_MODE[mode];
  const panelId = `${baseId}-panel`;
  const tabPrefix = `${baseId}-tab`;

  return (
    <section
      id="lab-activity-demo"
      aria-labelledby="lab-activity-demo-heading"
      className="relative overflow-x-clip border-t border-ink/[0.06] pt-[clamp(2.25rem,5vw,3.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]"
    >
      <div className="wrap relative z-[1]">
        <ScrollReveal className="mx-auto max-w-[40rem] text-center">
          <p className="mb-2 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-teal sm:text-[13px]">
            How you practise
          </p>
          <h2
            id="lab-activity-demo-heading"
            className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            Recall it four ways
          </h2>
          <p className="mx-auto mt-3 max-w-[34rem] text-pretty font-body text-[15px] leading-relaxed text-ink/65 sm:text-[16px]">
            Practice questions plus three recall activities from the course.
            Have a go.
          </p>
        </ScrollReveal>

        <ScrollReveal
          delay={0.06}
          className="mx-auto mt-8 w-full max-w-[46rem] sm:mt-10 md:max-w-none"
        >
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper p-3.5 shadow-[0_1px_0_rgb(var(--ink-rgb)_/_0.04),0_12px_28px_-18px_rgb(var(--ink-rgb)_/_0.28)] sm:p-5 md:p-6 lg:p-7">
            <div className="flex justify-center">
              <SegmentedControl
                label="Practice modes"
                options={MODE_OPTIONS}
                value={mode}
                onValueChange={(next) => setMode(next as Mode)}
                semantics="tablist"
                idPrefix={tabPrefix}
                panelId={panelId}
                className="w-full max-w-xl sm:!min-w-0"
              />
            </div>

            <p className="mt-4 min-h-[2.75rem] text-center font-body text-[13px] font-medium leading-snug sm:min-h-[1.5rem] sm:text-[14px]">
              <span className="font-semibold text-ink">
                {activityMeta.heading}.
              </span>{" "}
              <span className="text-ink/60">{activityMeta.title}</span>
            </p>

            <div
              role="tabpanel"
              id={panelId}
              aria-labelledby={`${tabPrefix}-${mode}`}
              className="lab-activity-stage mt-4 min-w-0 overflow-x-clip"
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
                />
              ) : null}
              {mode === "lineup" ? (
                <Lineup
                  key="demo-lineup"
                  activity={LINEUP}
                  onComplete={onComplete}
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
