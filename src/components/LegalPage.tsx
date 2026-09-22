import Link from "next/link";
import { MarkdownBlock } from "@/components/pmq/MarkdownBlock";
import styles from "@/components/LegalPage.module.css";

type LegalPageProps = {
  content: string;
  /** Optional interactive block rendered after the markdown (e.g. the cookie
   *  consent withdrawal button). The legal text itself stays a static file. */
  children?: React.ReactNode;
};

export function LegalPage({ content, children }: LegalPageProps) {
  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>
          ← Back to Learn in Curve
        </Link>
        <div className={styles.content}>
          <MarkdownBlock content={content} />
          {children}
        </div>
      </div>
    </section>
  );
}
