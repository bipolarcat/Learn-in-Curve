"use client";

import {
  CourseHeader,
} from "@/components/course/CourseHeader";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import type { ComponentProps } from "react";

type PmqCourseHeaderProps = Omit<ComponentProps<typeof CourseHeader>, "slug">;

/**
 * PMQ thin wrapper — keeps existing call sites unchanged.
 * Overview link is always `/courses/pmq-in-5-days`.
 */
export function PmqCourseHeader(props: PmqCourseHeaderProps) {
  return <CourseHeader slug={PMQ_SLUG} {...props} />;
}
