"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { PmqSection } from "@/types/pmq";
import { productActionSecondary, productSurface } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { LoStagePie } from "@/components/pmq/LoStagePie";
import { getDayForLo, getDayLabel, pmqLoHref } from "@/lib/pmq/constants";
import { LO_STAGE_COUNT } from "@/lib/pmq/lo-stages";
import styles from "@/components/pmq/PmqDayPlan.module.css";

type PmqDayPlanProps = {
  sections: PmqSection[];
  mode: "linked" | "locked";
  /** Section IDs with `completed_at` — drives course progress + day tab marks. */
  completedSectionIds?: string[];
  /** Day number to select on first paint (e.g. day of next incomplete LO). */
  defaultExpandedDay?: number;
  /** Preview / conversion surfaces — tighter day rows and LO lines. */
  density?: "default" | "compact";
  /**
   * accordion = day-selector console (overview).
   * open = all days listed (preview showcase).
   */
  layout?: "accordion" | "open";
  /** Console title-bar action (Continue / Start) — top-right. */
  titleAction?: ReactNode;
  /**
   * DB-backed pathway-reached count (0…LO_STAGE_COUNT), keyed by section
   * id — from `getLoStageReachedMap` (queries.ts). Replaces the old
   * client-only sessionStorage count as the pie's source of truth.
   */
  stageReachedBySectionId?: Record<string, number>;
};

function groupByDay(sections: PmqSection[]): Map<number, PmqSection[]> {
  const grouped = new Map<number, PmqSection[]>();
  for (const section of sections) {
    const day = getDayForLo(section.order_index);
    const list = grouped.get(day) ?? [];
    list.push(section);
    grouped.set(day, list);
  }
  for (const [, list] of grouped) {
    list.sort((a, b) => a.order_index - b.order_index);
  }
  return grouped;
}

