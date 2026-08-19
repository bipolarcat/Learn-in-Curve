import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoSkipAuth } from "@/lib/demo";
import {
  getPmqTier,
  getAiTutorPriceCents,
  getCompletedSectionIds,
  getCourseCompletion,
  getLoStageReachedMap,
  getMockExamSetSummaries,
  getPmqSections,
  getUserCourseStats,
} from "@/lib/pmq/queries";
import { canAccessCourseReport, canAccessSly } from "@/lib/pmq/tiers";
import { PmqOverview } from "@/components/pmq/PmqOverview";
import { PmqCourseHeader } from "@/components/pmq/PmqCourseHeader";
import { AiTutorPanel } from "@/components/pmq/AiTutorPanel";
import { DemoBanner } from "@/components/pmq/DemoBanner";
import { getNextIncompleteSection } from "@/lib/pmq/progress";
import { getUserProfile } from "@/lib/profile";
import { getDisplayFirstName } from "@/lib/user-display";
import { hasCourseCompletionReport } from "@/lib/tutor/tutor-db";

export default async function PmqCourseOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isDemoSkipAuth()) {
    redirect("/auth/sign-in?next=/courses/pmq-in-5-days");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", "pmq-in-5-days")
    .single();

  if (!course || course.status !== "live") {
    if (isDemoSkipAuth()) {
      redirect("/");
    }
    redirect("/dashboard");
  }

  const sections = await getPmqSections(supabase);

  const [
    courseStats,
    completedSectionIds,
    userTier,
    completion,
    profile,
    mockExamSummaries,
    hasCourseReport,
    stageReachedBySectionId,
  ] = user
    ? await Promise.all([
        getUserCourseStats(supabase, user.id, course.id),
        getCompletedSectionIds(supabase, user.id, course.id),
        getPmqTier(supabase, user.id, course.id),
        getCourseCompletion(supabase, user.id, course.id),
        getUserProfile(supabase, user),
        getMockExamSetSummaries(supabase, user.id),
        hasCourseCompletionReport(supabase, user.id, course.id),
        getLoStageReachedMap(supabase, user.id, course.id),
      ])
    : [null, [], "starter" as const, null, null, [], false, {}];

  const tutorPriceCents = getAiTutorPriceCents(course);
  const nextSection = getNextIncompleteSection(sections, completedSectionIds);
  const tutorLoNumber = nextSection?.order_index ?? 1;
  const courseComplete =
    sections.length > 0
      ? nextSection === null
      : completedSectionIds.length >= 24;

  // Backfill report for Pro users who already finished before LIC-65 shipped.
  // Report is AI Pro only — don't generate one for a Pro buyer who can't open it.
  if (user && canAccessCourseReport(userTier) && courseComplete && !hasCourseReport) {
    void import("@/lib/tutor/course-completion-summary")
      .then(({ maybeDeliverCourseCompletionSummary }) =>
        maybeDeliverCourseCompletionSummary(supabase, user.id, course.id),
      )
      .catch((err) => {
        console.error("course report backfill failed:", err);
      });
  }

  return (
    <>
      <DemoBanner isSignedIn={!!user} />
      <PmqCourseHeader
        courseName={course.name}
        streak={courseStats?.current_streak ?? 0}
        completionPercent={completion?.percent ?? 0}
        showStats={!!user}
        showOverviewLink={false}
        isPro={userTier !== "starter"}
        userTier={userTier}
      />
      <PmqOverview
        sections={sections}
        completedSectionIds={completedSectionIds}
        userTier={userTier}
        tutorPriceCents={tutorPriceCents}
        mockExamSummaries={mockExamSummaries}
        courseId={course.id}
        hasCourseReport={hasCourseReport}
        stageReachedBySectionId={stageReachedBySectionId}
      />
      {/*
        Sly is AI Pro only. For Starter and Pro the panel isn't rendered at all
        — no tab, no launcher, no locked teaser. The AI Pro Bundle isn't on sale
        yet, so a padlocked tutor would advertise something nobody can buy, and
        it kept the composer mounted where a Pro user could still type into it.
      */}
      {user && canAccessSly(userTier) ? (
        <AiTutorPanel
          isUnlocked
          priceCents={tutorPriceCents}
          courseId={course.id}
          loNumber={tutorLoNumber}
          returnPath="/courses/pmq-in-5-days"
          courseComplete={courseComplete}
          userFirstName={getDisplayFirstName({
            profileFirstName: profile?.first_name,
            user,
          })}
          userAvatarId={profile?.avatar_id}
        />
      ) : null}
    </>
  );
}
