"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  CircleAlert,
  Compass,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { StudyJourney } from "@/components/course/StudyJourney";
import { LoPageHeader } from "@/components/pmq/LoPageHeader";
import { DefinitionsReveal } from "@/components/pmq/DefinitionsReveal";
import { CoreContentBlock } from "@/components/pmq/CoreContentBlock";
import { MisconceptionsList } from "@/components/pmq/MisconceptionsList";
import { MemoryAidsList } from "@/components/pmq/MemoryAidsList";
import { PfqCheckpointList } from "@/components/pfq/PfqCheckpointList";
import { PfqPracticeRunner } from "@/components/pfq/PfqPracticeRunner";
import { OutcomeCodeBadge } from "@/components/pmq/OutcomeCodeBadge";
import { productSurfaceOpaque } from "@/components/ui/semantic";
import motion from "@/components/pmq/PmqMotion.module.css";
import type { PfqObjectiveLesson } from "@/lib/pfq/content";
import {
  buildPfqStages,
  PFQ_PROGRESS_UNIT_PERCENT,
  PFQ_STAGE_REACHED_COLUMN,
  type PfqStageId,
} from "@/lib/pfq/lesson-stages";
import { markPfqStageReached } from "@/lib/pfq/lesson-actions";
import {
  PFQ_BASE_HREF,
  PFQ_LEARN_HREF,
} from "@/lib/pfq/constants";
import { canSealLo } from "@/lib/pmq/lo-stages";

type Props = {
  lesson: PfqObjectiveLesson;
  checklistState: number[];
  completed: boolean;
  dbReachedStageIds: PfqStageId[];
  completionPercent?: number;
};

const headingClass =
  "min-w-0 w-full text-left font-body text-lg font-semibold leading-none tracking-tight text-balance text-ink";
const bodyClass =
  "w-full min-w-0 text-left font-body text-[15px] font-normal leading-[1.65] text-pretty text-ink/85";
const orientGutter =
  "grid w-full min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-1.5 sm:gap-x-2";

function PathwayGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      className="size-7 shrink-0 text-orange sm:size-8"
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function OrientCard({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
      aria-labelledby={id}
    >
      <div className={orientGutter}>
        <span className="flex items-center justify-center self-start">
          <PathwayGlyph icon={icon} />
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 id={id} className={headingClass}>
            {title}
          </h2>
          {children}
        </div>
      </div>
    </section>
  );
}

/**
 * PFQ objective pathway — 4 stages via shared StudyJourney.
 * Does not write pfq_coverage_signals.
 */
