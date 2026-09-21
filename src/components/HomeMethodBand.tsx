import type { ReactNode } from "react";
import styles from "./HomeMethodBand.module.css";

type HomeMethodBandProps = {
  children: ReactNode;
};

/**
 * Wispr Flow–style teal stadium: full viewport width, content still in `.wrap`.
 * Method + practice console read as one band.
 */
export function HomeMethodBand({ children }: HomeMethodBandProps) {
  return (
    <section
      id="home-method-band"
      aria-label="The Method"
      className={styles.section}
    >
      <div className={styles.panel}>
        <div className={`wrap ${styles.inner}`}>{children}</div>
      </div>
    </section>
  );
}
