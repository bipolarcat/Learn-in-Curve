import type { Course } from "@/types/database";
import {
  COURSE_STATIC,
  PFQ_PRO_PRICE_CENTS,
  PMQ_SLUG,
  PFQ_SLUG,
} from "@/lib/courses/registry-data";
import { PMQ_COURSE_ID, PFQ_COURSE_ID } from "@/lib/courses/ids";

/**
 * Public catalogue shown on /courses (and landing teaser references live count).
 * Planned courses are honest coming-soon stubs — not unlockable product yet.
 *
 * Paid-unlock prices come from the course registry. PMQ's catalogue
 * `price_cents` stays 0 because the course itself is free (Pro unlock is
 * separate); PFQ's catalogue price is the Paid Unlock price.
 */
export const CATALOG_COURSES: Course[] = [
  {
    id: PMQ_COURSE_ID,
    slug: PMQ_SLUG,
    name: COURSE_STATIC["pmq-in-5-days"].displayName,
    description:
      "Everything You Need to Pass Your APM - Project Management Qualification Exam",
    price_cents: 0,
    is_free: true,
    status: "live",
    created_at: "",
    has_mock_exam: true,
    pass_mark_percent: 70,
    exam_config: {},
  },
  {
    id: PFQ_COURSE_ID,
    slug: PFQ_SLUG,
    name: COURSE_STATIC["pfq-in-2-days"].displayName,
    description:
      "59 lessons, practice, a timed mock and a coverage map of every APM PFQ learning outcome.",
    price_cents: PFQ_PRO_PRICE_CENTS,
    is_free: false,
    status: "live",
    created_at: "",
    has_mock_exam: true,
    pass_mark_percent: 60,
    exam_config: {},
  },
];

export type CatalogFilter = "all" | "live" | "coming";

export function filterCatalogCourses(
  courses: Course[],
  filter: CatalogFilter,
): Course[] {
  if (filter === "live") {
    return courses.filter((c) => c.status === "live");
  }
  if (filter === "coming") {
    return courses.filter((c) => c.status !== "live");
  }
  return courses;
}

export function catalogLiveCount(courses: Course[] = CATALOG_COURSES): number {
  return courses.filter((c) => c.status === "live").length;
}
