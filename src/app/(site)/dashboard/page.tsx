import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserCourses } from "@/lib/courses";
import {
  getPmqTier,
  getAiTutorPriceCents,
  getCompletedSectionIds,
  getCourseCompletion,
  getLoStageReachedMap,
  getPmqSections,
  getUserCourseStats,
} from "@/lib/pmq/queries";
import { getNextIncompleteSection } from "@/lib/pmq/progress";
import { getAiTutorFairUsageSummary, hasCourseCompletionReport } from "@/lib/tutor/tutor-db";
import { canAccessCourseReport, canAccessSly } from "@/lib/pmq/tiers";
import { summarizeFairUsage } from "@/lib/tutor/fair-usage";
import { SLY_UNLOCK_PRICE_CENTS } from "@/lib/tutor/constants";
import { PMQ_SLUG, pmqLoHref } from "@/lib/pmq/constants";
import { DashboardPmqCourseCard } from "@/components/pmq/DashboardPmqCourseCard";
import { CourseReportCard } from "@/components/pmq/CourseReportCard";
import { DashboardProfileMenu } from "@/components/DashboardProfileMenu";
import { getUserProfile } from "@/lib/profile";
import { getWelcomeEyebrow } from "@/lib/user-display";
import { authHrefWithNext } from "@/lib/auth-next";
import { productSurfaceQuiet } from "@/components/ui/semantic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(key, item));
      } else if (value !== undefined) {
        query.set(key, value);
      }
    }
    const requestedPath = `/dashboard${query.size ? `?${query}` : ""}`;
    redirect(authHrefWithNext("/auth/sign-in", requestedPath));
  }

  const topUpSuccess = params.sly_topup === "1";

  const [courses, profile] = await Promise.all([
    getUserCourses(user.id, supabase),
    getUserProfile(supabase, user),
  ]);
  const pmqCourse = courses.find((c) => c.slug === PMQ_SLUG);

  const [stats, userTier, completion, sections, completedSectionIds, hasReport, loStageReached] =
    pmqCourse
      ? await Promise.all([
          getUserCourseStats(supabase, user.id, pmqCourse.id),
          getPmqTier(supabase, user.id, pmqCourse.id),
          getCourseCompletion(supabase, user.id, pmqCourse.id),
          getPmqSections(supabase),
          getCompletedSectionIds(supabase, user.id, pmqCourse.id),
          hasCourseCompletionReport(supabase, user.id, pmqCourse.id),
          getLoStageReachedMap(supabase, user.id, pmqCourse.id),
        ])
      : [null, "starter" as const, null, [], [], false, {} as Record<string, number>];

  // Sly fair-usage meter is an AI Pro surface — never compute or show it for
  // Starter/Pro, who have no tutor at all.
  const tutorUsage =
    pmqCourse && canAccessSly(userTier)
      ? await getAiTutorFairUsageSummary(
          supabase,
          user.id,
          pmqCourse.id,
          { hasEntitlement: true },
        ).catch((err) => {
          console.error("fair usage summary failed:", err);
          return summarizeFairUsage([], 0, { hasEntitlement: true });
        })
      : null;

  const tutorPriceCents = pmqCourse
    ? getAiTutorPriceCents(pmqCourse)
    : SLY_UNLOCK_PRICE_CENTS;
  const overviewHref = `/courses/${PMQ_SLUG}`;
  const nextSection =
    sections.length > 0
      ? getNextIncompleteSection(sections, completedSectionIds)
      : null;
  const continueHref = nextSection
    ? pmqLoHref(nextSection.order_index)
    : overviewHref;
  const continueLabel = nextSection
    ? "Continue studying"
    : "Review course";
  const nextLoNumber = nextSection?.order_index ?? null;
  const nextLoStarted = nextSection
    ? (loStageReached[nextSection.id] ?? 0) > 0
    : false;
  const courseComplete = sections.length > 0 && nextSection === null;

  // Backfill report for Pro users who already finished before LIC-65 shipped.
  if (pmqCourse && canAccessCourseReport(userTier) && courseComplete && !hasReport) {
    void import("@/lib/tutor/course-completion-summary")
      .then(({ maybeDeliverCourseCompletionSummary }) =>
        maybeDeliverCourseCompletionSummary(supabase, user.id, pmqCourse.id),
      )
      .catch((err) => {
        console.error("course report backfill failed:", err);
      });
  }

  const welcome = getWelcomeEyebrow({
    profileFirstName: profile.first_name,
    user,
    hasCompletedLo: completedSectionIds.length > 0,
  });

  return (
    <section className="relative z-0 min-h-[calc(100dvh-4.25rem-7.5rem)] px-3 py-8 sm:min-h-[calc(100dvh-4.75rem-7.5rem)] sm:px-5 sm:py-10">
      <div className="relative z-20 mx-auto max-w-wrap">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <h1
            className="min-w-0 font-display text-[1.75rem] font-bold tracking-[-0.02em] text-ink motion-safe:animate-[fadeSlideIn_600ms_ease-out_both] sm:text-[2rem]"
          >
            {welcome}
          </h1>
          <DashboardProfileMenu
            email={user.email ?? ""}
            initial={profile}
          />
        </header>

        {courses.length === 0 ? (
          <div
            className={`${productSurfaceQuiet} mx-auto max-w-md px-6 py-10 text-center`}
          >
            <h2 className="font-body text-[1.0625rem] font-medium tracking-tight text-ink">
              No courses yet
            </h2>
            <p className="mx-auto mt-2 max-w-[36ch] text-[13px] leading-relaxed text-ink/60 text-pretty">
              Browse the catalog to find your next exam revision course.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-action px-4 text-[13px] font-semibold text-paper transition-[background-color,transform] duration-150 ease-[var(--ease-out-quint)] hover:bg-action-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid max-w-md gap-4">
            {pmqCourse && stats ? (
              <>
                <DashboardPmqCourseCard
                  courseName={pmqCourse.name}
                  overviewHref={overviewHref}
                  continueHref={continueHref}
                  continueLabel={continueLabel}
                  nextLoNumber={nextLoNumber}
                  nextLoStarted={nextLoStarted}
                  streak={stats.current_streak}
                  completionPercent={completion?.percent ?? 0}
                  tutorUnlocked={canAccessSly(userTier)}
                  userTier={userTier}
                  tutorPriceCents={tutorPriceCents}
                  tutorUsage={tutorUsage}
                  topUpSuccess={topUpSuccess}
                  examDeadline={profile.target_exam_date}
                />
                <CourseReportCard
                  courseComplete={courseComplete}
                  hasProEntitlement={userTier !== "starter"}
                  hasReport={hasReport}
                  courseId={pmqCourse.id}
                  tutorPriceCents={tutorPriceCents}
                  returnPath="/dashboard"
                />
              </>
            ) : (
              courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className={`${productSurfaceQuiet} block max-w-md px-4 py-3.5 text-inherit no-underline transition-colors duration-150 hover:border-ink/20`}
                >
                  <h3 className="font-body text-[0.9375rem] font-medium tracking-tight text-ink">
                    {course.name}
                  </h3>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
