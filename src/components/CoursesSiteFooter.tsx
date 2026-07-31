"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { PMQ_SLUG } from "@/lib/pmq/constants";

const OVERVIEW_PATH = `/courses/${PMQ_SLUG}`;

/**
 * Courses-tree footer. APM disclaimer only on the PMQ course overview
 * (`/courses/pmq-in-5-days`) — not LO pages, pricing, preview, or mock.
 */
export function CoursesSiteFooter() {
  const pathname = usePathname();
  const showApmDisclaimer =
    pathname === OVERVIEW_PATH || pathname === `${OVERVIEW_PATH}/`;

  return <SiteFooter showApmDisclaimer={showApmDisclaimer} />;
}
