import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { getUserCourses } from "@/lib/courses";
import { CATALOG_COURSES } from "@/lib/courses-catalog";
import { CoursesCatalog } from "@/components/CoursesCatalog";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import {
  parseSoftNavFrom,
  SOFT_NAV_BACK,
} from "@/lib/soft-nav-back";
import styles from "./CoursesPage.module.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "Courses — Learn in Curve",
  description:
    "Pick your course. APM PMQ in 5 Days is live; PFQ is on the way.",
  alternates: { canonical: `${SITE_URL}/courses` },
};

type CoursesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  const enrolledSlugs = user
    ? (await getUserCourses(user.id, supabase)).map((course) => course.slug)
    : [];

  const from = parseSoftNavFrom((await searchParams)?.from);
  const back = from === "home" ? SOFT_NAV_BACK.home : null;

  return (
    <section
      id="catalogue"
      className={`${styles.catalogue} relative`}
    >
      <div className="wrap relative z-10">
        {back ? (
          <SoftNavBackLink
            href={back.href}
            label={back.label}
            busyLabel={back.busyLabel}
            className={styles.back}
          />
        ) : null}
        <CoursesCatalog
          courses={CATALOG_COURSES}
          isSignedIn={isSignedIn}
          enrolledSlugs={enrolledSlugs}
        />
      </div>
    </section>
  );
}