export function PfqObjectiveLessonView({
  lesson,
  checklistState,
  completed,
  dbReachedStageIds,
  completionPercent = 0,
}: Props) {
  const stages = useMemo(() => buildPfqStages(), []);
  const sealed = completed;
  const checkpointTotal = lesson.progress_checkpoint.length;
  const sealReady = canSealLo({
    checkpointTotal,
    completedCheckpointCount: checklistState.length,
  });

  const [checkpointReady, setCheckpointReady] = useState(
    () => sealed || sealReady || checkpointTotal <= 0,
  );

  useEffect(() => {
    if (sealed || sealReady || checkpointTotal <= 0) {
      setCheckpointReady(true);
    }
  }, [sealed, sealReady, checkpointTotal]);

  const onChecklistReadyChange = useCallback((ready: boolean) => {
    setCheckpointReady(ready);
  }, []);

  const router = useRouter();
  const [, startTransition] = useTransition();
  const nextObjective = lesson.objective_number < 10
    ? lesson.objective_number + 1
    : null;
  const nextHref = nextObjective
    ? `${PFQ_LEARN_HREF}/${nextObjective}`
    : PFQ_LEARN_HREF;

  const goNext = useCallback(() => {
    startTransition(() => {
      router.push(nextHref);
    });
  }, [nextHref, router, startTransition]);

  const checkpointContinueLabel = nextObjective
    ? `Continue to LO${nextObjective}`
    : "Back to objectives";

  const timestampStageIds = useMemo(
    () =>
      (Object.keys(PFQ_STAGE_REACHED_COLUMN) as PfqStageId[]).filter(
        (id) => PFQ_STAGE_REACHED_COLUMN[id],
      ),
    [],
  );

  const onStagesMarkedDone = useCallback(
    (newlyDone: PfqStageId[]) => {
      for (const stageId of newlyDone) {
        if (!PFQ_STAGE_REACHED_COLUMN[stageId]) continue;
        void markPfqStageReached({
          objective: lesson.objective_number,
          stageId,
        }).catch((err) => {
          console.error("[PfqObjectiveLesson] markPfqStageReached failed:", err);
        });
      }
    },
    [lesson.objective_number],
  );

  const definitions = useMemo(
    () =>
      lesson.key_definitions.map((d) => ({
        term: d.term,
        plain_english: d.plain_english,
        apm_definition: d.definition,
      })),
    [lesson.key_definitions],
  );

  return (
    <StudyJourney<PfqStageId>
      unitKey={lesson.objective_number}
      stages={stages}
      sealed={sealed}
      quizStageId="drill"
      quizCompleted={dbReachedStageIds.includes("drill")}
      checkpointStageId="checkpoint"
      dbReachedStageIds={dbReachedStageIds}
      timestampStageIds={timestampStageIds}
      completionPercent={completionPercent}
      progressUnitPercent={PFQ_PROGRESS_UNIT_PERCENT}
      onStagesMarkedDone={onStagesMarkedDone}
      checkpointContinueLabel={checkpointContinueLabel}
      headerLastContinueLabel={nextObjective ? "Next LO" : "Overview"}
      checkpointReady={checkpointReady}
      onCheckpointContinue={goNext}
      srTitle={`LO ${lesson.objective_number}: ${lesson.title}`}
      renderChrome={(ctx) => (
        <LoPageHeader
          loNumber={lesson.objective_number}
          loTitle={lesson.title}
          unitLabel={`LO${lesson.objective_number}`}
          overviewHref={PFQ_BASE_HREF}
          stages={ctx.stages}
          currentId={ctx.currentId}
          unlockedIds={ctx.unlockedIds}
          lockedIds={ctx.lockedIds}
          onSelect={(id) => ctx.selectStage(id as PfqStageId)}
          continueLabel={ctx.continueLabel}
          onContinue={ctx.onContinue}
          continueEnabled={ctx.continueEnabled}
          completionPercent={ctx.optimisticCompletionPercent}
        />
      )}
      renderStage={(currentId) => {
        if (currentId === "orient") {
          return (
            <div
              className="flex min-w-0 flex-col gap-3 sm:gap-3.5"
              aria-label="Orient"
            >
              <OrientCard id="pfq-where" icon={Compass} title="Where this fits">
                <p className={bodyClass}>{lesson.where_this_fits}</p>
              </OrientCard>
              {definitions.length > 0 ? (
                <OrientCard
                  id="pfq-defs"
                  icon={BookOpen}
                  title="Key definitions"
                >
                  <DefinitionsReveal definitions={definitions} />
                </OrientCard>
              ) : null}
              {lesson.learning_outcomes.length > 0 ? (
                <OrientCard
                  id="pfq-outcomes"
                  icon={ListChecks}
                  title="Learning outcomes"
                >
                  <ul className="m-0 list-none space-y-2 p-0">
                    {lesson.learning_outcomes.map((code) => {
                      const title =
                        lesson.core_content.find(
                          (b) => b.outcome_code === code,
                        )?.outcome_title ?? code;
                      return (
                        <li
                          key={code}
                          className="flex min-w-0 items-start gap-2"
                        >
                          <OutcomeCodeBadge code={code} />
                          <span className={bodyClass}>{title}</span>
                        </li>
                      );
                    })}
                  </ul>
                </OrientCard>
              ) : null}
            </div>
          );
        }

        if (currentId === "learn") {
          return (
            <div
              className="flex min-w-0 flex-col gap-3 sm:gap-3.5"
              aria-label="Learn"
            >
              {lesson.core_content.map((block) => (
                <section
                  key={block.outcome_code}
                  id={block.outcome_code}
                  className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 scroll-mt-24 p-4 sm:p-5`}
                  aria-labelledby={`pfq-core-${block.outcome_code}`}
                >
                  <div className="mb-3 flex min-w-0 items-center gap-2">
                    <OutcomeCodeBadge code={block.outcome_code} />
                    <h3
                      id={`pfq-core-${block.outcome_code}`}
                      className="min-w-0 font-body text-lg font-semibold leading-snug tracking-tight text-ink"
                    >
                      {block.outcome_title || block.outcome_code}
                    </h3>
                  </div>
                  {block.key_takeaway ? (
                    <p className="mb-3 font-body text-[14px] font-medium leading-snug text-ink/80">
                      {block.key_takeaway}
                    </p>
                  ) : null}
                  <CoreContentBlock
                    block={{
                      outcome_code: block.outcome_code,
                      outcome_title: block.outcome_title,
                      body_markdown: block.body_markdown,
                      key_takeaway: block.key_takeaway,
                    }}
                  />
                  {block.watch_for ? (
                    <aside
                      className="mt-4 rounded-xl border border-ink/10 bg-ink/[0.03] px-3.5 py-3 dark:border-white/12 dark:bg-white/[0.04]"
                      aria-label="Watch for"
                    >
                      <p className="m-0 flex items-center gap-1.5 font-body text-[12px] font-semibold tracking-tight text-ink/60">
                        <CircleAlert
                          className="size-3.5 text-orange"
                          strokeWidth={2}
                          aria-hidden
                        />
                        Watch for
                      </p>
                      <p className="mt-1.5 m-0 font-body text-[15px] font-normal leading-[1.7] text-pretty text-ink/90">
                        {block.watch_for}
                      </p>
                    </aside>
                  ) : null}
                </section>
              ))}

              {lesson.misconceptions.length > 0 ? (
                <section
                  className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
                  aria-labelledby="pfq-misconceptions"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <PathwayGlyph icon={CircleAlert} />
                    <h2
                      id="pfq-misconceptions"
                      className="font-body text-lg font-semibold tracking-tight text-ink"
                    >
                      Common misconceptions
                    </h2>
                  </div>
                  <MisconceptionsList items={lesson.misconceptions} />
                </section>
              ) : null}

              {lesson.memory_aids.length > 0 ? (
                <section
                  className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
                  aria-labelledby="pfq-memory"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <PathwayGlyph icon={Brain} />
                    <h2
                      id="pfq-memory"
                      className="font-body text-lg font-semibold tracking-tight text-ink"
                    >
                      Memory aids
                    </h2>
                  </div>
                  <MemoryAidsList items={lesson.memory_aids} />
                </section>
              ) : null}
            </div>
          );
        }

        if (currentId === "drill") {
          return (
            <PfqPracticeRunner
              objective={lesson.objective_number}
              objectiveTitle={lesson.title}
              embedded
            />
          );
        }

        if (currentId === "checkpoint") {
          return (
            <section
              className={`${productSurfaceOpaque} ${motion.panel} w-full min-w-0 p-4 sm:p-5`}
              aria-labelledby="pfq-checkpoint"
            >
              <h2
                id="pfq-checkpoint"
                className="font-body text-lg font-semibold tracking-tight text-ink"
              >
                Progress checkpoint
              </h2>
              <p className="mt-2 mb-4 font-body text-[14px] leading-relaxed text-ink/70">
                Tick when you can do each of these. Completing every item marks
                this objective done. Self-assessment stays off the coverage map,
                that number only moves when you answer practice or mock
                questions.
              </p>
              <PfqCheckpointList
                objective={lesson.objective_number}
                items={lesson.progress_checkpoint}
                initialCompleted={checklistState}
                initiallyComplete={completed}
                onReadyChange={onChecklistReadyChange}
              />
            </section>
          );
        }

        return null;
      }}
    />
  );
}
