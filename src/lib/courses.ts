import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course, UserCourse } from "@/types/database";

/**
 * Every course a user can open, from two independent sources:
 *
 *  1. `feature_entitlements` — one row per paid unlock, keyed
 *     (user_id, course_id, feature). This is the table the Stripe webhook and
 *     every gate write to. Several rows can share a course_id (PMQ Pro and
 *     AI Pro), so the map below is keyed on course id and collapses them.
 *  2. Free-and-live courses — PMQ, which anyone can open without a purchase.
 *
 * Was pointed at the legacy `entitlements` table until 2026-08-19. Nothing has
 * written to that table since the feature-entitlement split, so a PFQ purchase
 * never appeared on the dashboard: it is not free, and its row lives in
 * `feature_entitlements`. Do not point this back at `entitlements`.
 */
export async function getUserCourses(
  userId: string,
  supabase: SupabaseClient,
): Promise<UserCourse[]> {
  const [{ data: entitlements }, { data: freeCourses }] = await Promise.all([
    supabase
      .from("feature_entitlements")
      .select("id, user_id, course_id, granted_at, courses(*)")
      .eq("user_id", userId),
    supabase
      .from("courses")
      .select("*")
      .eq("is_free", true)
      .eq("status", "live"),
  ]);

  const courseMap = new Map<string, UserCourse>();

  for (const row of entitlements ?? []) {
    const course = row.courses as Course | Course[] | null | undefined;
    const resolved = Array.isArray(course) ? course[0] : course;
    if (!resolved) continue;
    courseMap.set(resolved.id, {
      ...resolved,
      entitlement_id: row.id,
      access_type: "entitlement",
    });
  }

  for (const course of (freeCourses ?? []) as Course[]) {
    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, {
        ...course,
        access_type: "free",
      });
    }
  }

  return Array.from(courseMap.values());
}

export function getCourseHref(slug: string): string {
  return `/courses/${slug}`;
}
