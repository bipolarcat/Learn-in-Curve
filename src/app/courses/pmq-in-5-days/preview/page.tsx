import type { Metadata } from "next";
import { getPmqCourse } from "@/lib/pmq/queries";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import styles from "./PreviewPage.module.css";
import { buildTitle } from "@/lib/seo/title";
import {
  parseSoftNavFrom,
  resolveSoftNavBack,
} from "@/lib/soft-nav-back";

/**
 * Guest destination for hero Enrol for Free and Starter Pack Start Free.
 * Same fox + signup card as /auth/sign-up. Noindex: a form, not a landing page.
 */
export const metadata: Metadata = {
  title: buildTitle("Sign up for PMQ in 5 Days"),
  robots: { index: false, follow: true },
};

type PmqPreviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PmqPreviewPage({
  searchParams,
}: PmqPreviewPageProps) {
  const supabase = await createClient();
  const course = await getPmqCourse(supabase);

  if (!course || course.status !== "live") {
    redirect("/");
  }

  const from = parseSoftNavFrom((await searchParams)?.from);
  const back = resolveSoftNavBack(from);

  return (
    <section className={styles.page}>
      <div className={styles.stack}>
        <SoftNavBackLink
          href={back.href}
          label={back.label}
          busyLabel={back.busyLabel}
          className={styles.back}
        />
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
      </div>
    </section>
  );
}
