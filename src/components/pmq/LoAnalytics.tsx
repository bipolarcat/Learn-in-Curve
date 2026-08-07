"use client";

import { useEffect, useRef } from "react";
import {
  trackCourseCompleted,
  trackCourseStarted,
  trackLoOpened,
} from "@/lib/analytics/events";

/**
 * Fires once per LO page mount: lo_opened, and optionally course_started /
 * course_completed. Idempotent enough for analytics — remounts re-fire;
 * PostHog funnels tolerate that better than missing the start signal.
 */
export function LoAnalytics({
  loNumber,
  courseId,
  isFirstLoVisit,
  courseJustCompleted,
}: {
  loNumber: number;
  courseId: string;
  isFirstLoVisit: boolean;
  courseJustCompleted: boolean;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    trackLoOpened({ lo_number: loNumber });
    if (isFirstLoVisit) {
      trackCourseStarted({ course_id: courseId });
    }
    if (courseJustCompleted) {
      trackCourseCompleted({ course_id: courseId });
    }
  }, [loNumber, courseId, isFirstLoVisit, courseJustCompleted]);

  return null;
}
