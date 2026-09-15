"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { PFQ_LEARN_HREF } from "@/lib/pfq/constants";
import { PMQ_SLUG } from "@/lib/pmq/constants";

const PMQ_OVERVIEW_PATH = `/courses/${PMQ_SLUG}`;
const PFQ_LEARN_PATH = PFQ_LEARN_HREF;

/**
 * Courses-tree footer.
 * APM affiliation disclaimer on PMQ course overview and PFQ learn overview
 * (same wording as PMQ — `APM_DISCLAIMER`).
 */
export function CoursesSiteFooter() {
  const pathname = usePathname();
  const showApmDisclaimer =
    pathname === PMQ_OVERVIEW_PATH ||
    pathname === `${PMQ_OVERVIEW_PATH}/` ||
    pathname === PFQ_LEARN_PATH ||
    pathname === `${PFQ_LEARN_PATH}/`;

  return <SiteFooter showApmDisclaimer={showApmDisclaimer} />;
}
