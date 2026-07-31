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
    id: "pfq-placeholder",
    slug: "pfq-in-2-days",
    name: "PFQ in 2 Days",
    description:
      "Build Strong Project Management Foundations and Pass Your APM PFQ Exam",
    price_cents: 1000,
    is_free: false,
    status: "planned",
    created_at: "",
    has_mock_exam: true,
    pass_mark_percent: 70,
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