function DayOpenBlock({
  day,
  label,
  daySections,
  mode,
}: {
  day: number;
  label: string;
  daySections: PmqSection[];
  mode: "linked" | "locked";
}) {
  return (
    <section
      className="relative z-10 scroll-mt-28"
      data-day={day}
      aria-labelledby={`pmq-day-${day}-label`}
    >
      <div className="flex items-baseline gap-2.5 border-b border-ink/10 pb-1.5">
        <span
          className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-ink px-1.5 text-[11px] font-semibold tabular-nums text-paper"
          aria-hidden
        >
          {day}
        </span>
        <h3
          id={`pmq-day-${day}-label`}
          className="text-[14px] font-semibold tracking-[-0.02em] text-ink sm:text-[15px]"
        >
          {label}
        </h3>
        <span className="ml-auto shrink-0 text-[11px] font-medium tabular-nums text-ink/40">
          {daySections.length} LO{daySections.length === 1 ? "" : "s"}
        </span>
      </div>

      <ol className="mt-1.5 grid list-none grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-x-3">
        {daySections.map((section) => {
          const inner = (
            <>
              <span className="w-5 shrink-0 text-right text-[11px] font-semibold tabular-nums text-ink/35">
                {section.order_index}
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-ink line-clamp-2">
                {section.title}
              </span>
              {mode === "locked" ? (
                <span className="sr-only">Locked until you create an account</span>
              ) : null}
            </>
          );

          const rowClass = [
            "flex min-h-9 items-center gap-2 rounded-lg px-1.5 py-1.5",
            "transition-colors duration-150 ease-[var(--ease-out-quint)]",
            mode === "linked"
              ? "hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-1 focus-visible:ring-offset-cream"
              : "text-ink/90",
          ].join(" ");

          if (mode === "linked") {
            return (
              <li key={section.id}>
                <Link
                  href={pmqLoHref(section.order_index)}
                  className={`${rowClass} text-inherit no-underline`}
                >
                  {inner}
                </Link>
              </li>
            );
          }

          return (
            <li key={section.id} className={rowClass}>
              {inner}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LoRow({
  section,
  mode,
  isComplete,
  stageReached,
}: {
  section: PmqSection;
  mode: "linked" | "locked";
  isComplete: boolean;
  /** Pathway stages reached (0…LO_STAGE_COUNT). Ignored when complete. */
  stageReached: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = pmqLoHref(section.order_index);

  const trailing =
    pending && mode === "linked" ? (
      <span className={styles.loPending} aria-hidden>
        <Spinner size={12} className="text-orange" />
      </span>
    ) : isComplete && mode === "linked" ? (
      <span className={styles.loDone} aria-label="Complete">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
      </span>
    ) : mode === "locked" ? (
      <span className={styles.loMeta} aria-label="Locked">
        ···
      </span>
    ) : (
      <LoStagePie
        reached={stageReached}
        total={LO_STAGE_COUNT}
        label={`LO ${section.order_index}`}
        className={styles.loPie}
      />
    );

  const body = (
    <>
      <span className={styles.loNum} aria-hidden>
        {section.order_index}
      </span>
      <span className={styles.loTitle}>{section.title}</span>
      {trailing}
    </>
  );

  if (mode === "linked") {
    return (
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        aria-label={
          pending
            ? `Opening LO${section.order_index}: ${section.title}`
            : isComplete
              ? `LO${section.order_index}: ${section.title}, complete`
              : `LO${section.order_index}: ${section.title}, ${stageReached} of ${LO_STAGE_COUNT} stages`
        }
        className={`${styles.loRow} ${isComplete ? styles.loRowDone : ""}`}
        onClick={() => {
          startTransition(() => {
            router.push(href);
          });
        }}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      className={`${styles.loRow} ${styles.loRowLocked}`}
      aria-disabled
    >
      {body}
    </div>
  );
}

/**
 * Shared 5-day study plan console.
 * Overview: title + day tabs + LO list (course % progress lives in PmqCourseHeader).
 * Preview: open layout lists every day.
 */
export function PmqDayPlan({
  sections,
  mode,
  completedSectionIds = [],
  defaultExpandedDay,
  density = "default",
  layout = "accordion",
  titleAction,
  stageReachedBySectionId = {},
}: PmqDayPlanProps) {
  const completedIds = useMemo(
    () => new Set(completedSectionIds),
    [completedSectionIds],
  );

  const days = useMemo(() => {
    const byDay = groupByDay(sections);
    return Array.from(byDay.keys())
      .sort((a, b) => a - b)
      .map((day) => ({
        day,
        label: getDayLabel(day),
        daySections: byDay.get(day) ?? [],
      }));
  }, [sections]);

  const initialDay =
    defaultExpandedDay && days.some((d) => d.day === defaultExpandedDay)
      ? defaultExpandedDay
      : (days[0]?.day ?? 1);

  const [selectedDay, setSelectedDay] = useState(initialDay);

  useEffect(() => {
    if (
      defaultExpandedDay &&
      days.some((d) => d.day === defaultExpandedDay)
    ) {
      setSelectedDay(defaultExpandedDay);
    }
  }, [defaultExpandedDay, days]);

  const active = days.find((d) => d.day === selectedDay) ?? days[0];

  const onRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dayNumbers = days.map((d) => d.day);
    const index = dayNumbers.indexOf(selectedDay);
    if (index < 0) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = dayNumbers[(index + 1) % dayNumbers.length];
      if (next != null) {
        setSelectedDay(next);
        requestAnimationFrame(() =>
          document.getElementById(`pmq-day-${next}-tab`)?.focus(),
        );
      }
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev =
        dayNumbers[(index - 1 + dayNumbers.length) % dayNumbers.length];
      if (prev != null) {
        setSelectedDay(prev);
        requestAnimationFrame(() =>
          document.getElementById(`pmq-day-${prev}-tab`)?.focus(),
        );
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      if (dayNumbers[0] != null) {
        setSelectedDay(dayNumbers[0]);
        requestAnimationFrame(() =>
          document.getElementById(`pmq-day-${dayNumbers[0]}-tab`)?.focus(),
        );
      }
    } else if (event.key === "End") {
      event.preventDefault();
      const last = dayNumbers[dayNumbers.length - 1];
      if (last != null) {
        setSelectedDay(last);
        requestAnimationFrame(() =>
          document.getElementById(`pmq-day-${last}-tab`)?.focus(),
        );
      }
    }
  };

  if (sections.length === 0) {
    return (
      <div className={`${productSurface} grid gap-4 p-8 text-center sm:p-10`}>
        <p className="text-[15px] leading-relaxed text-ink/80">
          Course content isn&apos;t available right now. Refresh the page — if
          it still looks empty, use Send feedback and we&apos;ll sort it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className={productActionSecondary}
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (layout === "open") {
    return (
      <div className="relative z-10 grid gap-5 pb-1 sm:gap-6">
        {days.map(({ day, label, daySections }) => (
          <DayOpenBlock
            key={day}
            day={day}
            label={label}
            daySections={daySections}
            mode={mode}
          />
        ))}
      </div>
    );
  }

  const compact = density === "compact";

  return (
    <div
      className={`${styles.panel} ${compact ? styles.panelCompact : ""}`}
      data-day-plan=""
    >
      <div className={styles.titleBar}>
        <div className={styles.titleCluster}>
          <h2 id="pmq-plan-heading" className={styles.title}>
            Your <span className={styles.titleAccent}>5-day</span> plan
          </h2>
        </div>
        {titleAction ? (
          <div className={styles.titleAction}>{titleAction}</div>
        ) : null}
      </div>

      <div
        className={styles.dayRail}
        role="tablist"
        aria-label="Study days"
        onKeyDown={onRailKeyDown}
      >
        {days.map(({ day, daySections }) => {
          const doneCount = daySections.filter((s) =>
            completedIds.has(s.id),
          ).length;
          const total = daySections.length;
          const done = total > 0 && doneCount >= total;
          const inProgress = doneCount > 0 && !done;
          const selected = day === selectedDay;

          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`pmq-day-${day}-panel`}
              id={`pmq-day-${day}-tab`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.dayTab} ${
                selected ? styles.dayTabSelected : ""
              } ${done ? styles.dayTabDone : ""} ${
                inProgress && !selected ? styles.dayTabProgress : ""
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <span className={styles.dayTabNum}>Day {day}</span>
              {mode === "linked" ? (
                <span className={styles.dayTabCount}>
                  {doneCount}/{total}
                </span>
              ) : (
                <span className={styles.dayTabCount}>{total}</span>
              )}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          id={`pmq-day-${active.day}-panel`}
          role="tabpanel"
          aria-labelledby={`pmq-day-${active.day}-tab`}
          className={styles.panelBody}
        >
          <div className={styles.loList}>
              {active.daySections.map((section) => (
                <LoRow
                  key={section.id}
                  section={section}
                  mode={mode}
                  isComplete={completedIds.has(section.id)}
                  stageReached={stageReachedBySectionId[section.id] ?? 0}
                />
              ))}
            </div>
        </div>
      ) : null}
    </div>
  );
}
