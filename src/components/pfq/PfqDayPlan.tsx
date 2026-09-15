"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { LoStagePie } from "@/components/pmq/LoStagePie";
import { Spinner } from "@/components/ui/spinner";
import { PFQ_OBJECTIVES, type PfqObjectiveMeta } from "@/lib/pfq/outcomes";
import { PFQ_LEARN_HREF } from "@/lib/pfq/constants";
import {
  PFQ_STAGE_COUNT,
} from "@/lib/pfq/lesson-stages";
import { pfqSectionId } from "@/lib/pfq/section-ids";
import styles from "@/components/pmq/PmqDayPlan.module.css";

type PfqDayPlanProps = {
  mode: "linked" | "locked";
  /** Objectives with completed_at / full checklist. */
  completedObjectives?: number[];
  /** Day to select on first paint (1 or 2). */
  defaultExpandedDay?: 1 | 2;
  /** Pathway stages reached (0…PFQ_STAGE_COUNT) keyed by section id. */
  stageReachedBySectionId?: Record<string, number>;
  titleAction?: ReactNode;
};

function LoRow({
  objective,
  mode,
  isComplete,
  stageReached,
}: {
  objective: PfqObjectiveMeta;
  mode: "linked" | "locked";
  isComplete: boolean;
  stageReached: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = `${PFQ_LEARN_HREF}/${objective.objective}`;

  const body = (
    <>
      <span className={styles.loNum}>{objective.objective}</span>
      <span className={styles.loTitle}>{objective.title}</span>
      {mode === "linked" ? (
        isComplete ? (
          <span className={styles.loDone} aria-hidden>
            <Check className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : pending ? (
          <span className={styles.loPending}>
            <Spinner variant="bars" size={12} className="text-ink/50" />
          </span>
        ) : (
          <LoStagePie
            reached={stageReached}
            total={PFQ_STAGE_COUNT}
            label={`LO${objective.objective}`}
            className={styles.loPie}
          />
        )
      ) : (
        <span className={styles.loMeta} aria-hidden>
          ···
        </span>
      )}
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
            ? `Opening LO${objective.objective}`
            : isComplete
              ? `LO${objective.objective}: ${objective.title}, complete`
              : `LO${objective.objective}: ${objective.title}, ${stageReached} of ${PFQ_STAGE_COUNT} stages`
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
    <div className={`${styles.loRow} ${styles.loRowLocked}`} aria-disabled>
      {body}
    </div>
  );
}

/**
 * PFQ 2-day study plan console — same chrome as PMQ's PmqDayPlan.
 */
export function PfqDayPlan({
  mode,
  completedObjectives = [],
  defaultExpandedDay,
  stageReachedBySectionId = {},
  titleAction,
}: PfqDayPlanProps) {
  const completed = useMemo(
    () => new Set(completedObjectives),
    [completedObjectives],
  );

  const days = useMemo(() => {
    const day1 = PFQ_OBJECTIVES.filter((o) => o.day === 1);
    const day2 = PFQ_OBJECTIVES.filter((o) => o.day === 2);
    return [
      { day: 1 as const, objectives: day1 },
      { day: 2 as const, objectives: day2 },
    ];
  }, []);

  const initialDay =
    defaultExpandedDay && days.some((d) => d.day === defaultExpandedDay)
      ? defaultExpandedDay
      : 1;

  const [selectedDay, setSelectedDay] = useState<1 | 2>(initialDay);

  useEffect(() => {
    if (
      defaultExpandedDay &&
      days.some((d) => d.day === defaultExpandedDay)
    ) {
      setSelectedDay(defaultExpandedDay);
    }
  }, [defaultExpandedDay, days]);

  const active = days.find((d) => d.day === selectedDay) ?? days[0]!;

  const onRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedDay((d) => (d === 1 ? 2 : 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedDay((d) => (d === 1 ? 2 : 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setSelectedDay(1);
    } else if (event.key === "End") {
      event.preventDefault();
      setSelectedDay(2);
    }
  };

  return (
    <div className={styles.panel} data-day-plan="pfq">
      <div className={styles.titleBar}>
        <div className={styles.titleCluster}>
          <h2 id="pfq-plan-heading" className={styles.title}>
            Your <span className={styles.titleAccent}>2-day</span> plan
          </h2>
          <p className={styles.subtitle}>
            10 learning objectives to explore. Start with any one.
          </p>
        </div>
        {titleAction ? (
          <div className={styles.titleAction}>{titleAction}</div>
        ) : null}
      </div>

      <div
        className={`${styles.dayRail} ${styles.dayRailTwo}`}
        role="tablist"
        aria-label="Study days"
        onKeyDown={onRailKeyDown}
      >
        {days.map(({ day, objectives }) => {
          const doneCount = objectives.filter((o) =>
            completed.has(o.objective),
          ).length;
          const total = objectives.length;
          const done = total > 0 && doneCount >= total;
          const selected = day === selectedDay;

          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`pfq-day-${day}-panel`}
              id={`pfq-day-${day}-tab`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.dayTab} ${
                selected ? styles.dayTabSelected : ""
              } ${done ? styles.dayTabDone : ""}`}
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

      <div
        id={`pfq-day-${active.day}-panel`}
        role="tabpanel"
        aria-labelledby={`pfq-day-${active.day}-tab`}
        className={styles.panelBody}
      >
        <div className={styles.loList}>
          {active.objectives.map((objective) => (
            <LoRow
              key={objective.objective}
              objective={objective}
              mode={mode}
              isComplete={completed.has(objective.objective)}
              stageReached={
                stageReachedBySectionId[pfqSectionId(objective.objective)] ?? 0
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
