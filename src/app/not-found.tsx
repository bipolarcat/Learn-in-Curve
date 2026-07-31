import type { Metadata } from "next";
import { SiteStatusPage } from "@/components/SiteStatusPage";

export const metadata: Metadata = {
  title: "Page not found — Learn in Curve",
};

/**
 * Global 404 — unknown URLs and `notFound()` from any route.
 * Preview: visit any missing path, e.g. /this-is-not-a-page
 */
export default function NotFound() {
  return <SiteStatusPage variant="not-found" />;
}
