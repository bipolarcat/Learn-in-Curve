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
      <AuthDeskPanel
        mode="sign-up"
        nextPath="/courses/pmq-in-5-days"
      />
    </section>
  );
}
