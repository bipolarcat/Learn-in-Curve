import type { Metadata } from "next";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import styles from "@/app/courses/pmq-in-5-days/preview/PreviewPage.module.css";
import { buildTitle } from "@/lib/seo/title";
import { PFQ_BASE_HREF } from "@/lib/pfq/constants";

/**
 * Guest destination for PFQ “Start free course”.
 * Same fox + signup card as `/auth/sign-up`, with the course named in-card.
 * Account creation only — does not unlock Pro-gated lessons, practice, or mock.
 */
export const metadata: Metadata = {
  title: buildTitle("Sign up for PFQ in 2 Days"),
  robots: { index: false, follow: true },
};

export default function PfqPreviewPage() {
  return (
    <section className={styles.page}>
      <AuthDeskPanel
        mode="sign-up"
        nextPath={PFQ_BASE_HREF}
        courseTitle={
          <>
            PFQ in <span className="text-orange">2 Days</span>
          </>
        }
        title="Create your free account and start preparing for the PFQ exam today."
        hideLead
      />
    </section>
  );
}
