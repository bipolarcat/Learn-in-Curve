"use client";

import { useEffect } from "react";
import { SiteStatusPage } from "@/components/SiteStatusPage";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Segment error boundary — unexpected render/runtime failures.
 * Preview: temporarily throw in a page, or call reset after fixing.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return <SiteStatusPage variant="error" onRetry={reset} />;
}
