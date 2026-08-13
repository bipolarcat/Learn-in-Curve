import type { Course } from "@/types/database";

/**
 * Public catalogue shown on /courses (and landing teaser references live count).
 * Planned courses are honest coming-soon stubs — not unlockable product yet.
 */
export const CATALOG_COURSES: Course[] = [
  {
    id: "3b6e12c0-321f-41b2-8536-db39f5678301",
    slug: "pmq-in-5-days",
    name: "PMQ in 5 Days",
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
    id: "f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d",
    slug: "pfq-in-2-days",
    name: "PFQ in 2 Days",
    description:
      "59 lessons, practice, a timed mock and a coverage map of every APM PFQ learning outcome.",
    price_cents: 500,
    is_free: false,
    status: "planned",
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
