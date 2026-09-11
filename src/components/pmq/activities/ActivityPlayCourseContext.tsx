"use client";

import { createContext, useContext, type ReactNode } from "react";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";

type ActivityPlayCourseContextValue = {
  loNumber: number;
  courseId: string;
};

const ActivityPlayCourseContext =
  createContext<ActivityPlayCourseContextValue | null>(null);

export function ActivityPlayCourseProvider({
  loNumber,
  courseId = PMQ_COURSE_ID,
  children,
}: ActivityPlayCourseContextValue & { children: ReactNode }) {
  return (
    <ActivityPlayCourseContext.Provider value={{ loNumber, courseId }}>
      {children}
    </ActivityPlayCourseContext.Provider>
  );
}

export function useActivityPlayCourse(): ActivityPlayCourseContextValue {
  return (
    useContext(ActivityPlayCourseContext) ?? {
      loNumber: 0,
      courseId: PMQ_COURSE_ID,
    }
  );
}
