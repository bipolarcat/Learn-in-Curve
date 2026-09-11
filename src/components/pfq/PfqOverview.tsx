import { PfqDayPlan } from "@/components/pfq/PfqDayPlan";
import { PfqPlanContinue } from "@/components/pfq/PfqPlanContinue";
import { PfqMockConsole } from "@/components/pfq/PfqMockConsole";
import { PfqExamGuideSection } from "@/components/pfq/PfqExamGuideSections";
import {
  PfqFaqSection,
  PfqFurtherReading,
  PfqTrapSchoolTeaser,
} from "@/components/pfq/PfqOverviewSections";
import { PFQ_OBJECTIVES } from "@/lib/pfq/outcomes";

type PfqOverviewProps = {
  completedObjectives: number[];
  nextObjective: number | null;
  /** @deprecated Started is derived from stageReachedBySectionId in PfqPlanContinue. */
  nextStarted?: boolean;
  stageReachedBySectionId: Record<string, number>;
};

function defaultDay(nextObjective: number | null): 1 | 2 {
  if (nextObjective == null) return 1;
  return (
    PFQ_OBJECTIVES.find((o) => o.objective === nextObjective)?.day ?? 1
  );
}

/**
 * Enrolled study overview — same rhythm as `PmqOverview`.
 * Marketing page stays at `/courses/pfq-in-2-days`; this is `/learn`.
 */
export function PfqOverview({
  completedObjectives,
  nextObjective,
  nextStarted: _nextStarted,
  stageReachedBySectionId,
}: PfqOverviewProps) {
  return (
    <div className="relative z-[1] flex w-full min-w-0 justify-center overflow-x-clip px-3 sm:px-5">
      <div className="grid w-full min-w-0 max-w-wrap grid-cols-1 gap-6 pb-28 pt-4 sm:gap-[2.125rem] sm:pb-24 sm:pt-6">
        <section aria-labelledby="pfq-plan-heading">
          <PfqDayPlan
            mode="linked"
            completedObjectives={completedObjectives}
            defaultExpandedDay={defaultDay(nextObjective)}
            stageReachedBySectionId={stageReachedBySectionId}
            titleAction={
              <PfqPlanContinue
                nextObjective={nextObjective}
                completedObjectives={completedObjectives}
                stageReachedBySectionId={stageReachedBySectionId}
              />
            }
          />
        </section>

        <PfqMockConsole />
        <PfqExamGuideSection />
        <PfqTrapSchoolTeaser />
        <PfqFurtherReading />
        <PfqFaqSection />
      </div>
    </div>
  );
}
