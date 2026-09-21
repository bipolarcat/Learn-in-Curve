import type { Metadata } from "next";
import { getPmqCourse } from "@/lib/pmq/queries";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import styles from "./PreviewPage.module.css";
import { buildTitle } from "@/lib/seo/title";

/**
 * Guest destination for hero Enrol for Free and Starter Pack Start Free.
 * Same fox + signup card as /auth/sign-up. Noindex: a form, not a landing page.
 */
export const metadata: Metadata = {
  title: buildTitle("Sign up for PMQ in 5 Days"),
  robots: { index: false, follow: true },
};

export default async function PmqPreviewPage() {
  const supabase = await createClient();
  const course = await getPmqCourse(supabase);

  if (!course || course.status !== "live") {
    redirect("/");
  }

  return (
    <section className={styles.page}>
      <AuthDeskPanel
        mode="sign-up"
        nextPath="/courses/pmq-in-5-days"
        courseTitle={
          <>
            PMQ in <span className="text-orange">5 Days</span>
          </>
        }
        courseTitleLevel={2}
        title="Create your free account and start preparing for the PMQ exam today."
        titleAs="p"
        hideLead
      />
    </section>
  );
}
