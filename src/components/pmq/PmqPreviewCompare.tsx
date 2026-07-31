import type { ComponentType, ReactNode } from "react";
import { formatGbp } from "@/lib/pmq/constants";
import {
  IconAudio,
  IconCore,
  IconMemory,
  IconMisconceptions,
  IconMock,
  IconPractice,
  IconSly,
  IconVideo,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import styles from "./PmqPreviewCompare.module.css";

type CellValue = "tick" | "hyphen" | string;

type CompareRow = {
  id: string;
  feature: ReactNode;
  starter: CellValue;
  pro: CellValue;
  Icon: ComponentType<{ className?: string }>;
};

const ROWS: CompareRow[] = [
  {
    id: "core",
    feature: (
      <>
        Core study content
        <br />
        for all 24 learning objectives
      </>
    ),
    starter: "tick",
    pro: "tick",
    Icon: IconCore,
  },
  {
    id: "practice",
    feature: "Practice quiz questions",
    starter: "240",
    pro: "1800+",
    Icon: IconPractice,
  },
  {
    id: "mock",
    feature: "Mock exam",
    starter: "1",
    pro: "4",
    Icon: IconMock,
  },
  {
    id: "misconceptions",
    feature: "Common Misconceptions",
    starter: "tick",
    pro: "tick",
    Icon: IconMisconceptions,
  },
  {
    id: "memory",
    feature: "Memory Aids",
    starter: "tick",
    pro: "tick",
    Icon: IconMemory,
  },
  {
    id: "sly",
    feature: "AI tutor (Sly)",
    starter: "hyphen",
    pro: "tick",
    Icon: IconSly,
  },
  {
    id: "video",
    feature: "Video overview",
    starter: "hyphen",
    pro: "tick",
    Icon: IconVideo,
  },
  {
    id: "audio",
    feature: "Audio overview",
    starter: "hyphen",
    pro: "tick",
    Icon: IconAudio,
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === "tick") {
    return (
      <span className={styles.tick} aria-label="Included" title="Included">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
          <circle cx="12" cy="12" r="11" fill="currentColor" />
          <path
            d="M7.2 12.4 l3 3.1 6.6-6.8"
            fill="none"
            stroke="#FBF3E1"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (value === "hyphen") {
    return (
      <span className={styles.hyphen} aria-label="Not included" title="Not included">
        -
      </span>
    );
  }
  return <span className={styles.cellText}>{value}</span>;
}

type PmqPreviewCompareProps = {
  priceCents: number;
  /** External heading id — skips the internal sr-only title. */
  labelledBy?: string;
};

/**
 * Starter vs Pro Bundle — Affinity-style plan cards + hero-illustration feature icons.
 * Conversion lives in the sticky sign-up panel (no duplicate Pro CTA).
 */
export function PmqPreviewCompare({
  priceCents,
  labelledBy,
}: PmqPreviewCompareProps) {
  const priceLabel = formatGbp(priceCents);
  const titleId = labelledBy ?? "preview-compare-title";

  return (
    <section aria-labelledby={titleId} className={styles.root}>
      {labelledBy ? null : (
        <h2 id="preview-compare-title" className="sr-only">
          Starter and Pro Bundle comparison
        </h2>
      )}

      <div className={styles.scroller}>
        <div
          className={styles.board}
          role="table"
          aria-label={`Comparison of Starter (free) and Pro Bundle (${priceLabel})`}
        >
          <div className={`${styles.card} ${styles.labels}`} role="rowgroup">
            <div className={styles.featureHead} role="columnheader">
              <span className={styles.featureHeadTitle}>What you get</span>
            </div>
            {ROWS.map((row) => {
              const Icon = row.Icon;
              return (
                <div key={row.id} className={styles.feature} role="rowheader">
                  <Icon className={styles.featureIcon} />
                  <span className={styles.featureText}>{row.feature}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.card} role="rowgroup">
            <div className={styles.planHead} role="columnheader">
              <span className={styles.planName}>Starter</span>
              <span className={styles.planMeta}>(Free)</span>
            </div>
            {ROWS.map((row) => (
              <div key={row.id} className={styles.cell} role="cell">
                <CellContent value={row.starter} />
              </div>
            ))}
          </div>

          <div className={`${styles.card} ${styles.cardPro}`} role="rowgroup">
            <div className={styles.planHead} role="columnheader">
              <span className={styles.planName}>Pro Bundle</span>
              <span className={styles.planMeta}>
                ({priceLabel} One-off)
              </span>
            </div>
            {ROWS.map((row) => (
              <div key={row.id} className={styles.cell} role="cell">
                <CellContent value={row.pro} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
