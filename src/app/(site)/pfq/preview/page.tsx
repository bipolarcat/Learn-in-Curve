import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import styles from "@/app/courses/pmq-in-5-days/preview/PreviewPage.module.css";

/**
 * Guest destination for PFQ “Enrol for Free”.
 * Account creation only — does not unlock Pro-gated lessons, practice, or mock.
 */
export default function PfqPreviewPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.courseTitle}>PFQ in 2 Days</h1>
      <AuthDeskPanel mode="sign-up" nextPath="/dashboard" headingLevel={2} />
    </section>
  );
}
