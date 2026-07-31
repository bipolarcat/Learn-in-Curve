import Link from "next/link";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import styles from "@/components/LegalPage.module.css";

type LegalPageProps = {
  content: string;
};

export function LegalPage({ content }: LegalPageProps) {
  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>
          ← Back to Learn in Curve
        </Link>
        <div className={styles.content}>
          <MarkdownBlock content={content} />
        </div>
      </div>
    </section>
  );
}
