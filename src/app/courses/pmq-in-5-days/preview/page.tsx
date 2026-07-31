import { getPmqCourse } from "@/lib/pmq/queries";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import styles from "./PreviewPage.module.css";

/**
 * Guest destination for hero “Start Free with APM PMQ”, Enrol for Free,
 * and Starter Pack “Start Free” — same fox + signup card as /auth/sign-up.
 */
export default async function PmqPreviewPage() {
  const supabase = await createClient();
  const course = await getPmqCourse(supabase);

  if (!course || course.status !== "live") {
    redirect("/");
  }

  return (
    <section className={styles.page}>
      {/*
        The page names the course it is a preview of.

        `course` was already fetched here and used only for the live-status
        guard, so this page — reached from "Start Free with APM PMQ", "Enrol for
        Free" and the Starter Pack CTA — asked people to create an account
        without ever saying what they were signing up for. Its only heading was
        the shared auth card's generic "Start learning for free".

        The card's title drops to h2 beneath this, so the page keeps one h1 and
        a heading order that matches what it actually is.
      */}
      <h1 className={styles.courseTitle}>{course.name}</h1>
      <AuthDeskPanel
        mode="sign-up"
        nextPath="/courses/pmq-in-5-days"
        headingLevel={2}
      />
    </section>
  );
}
