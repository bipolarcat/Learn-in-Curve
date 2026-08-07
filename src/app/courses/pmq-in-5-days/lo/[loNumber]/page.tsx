import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoSkipAuth } from "@/lib/demo";
import { isQaMode } from "@/lib/qa";
import {
  getAiTutorEntitlement,
  getAiTutorPriceCents,
  getCourseCompletion,
  getLoQuizPriorAttempts,
  getPractiseQuizXp,
  getPmqCourse,
  getPmqLoPageData,
  getPmqPracticeSetCount,
  getPmqSections,
  getSectionProgress,
  getUserCourseStats,
  getPmqTier,
} from "@/lib/pmq/queries";
import { canAccessMedia, canAccessSly } from "@/lib/pmq/tiers";
import { LoStudyJourney } from "@/components/pmq/LoStudyJourney";
import { LoAnalytics } from "@/components/pmq/LoAnalytics";
import type { LoStageId } from "@/lib/pmq/lo-stages";
import { AiTutorPanel } from "@/components/pmq/AiTutorPanel";
import { DemoBanner } from "@/components/pmq/DemoBanner";
import {
  PMQ_COURSE_ID,
  PMQ_LO_AUDIO_OVERVIEWS,
  PMQ_LO_EXPLAINER_VIDEOS,
  PMQ_SLUG,
} from "@/lib/pmq/constants";
import { getDisplayFirstName } from "@/lib/user-display";
import { getUserProfile } from "@/lib/profile";

type LoPageProps = {
  params: Promise<{ loNumber: string }>;
};

export default async function PmqLoPage({ params }: LoPageProps) {
  const { loNumber: loNumberRaw } = await params;
  const loNumber = Number(loNumberRaw);

  if (!Number.isInteger(loNumber) || loNumber < 1 || loNumber > 24) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isDemoSkipAuth()) {
    redirect(`/auth/sign-in?next=/courses/pmq-in-5-days/lo/${loNumber}`);
  }

  const [course, pageData, allSections] = await Promise.all([
    getPmqCourse(supabase),
    getPmqLoPageData(supabase, loNumber),
    getPmqSections(supabase),
  ]);

  if (!course || !pageData) {
    notFound();
  }

  const { section, body, questions } = pageData;

  const [
    userTier,
    progress,
    courseStats,
    completion,
    profile,
    priorAttempts,
    loPractiseXp,
    practiceSetCount,
  ] = await Promise.all([
    getPmqTier(supabase, user?.id, course.id),
    user
      ? getSectionProgress(supabase, user.id, section.id)
      : Promise.resolve(null),
    user
      ? getUserCourseStats(supabase, user.id, course.id)
      : Promise.resolve(null),
    user
      ? getCourseCompletion(supabase, user.id, course.id)
      : Promise.resolve(null),
    user ? getUserProfile(supabase, user) : Promise.resolve(null),
    user
      ? getLoQuizPriorAttempts(
          supabase,
          user.id,
          course.id,
          section.lo_code,
        )
      : Promise.resolve({}),
    user
      ? getPractiseQuizXp(supabase, user.id, course.id, section.lo_code)
      : Promise.resolve(0),
    getPmqPracticeSetCount(supabase, section.id, loNumber),
  ]);

  // LIC-31: streak ticks on any LO visit (once per UTC calendar day),
  // not just after quiz attempts. Not shown in LO chrome — still recorded.
  if (user && courseStats) {
    const today = new Date().toISOString().slice(0, 10);
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const yesterday = d.toISOString().slice(0, 10);

    if (courseStats.last_activity_date !== today) {
      const nextStreak =
        courseStats.last_activity_date === yesterday
          ? courseStats.current_streak + 1
          : 1;
      const nextLongest = Math.max(courseStats.longest_streak, nextStreak);
      const now = new Date().toISOString();

      await supabase.from("user_course_stats").upsert(
        {
          user_id: user.id,
          course_id: course.id,
          total_xp: courseStats.total_xp,
          current_streak: nextStreak,
          longest_streak: nextLongest,
          last_activity_date: today,
          updated_at: now,
        },
        { onConflict: "user_id,course_id" },
      );
    }
  }

  const tutorPriceCents = getAiTutorPriceCents(course);
  const completedCheckpoints = progress?.checklist_state ?? [];
  const quizCompleted = !!progress?.quiz_completed_at;
  const isSectionCompleted = !!progress?.completed_at;
  const dbReachedStageIds: LoStageId[] = [
    progress?.orient_reached_at ? "orient" : null,
    progress?.learn_reached_at ? "learn" : null,
    progress?.video_reached_at ? "video" : null,
    progress?.audio_reached_at ? "audio" : null,
    progress?.apply_reached_at ? "apply" : null,
  ].filter((id): id is LoStageId => id !== null);
  const explainerVideo = PMQ_LO_EXPLAINER_VIDEOS[loNumber];
  const audioOverview = PMQ_LO_AUDIO_OVERVIEWS[loNumber];
  // Zero pathway stages across the course = first real LO visit.
  const isFirstLoVisit = (completion?.percentExact ?? 0) === 0;
  const courseJustCompleted = (completion?.completedCount ?? 0) >= 24;

  return (
    <>
      <DemoBanner isSignedIn={!!user} />

      <LoAnalytics
        loNumber={loNumber}
        courseId={course.id ?? PMQ_COURSE_ID}
        isFirstLoVisit={isFirstLoVisit}
        courseJustCompleted={courseJustCompleted}
      />

      <LoStudyJourney
        loNumber={loNumber}
        loTitle={section.title}
        loCode={section.lo_code}
        sectionId={section.id}
        courseId={course.id}
        dayNumber={section.day}
        body={body}
        set1Questions={questions}
        totalSets={practiceSetCount}
        priorAttempts={priorAttempts}
        initialLoXp={loPractiseXp}
        hasEntitlement={canAccessMedia(userTier)}
        userTier={userTier}
        priceCents={tutorPriceCents}
        completedCheckpoints={completedCheckpoints}
        quizCompleted={quizCompleted}
        isSectionCompleted={isSectionCompleted}
        explainerVideo={explainerVideo}
        audioOverview={audioOverview}
        allSections={allSections}
        showQaComplete={isQaMode() && !!user}
        dbReachedStageIds={dbReachedStageIds}
        completionPercent={completion?.percentExact ?? 0}
      />

      {/*
        Sly is AI Pro only, and the AI Pro Bundle isn't on sale yet — so for
        Starter and Pro the panel is not rendered at all, rather than rendered
        locked. A padlocked tutor advertises something nobody can buy, which
        reads as a broken feature instead of a future one.
      */}
      {canAccessSly(userTier) ? (
      <AiTutorPanel
        isUnlocked
        priceCents={tutorPriceCents}
        loNumber={loNumber}
        courseId={course.id}
        returnPath={`/courses/${PMQ_SLUG}/lo/${loNumber}`}
        courseComplete={(completion?.completedCount ?? 0) >= 24}
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
