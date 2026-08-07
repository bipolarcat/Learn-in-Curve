"use client";

import { useEffect } from "react";
import {
  setAnalyticsPersonProperties,
} from "@/lib/analytics/events";

/**
 * Dashboard-only person properties. Tier (and streaks/XP) are already loaded
 * on this page — do not mount this from the root layout (that would force
 * getPmqTier on every navigation).
 */
export function DashboardAnalyticsPerson({
  tier,
  hasExamDate,
  daysUntilExam,
  currentStreak,
  totalXp,
  losCompleted,
}: {
  tier: string;
  hasExamDate: boolean;
  daysUntilExam: number | null;
  currentStreak: number;
  totalXp: number;
  losCompleted: number;
}) {
  useEffect(() => {
    setAnalyticsPersonProperties({
      tier,
      has_exam_date: hasExamDate,
      days_until_exam: daysUntilExam,
      current_streak: currentStreak,
      total_xp: totalXp,
      los_completed: losCompleted,
    });
  }, [
    tier,
    hasExamDate,
    daysUntilExam,
    currentStreak,
    totalXp,
    losCompleted,
  ]);

  return null;
}
