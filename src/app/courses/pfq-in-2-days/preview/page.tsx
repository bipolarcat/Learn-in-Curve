import type { Metadata } from "next";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import styles from "@/app/courses/pmq-in-5-days/preview/PreviewPage.module.css";
import { buildTitle } from "@/lib/seo/title";
import { PFQ_BASE_HREF } from "@/lib/pfq/constants";
import {
  parseSoftNavFrom,
  resolveSoftNavBack,
} from "@/lib/soft-nav-back";

/**
 * Guest destination for PFQ “Start free course”.
 * Same fox + signup card as `/auth/sign-up`, with the course named in-card.
 * Account creation only — does not unlock Pro-gated lessons, practice, or mock.
 */
export const metadata: Metadata = {
  title: buildTitle("Sign up for PFQ in 2 Days"),
  robots: { index: false, follow: true },
};

type PfqPreviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PfqPreviewPage({
  searchParams,
}: PfqPreviewPageProps) {
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
          nextPath={PFQ_BASE_HREF}
          courseTitle={
            <>
              PFQ in <span className="text-orange">2 Days</span>
            </>
          }
          courseTitleLevel={2}
          title="Create your free account and start preparing for the PFQ exam today."
          titleAs="p"
          hideLead
        />
      </div>
    </section>
  );
}
