import type { Metadata } from "next";
import { SiteStatusPage } from "@/components/SiteStatusPage";
import { buildTitle } from "@/lib/seo/title";

export const metadata: Metadata = {
  title: buildTitle("Page not found"),
};

/**
 * Global 404 — unknown URLs and `notFound()` from any route.
 * Preview: visit any missing path, e.g. /this-is-not-a-page
 */
export default function NotFound() {
  return <SiteStatusPage variant="not-found" />;
}
