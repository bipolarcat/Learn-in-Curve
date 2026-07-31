import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course, UserCourse } from "@/types/database";

export async function getUserCourses(
  userId: string,
  supabase: SupabaseClient,
): Promise<UserCourse[]> {
  const [{ data: entitlements }, { data: freeCourses }] = await Promise.all([
    supabase
      .from("entitlements")
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
