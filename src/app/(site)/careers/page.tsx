import Link from "next/link";
import { marketingActionPrimary } from "@/components/ui/semantic";
import styles from "./CareersPage.module.css";

export const metadata = {
  title: "Careers - Learn in Curve",
};

export default function CareersPage() {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className="max-w-[17ch] font-display text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-balance">
          No open roles right now - but we&apos;re always curious.
        </h1>

        <div className={styles.copy}>
          <p>
            Learn in Curve turns exam revision into something people actually
            want to open - quizzes, streaks, and a proper AI tutor, built for
            people studying for real professional exams like the APM PMQ.
          </p>
          <p>
            We&apos;re looking for people who care about the small details as
            much as the big ones - sharp writers, careful engineers, anyone
            who&apos;d rather ship something good than something merely
            finished.
          </p>
        </div>

        <div className={styles.status}>
          <h2 className="font-display text-2xl font-bold tracking-[-0.025em]">
            Currently: no open positions.
          </h2>
          <p className="max-w-[48ch] text-[15px] leading-relaxed text-ink/72">
            Think you&apos;d be a good fit anyway? Tell us why.
          </p>
          <a
            href="mailto:support@learnincurve.com?subject=Learn%20in%20Curve%20%E2%80%94%20Careers"
            className={marketingActionPrimary}
          >
            Send an introduction
          </a>
        </div>

        <p className={styles.meta}>
          Remote ·{" "}
          <Link href="/recruitment-privacy" className="text-teal hover:text-orange">
            Read how we handle application data →
          </Link>
        </p>
      </div>
    </section>
  );
}
