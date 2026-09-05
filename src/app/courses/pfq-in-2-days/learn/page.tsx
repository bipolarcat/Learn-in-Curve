import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePfqProOrRedirect } from "@/lib/pfq/require-pro";
import {
  PFQ_COURSE_ID,
  PFQ_LESSONS_ENABLED,
  PFQ_PRICING_HREF,
  PFQ_SLUG,
} from "@/lib/pfq/constants";
import { PFQ_LESSONS } from "@/lib/pfq/content";
import { getPfqDashboardCardState } from "@/lib/pfq/lesson-actions";
import { getUserCourseStats } from "@/lib/pmq/queries";
import { CourseHeader } from "@/components/course/CourseHeader";
import { PfqOverview } from "@/components/pfq/PfqOverview";

export const metadata: Metadata = {
  title: "PFQ in 2 Days — Course overview",
  robots: { index: false, follow: false },
};

/**
 * Enrolled study overview (dashboard “Course overview”).
 * Marketing page is `/courses/pfq-in-2-days`. Coverage map lives on mock results.
 */
export default async function PfqLearnHubPage() {
  if (!PFQ_LESSONS_ENABLED) {
    redirect(PFQ_PRICING_HREF);
  }

  await requirePfqProOrRedirect();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(PFQ_PRICING_HREF);
  }

  void PFQ_LESSONS.length;

  const [pfqStats, pfqCard] = await Promise.all([
    getUserCourseStats(supabase, user.id, PFQ_COURSE_ID),
    getPfqDashboardCardState(user.id),
  ]);

  return (
    <>
      <CourseHeader
        slug={PFQ_SLUG}
        courseName="PFQ in 2 Days"
        streak={pfqStats.current_streak}
        completionPercent={pfqCard.completionPercent}
        showProgress
        showOverviewLink={false}
        userTier="pro"
      />
      <PfqOverview
        completedObjectives={pfqCard.completedObjectives}
        nextObjective={pfqCard.nextObjective}
        nextStarted={pfqCard.nextStarted}
        stageReachedBySectionId={pfqCard.stageReachedBySectionId}
      />
    </>
  );
}
