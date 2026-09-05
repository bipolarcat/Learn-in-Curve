import styles from "./PfqTip.module.css";

type Props = {
  tip: string | null | undefined;
};

/**
 * Review-time exam-technique tip. Hidden when tip is missing or blank.
 */
export function PfqTip({ tip }: Props) {
  const text = typeof tip === "string" ? tip.trim() : "";
  if (!text) return null;

  return (
    <aside className={styles.tip} aria-label="Tip">
      <span className={styles.icon} aria-hidden="true">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18h6M10 21h4M12 3a7 7 0 0 0-4 12.7V17h8v-1.3A7 7 0 0 0 12 3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className={styles.body}>
        <span className={styles.label}>Tip</span>
        {text}
      </p>
    </aside>
  );
}
