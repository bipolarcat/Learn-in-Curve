import { canAccessCourseReport, type PmqTier } from "@/lib/pmq/tiers";
import type { MockExamSetSummary, PmqSection } from "@/types/pmq";
import {
  PmqCommandWordsTable,
  PmqGlobalFurtherReading,
} from "@/components/pmq/PmqOverviewSections";
import { PmqMockExamsSection } from "@/components/pmq/PmqMockExamsSection";
import { PmqDayPlan } from "@/components/pmq/PmqDayPlan";
import { PmqPlanContinue } from "@/components/pmq/PmqPlanContinue";
import { PmqFaqSection } from "@/components/pmq/PmqFaqSection";
import { CourseReportCard } from "@/components/pmq/CourseReportCard";
import { getDayForLo } from "@/lib/pmq/constants";
import { getNextIncompleteSection } from "@/lib/pmq/progress";

type PmqOverviewProps = {
  sections: PmqSection[];
  /** Section IDs marked complete by the user. */
  completedSectionIds?: string[];
  /**
   * The viewer's tier.
   *
   * Was `hasTutorEntitlement: boolean`, which fed BOTH the mock exam list and
   * the end-of-course report from one flag. Those now belong to different tiers
   * — mocks 2-3 are Pro, the report is AI Pro — so a single boolean would either
   * lock Pro out of its own mock papers or hand it the AI Pro report.
   */
  userTier?: PmqTier;
  tutorPriceCents?: number;
  mockExamSummaries?: MockExamSetSummary[];
  courseId?: string;
  hasCourseReport?: boolean;
  /** DB-backed pathway-reached count (0…7) per section id — see PmqDayPlan. */
  stageReachedBySectionId?: Record<string, number>;
};

export function PmqOverview({
  sections,
  completedSectionIds = [],
  userTier = "starter",
  tutorPriceCents = 500,
  mockExamSummaries = [],
  courseId,
  hasCourseReport = false,
  stageReachedBySectionId = {},
}: PmqOverviewProps) {
  const next = getNextIncompleteSection(sections, completedSectionIds);
  const defaultExpandedDay = next ? getDayForLo(next.order_index) : undefined;
  const courseComplete = sections.length > 0 && next === null;

  return (
    <div className="relative z-[1] flex justify-center px-3 sm:px-5">
      <div className="grid w-full max-w-wrap gap-6 pb-28 pt-4 sm:gap-[2.125rem] sm:pb-24 sm:pt-6">
        {courseId ? (
          <CourseReportCard
            courseComplete={courseComplete}
            hasProEntitlement={canAccessCourseReport(userTier)}
            hasReport={hasCourseReport}
            courseId={courseId}
            tutorPriceCents={tutorPriceCents}
            returnPath="/courses/pmq-in-5-days"
          />
        ) : null}

        <section aria-labelledby="pmq-plan-heading">
          <PmqDayPlan
            sections={sections}
            mode="linked"
            completedSectionIds={completedSectionIds}
            defaultExpandedDay={defaultExpandedDay}
            stageReachedBySectionId={stageReachedBySectionId}
            titleAction={
              <PmqPlanContinue
                sections={sections}
                completedSectionIds={completedSectionIds}
              />
            }
          />
        </section>

        <PmqMockExamsSection
          userTier={userTier}
          summaries={mockExamSummaries}
        />

        <PmqCommandWordsTable />
        <PmqGlobalFurtherReading />
        <PmqFaqSection />
      </div>
    </div>
  );
}
