import type { ReactNode } from "react";
import styles from "./HomeMethodBand.module.css";

type HomeMethodBandProps = {
  children: ReactNode;
};

/**
 * Wispr Flow–style inset teal stadium wrapping Method + practice console
 * so they read as one band, not stacked sections.
 */
export function HomeMethodBand({ children }: HomeMethodBandProps) {
  return (
    <section
      id="home-method-band"
      aria-label="The Method"
      className={styles.section}
    >
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.panel}>
          <div className={styles.inner}>{children}</div>
        </div>
      </div>
    </section>
  );
}
