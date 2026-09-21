import type { ReactNode } from "react";
import type { LibraryGroup } from "@/content/library";

/**
 * The Shelf illustrations — paper plates + black line art.
 * SVG fill matches `.cardArt` / card body so each guide reads as one surface.
 */

const CREAM = "#F4E9D6";
const INK = "#241A12";

function Frame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 112"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="160" height="112" rx="0" fill="rgb(var(--paper-rgb))" />
      {children}
    </svg>
  );
}

const stroke = {
  fill: "none" as const,
  stroke: INK,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Unique Gamma-style plates per guide slug. */
export function LibraryPageIllustration({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  switch (slug) {
    case "apm-pmq-pass-mark":
      // Target + arrow in the bullseye (pass mark)
      return (
        <Frame className={className}>
          <line x1="28" y1="92" x2="132" y2="92" {...stroke} strokeWidth="2" />
          <path d="M36 92 L42 78 L38 78 L48 62" {...stroke} strokeWidth="2" />
          <ellipse cx="42" cy="58" rx="10" ry="8" fill={INK} />
          <path d="M42 66 V92" {...stroke} strokeWidth="2" />
          <rect x="78" y="34" width="48" height="48" rx="3" {...stroke} strokeWidth="2.5" />
          <circle cx="102" cy="58" r="16" {...stroke} strokeWidth="2" />
          <circle cx="102" cy="58" r="9" {...stroke} strokeWidth="2" />
          <circle cx="102" cy="58" r="4" fill={INK} />
          <path d="M64 72 L98 60" {...stroke} strokeWidth="2.5" />
          <path d="M64 72 L60 66 M64 72 L58 74" {...stroke} strokeWidth="2" />
          <path d="M24 40 Q28 28 40 32" {...stroke} strokeWidth="1.5" opacity="0.5" />
        </Frame>
      );

    case "how-hard-is-apm-pmq":
      // Frustrated studier at desk (matches attached Gamma sample mood)
      return (
        <Frame className={className}>
          <line x1="24" y1="86" x2="136" y2="86" {...stroke} strokeWidth="2" />
          <ellipse cx="68" cy="42" rx="16" ry="14" fill={INK} />
          <circle cx="68" cy="52" r="11" {...stroke} strokeWidth="2.2" />
          <circle cx="63" cy="50" r="1.4" fill={INK} />
          <circle cx="74" cy="50" r="1.4" fill={INK} />
          <path d="M60 48 Q63 46 66 48" {...stroke} strokeWidth="1.5" />
          <path d="M71 48 Q74 46 77 48" {...stroke} strokeWidth="1.5" />
          <path d="M64 58 Q68 55 72 58" {...stroke} strokeWidth="1.6" />
          <path d="M57 62 Q50 72 52 86" {...stroke} strokeWidth="2.2" />
          <path d="M78 62 Q92 70 88 86" {...stroke} strokeWidth="2.2" />
          <path d="M88 74 Q96 68 98 58" {...stroke} strokeWidth="2" />
          <circle cx="99" cy="54" r="3.5" {...stroke} strokeWidth="1.8" />
          <rect x="104" y="70" width="28" height="16" rx="2" fill={INK} />
          <rect x="108" y="66" width="20" height="5" rx="1" fill={INK} />
          <rect x="32" y="74" width="18" height="12" rx="1" {...stroke} strokeWidth="1.8" />
          <line x1="35" y1="78" x2="47" y2="78" {...stroke} strokeWidth="1.2" />
          <line x1="35" y1="81" x2="45" y2="81" {...stroke} strokeWidth="1.2" />
          <path d="M42 74 V62" {...stroke} strokeWidth="2" />
          <path d="M38 62 H46 L44 58 H40 Z" fill={INK} />
          <path d="M84 34 L88 28 M90 36 L96 30 M92 40 L100 38" {...stroke} strokeWidth="1.5" />
        </Frame>
      );

    case "apm-pmq-exam-format":
      // Exam booklet + clock
      return (
        <Frame className={className}>
          <rect x="36" y="28" width="52" height="64" rx="3" {...stroke} strokeWidth="2.5" />
          <path d="M62 28 V92" {...stroke} strokeWidth="1.8" />
          <line x1="42" y1="42" x2="56" y2="42" {...stroke} strokeWidth="1.5" />
          <line x1="42" y1="50" x2="54" y2="50" {...stroke} strokeWidth="1.5" />
          <line x1="42" y1="58" x2="56" y2="58" {...stroke} strokeWidth="1.5" />
          <line x1="68" y1="42" x2="80" y2="42" {...stroke} strokeWidth="1.5" />
          <line x1="68" y1="50" x2="78" y2="50" {...stroke} strokeWidth="1.5" />
          <circle cx="112" cy="48" r="18" {...stroke} strokeWidth="2.5" />
          <path d="M112 38 V48 L122 54" {...stroke} strokeWidth="2.5" />
          <circle cx="112" cy="48" r="2" fill={INK} />
        </Frame>
      );

    case "how-long-to-revise-for-apm-pmq":
      // Calendar + hourglass
      return (
        <Frame className={className}>
          <rect x="28" y="30" width="56" height="58" rx="4" {...stroke} strokeWidth="2.5" />
          <path d="M28 44 H84" {...stroke} strokeWidth="2" />
          <path d="M40 24 V36 M70 24 V36" {...stroke} strokeWidth="2.5" />
          <circle cx="42" cy="58" r="3" fill={INK} />
          <circle cx="56" cy="58" r="3" {...stroke} strokeWidth="1.5" />
          <circle cx="70" cy="58" r="3" {...stroke} strokeWidth="1.5" />
          <circle cx="42" cy="72" r="3" {...stroke} strokeWidth="1.5" />
          <circle cx="56" cy="72" r="3" fill={INK} />
          <path d="M104 28 H128 L118 52 L128 76 H104 L114 52 Z" {...stroke} strokeWidth="2.2" />
          <path d="M110 34 H122 M110 70 H122" {...stroke} strokeWidth="1.5" />
        </Frame>
      );

    case "apm-pmq-vs-pfq":
      // Two tickets side by side
      return (
        <Frame className={className}>
          <rect x="24" y="36" width="48" height="48" rx="6" {...stroke} strokeWidth="2.5" />
          <circle cx="24" cy="60" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
          <path d="M36 48 H60 M36 56 H54 M36 64 H58" {...stroke} strokeWidth="1.6" />
          <rect x="88" y="36" width="48" height="48" rx="6" {...stroke} strokeWidth="2.5" />
          <circle cx="136" cy="60" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
          <path d="M100 48 H124 M100 56 H118 M100 64 H122" {...stroke} strokeWidth="1.6" />
          <path d="M76 52 L84 60 L76 68" {...stroke} strokeWidth="2.2" />
        </Frame>
      );

    case "apm-pmq-vs-prince2":
      // Fork in the path
      return (
        <Frame className={className}>
          <path d="M80 96 V58" {...stroke} strokeWidth="3" />
          <path d="M80 58 Q80 40 48 28" {...stroke} strokeWidth="3" />
          <path d="M80 58 Q80 40 112 28" {...stroke} strokeWidth="3" />
          <circle cx="48" cy="28" r="8" {...stroke} strokeWidth="2.2" />
          <circle cx="112" cy="28" r="8" fill={INK} />
          <path d="M44 96 Q56 88 64 96 M96 96 Q104 88 116 96" {...stroke} strokeWidth="1.5" />
          <path d="M28 70 Q36 64 40 72" {...stroke} strokeWidth="1.5" opacity="0.6" />
        </Frame>
      );

    case "apm-pmq-vs-pmp":
      // Balance scales
      return (
        <Frame className={className}>
          <path d="M80 24 V88" {...stroke} strokeWidth="2.5" />
          <path d="M56 88 H104" {...stroke} strokeWidth="2.5" />
          <path d="M40 40 H120" {...stroke} strokeWidth="2.5" />
          <path d="M40 40 L28 64 H52 Z" {...stroke} strokeWidth="2" />
          <path d="M120 40 L108 64 H132 Z" {...stroke} strokeWidth="2" />
          <circle cx="80" cy="40" r="4" fill={INK} />
          <text x="40" y="58" textAnchor="middle" fill={INK} fontSize="9" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            A
          </text>
          <text x="120" y="58" textAnchor="middle" fill={INK} fontSize="9" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            B
          </text>
        </Frame>
      );

    case "is-apm-pmq-worth-it":
      // Coin / value stamp
      return (
        <Frame className={className}>
          <circle cx="80" cy="56" r="32" {...stroke} strokeWidth="3" />
          <circle cx="80" cy="56" r="24" {...stroke} strokeWidth="2" />
          <path d="M80 40 V72 M72 48 H88 M72 64 H88" {...stroke} strokeWidth="2.5" />
          <path d="M118 34 L124 28 M122 40 L130 38" {...stroke} strokeWidth="1.5" />
        </Frame>
      );

    case "apm-pmq-business-case":
      // Briefcase + document
      return (
        <Frame className={className}>
          <rect x="40" y="44" width="80" height="48" rx="4" {...stroke} strokeWidth="2.5" />
          <path d="M60 44 V36 H100 V44" {...stroke} strokeWidth="2.5" />
          <rect x="72" y="60" width="16" height="10" rx="2" {...stroke} strokeWidth="2" />
          <rect x="100" y="28" width="28" height="36" rx="2" fill={CREAM} stroke={INK} strokeWidth="2" />
          <line x1="106" y1="38" x2="122" y2="38" {...stroke} strokeWidth="1.4" />
          <line x1="106" y1="44" x2="120" y2="44" {...stroke} strokeWidth="1.4" />
          <line x1="106" y1="50" x2="118" y2="50" {...stroke} strokeWidth="1.4" />
        </Frame>
      );

    case "apm-pmq-risk-management":
      // Umbrella over storm dots
      return (
        <Frame className={className}>
          <path d="M40 58 Q80 22 120 58" {...stroke} strokeWidth="3" />
          <path d="M40 58 Q60 50 80 58 Q100 50 120 58" fill={INK} opacity="0.12" stroke={INK} strokeWidth="2" />
          <path d="M80 58 V86" {...stroke} strokeWidth="2.5" />
          <path d="M72 86 H88" {...stroke} strokeWidth="2.5" />
          <circle cx="52" cy="72" r="2" fill={INK} />
          <circle cx="64" cy="78" r="2" fill={INK} />
          <circle cx="96" cy="74" r="2" fill={INK} />
          <circle cx="108" cy="80" r="2" fill={INK} />
          <path d="M48 40 L52 34 M112 38 L116 32" {...stroke} strokeWidth="1.5" />
        </Frame>
      );

    case "apm-pmq-stakeholder-management":
      // Three simple people
      return (
        <Frame className={className}>
          <circle cx="48" cy="40" r="10" fill={INK} />
          <path d="M32 78 Q48 58 64 78" {...stroke} strokeWidth="2.5" />
          <circle cx="80" cy="36" r="12" fill={INK} />
          <path d="M60 82 Q80 56 100 82" {...stroke} strokeWidth="2.5" />
          <circle cx="112" cy="40" r="10" fill={INK} />
          <path d="M96 78 Q112 58 128 78" {...stroke} strokeWidth="2.5" />
          <line x1="28" y1="92" x2="132" y2="92" {...stroke} strokeWidth="2" />
        </Frame>
      );

    case "apm-pmq-governance":
      // Gavel / pillars
      return (
        <Frame className={className}>
          <path d="M36 88 H124" {...stroke} strokeWidth="2.5" />
          <path d="M48 88 V48 M72 88 V40 M96 88 V48 M120 88 V52" {...stroke} strokeWidth="3" />
          <path d="M40 48 H128" {...stroke} strokeWidth="2.5" />
          <path d="M56 32 H112 L100 48 H68 Z" {...stroke} strokeWidth="2.2" />
          <circle cx="84" cy="28" r="5" fill={INK} />
        </Frame>
      );

    case "apm-pmq-project-life-cycles":
      // Cycle arrows
      return (
        <Frame className={className}>
          <circle cx="80" cy="56" r="28" {...stroke} strokeWidth="2.5" />
          <path d="M80 28 A28 28 0 0 1 108 56" {...stroke} strokeWidth="3" />
          <path d="M102 48 L112 56 L100 60" fill={INK} />
          <path d="M80 84 A28 28 0 0 1 52 56" {...stroke} strokeWidth="3" />
          <path d="M58 64 L48 56 L60 52" fill={INK} />
          <circle cx="80" cy="56" r="6" {...stroke} strokeWidth="2" />
        </Frame>
      );

    case "apm-pmq-breakdown-structures":
      // Tree / WBS boxes
      return (
        <Frame className={className}>
          <rect x="64" y="22" width="32" height="18" rx="3" {...stroke} strokeWidth="2.2" />
          <path d="M80 40 V52" {...stroke} strokeWidth="2" />
          <path d="M40 52 H120" {...stroke} strokeWidth="2" />
          <path d="M40 52 V60 M80 52 V60 M120 52 V60" {...stroke} strokeWidth="2" />
          <rect x="24" y="60" width="32" height="18" rx="3" {...stroke} strokeWidth="2" />
          <rect x="64" y="60" width="32" height="18" rx="3" fill={INK} />
          <rect x="104" y="60" width="32" height="18" rx="3" {...stroke} strokeWidth="2" />
          <path d="M40 78 V86 M120 78 V86" {...stroke} strokeWidth="1.8" />
          <rect x="28" y="86" width="24" height="12" rx="2" {...stroke} strokeWidth="1.6" />
          <rect x="108" y="86" width="24" height="12" rx="2" {...stroke} strokeWidth="1.6" />
        </Frame>
      );

    case "apm-pmq-scheduling-and-critical-path":
      // Gantt-ish bars + critical path
      return (
        <Frame className={className}>
          <line x1="28" y1="28" x2="28" y2="92" {...stroke} strokeWidth="2" />
          <line x1="28" y1="92" x2="136" y2="92" {...stroke} strokeWidth="2" />
          <rect x="36" y="34" width="48" height="10" rx="2" {...stroke} strokeWidth="2" />
          <rect x="56" y="52" width="56" height="10" rx="2" fill={INK} />
          <rect x="72" y="70" width="40" height="10" rx="2" {...stroke} strokeWidth="2" />
          <path d="M84 44 V52 M112 62 V70" {...stroke} strokeWidth="1.8" />
          <path d="M128 36 L134 30 M132 42 L140 40" {...stroke} strokeWidth="1.4" />
        </Frame>
      );

    case "apm-pmq-change-control":
      // Document with swap arrows
      return (
        <Frame className={className}>
          <rect x="44" y="26" width="52" height="68" rx="3" {...stroke} strokeWidth="2.5" />
          <line x1="54" y1="42" x2="86" y2="42" {...stroke} strokeWidth="1.6" />
          <line x1="54" y1="52" x2="82" y2="52" {...stroke} strokeWidth="1.6" />
          <line x1="54" y1="62" x2="86" y2="62" {...stroke} strokeWidth="1.6" />
          <path d="M108 44 H132" {...stroke} strokeWidth="2.5" />
          <path d="M126 38 L134 44 L126 50" fill={INK} />
          <path d="M132 68 H108" {...stroke} strokeWidth="2.5" />
          <path d="M114 62 L106 68 L114 74" fill={INK} />
        </Frame>
      );

    case "apm-pmq-quality-management":
      // Magnifier + check
      return (
        <Frame className={className}>
          <circle cx="70" cy="50" r="26" {...stroke} strokeWidth="3" />
          <circle cx="70" cy="50" r="16" {...stroke} strokeWidth="2" />
          <path d="M90 70 L118 96" {...stroke} strokeWidth="4" />
          <path d="M58 50 L66 58 L84 40" {...stroke} strokeWidth="3" />
        </Frame>
      );

    case "apm-pmq-leadership-and-teams":
      // Flag + two figures
      return (
        <Frame className={className}>
          <path d="M48 88 V28" {...stroke} strokeWidth="2.5" />
          <path d="M48 28 L92 40 L48 52 Z" fill={INK} />
          <circle cx="100" cy="52" r="8" fill={INK} />
          <path d="M88 84 Q100 64 112 84" {...stroke} strokeWidth="2.2" />
          <circle cx="124" cy="56" r="7" fill={INK} />
          <path d="M114 86 Q124 68 134 86" {...stroke} strokeWidth="2.2" />
          <line x1="28" y1="92" x2="140" y2="92" {...stroke} strokeWidth="2" />
        </Frame>
      );

    default:
      // Open notebook + pencil
      return (
        <Frame className={className}>
          <rect x="36" y="28" width="88" height="60" rx="3" {...stroke} strokeWidth="2.5" />
          <path d="M80 28 V88" {...stroke} strokeWidth="2" />
          <line x1="46" y1="44" x2="70" y2="44" {...stroke} strokeWidth="1.5" />
          <line x1="46" y1="52" x2="68" y2="52" {...stroke} strokeWidth="1.5" />
          <line x1="46" y1="60" x2="70" y2="60" {...stroke} strokeWidth="1.5" />
          <line x1="90" y1="44" x2="114" y2="44" {...stroke} strokeWidth="1.5" />
          <line x1="90" y1="52" x2="110" y2="52" {...stroke} strokeWidth="1.5" />
          <path d="M118 70 L130 40 L134 42 L122 72 Z" fill={INK} />
        </Frame>
      );
  }
}

export function LibraryGroupIllustration({
  group,
  className,
}: {
  group: LibraryGroup | "all";
  className?: string;
}) {
  const shell = (children: ReactNode) => (
    <svg viewBox="0 0 72 72" className={className} aria-hidden focusable="false">
      <rect width="72" height="72" rx="16" fill={CREAM} />
      {children}
    </svg>
  );

  if (group === "all") {
    return shell(
      <>
        <rect x="14" y="18" width="18" height="40" rx="3" {...stroke} strokeWidth="2.2" />
        <rect x="38" y="14" width="20" height="44" rx="3" fill={INK} />
        <line x1="18" y1="28" x2="28" y2="28" {...stroke} strokeWidth="1.5" />
        <line x1="18" y1="36" x2="26" y2="36" {...stroke} strokeWidth="1.5" />
      </>,
    );
  }
  if (group === "exam-prep") {
    return shell(
      <>
        <circle cx="36" cy="34" r="16" {...stroke} strokeWidth="2.5" />
        <path d="M36 22 V34 L46 40" {...stroke} strokeWidth="2.5" />
        <path d="M20 56 H52" {...stroke} strokeWidth="2" />
        <path d="M28 56 V62 H44 V56" {...stroke} strokeWidth="2" />
      </>,
    );
  }
  if (group === "choosing") {
    return shell(
      <>
        <path d="M36 16 L52 48 H20 Z" {...stroke} strokeWidth="2.5" />
        <circle cx="36" cy="40" r="5" fill={INK} />
        <path d="M22 58 H50" {...stroke} strokeWidth="2" />
      </>,
    );
  }
  return shell(
    <>
      <rect x="16" y="18" width="40" height="10" rx="2" fill={INK} />
      <rect x="20" y="34" width="32" height="8" rx="2" {...stroke} strokeWidth="2" />
      <rect x="20" y="46" width="32" height="8" rx="2" {...stroke} strokeWidth="2" />
      <rect x="20" y="58" width="22" height="8" rx="2" {...stroke} strokeWidth="2" />
    </>,
  );
}

export function LibraryHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 200"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="280" height="200" rx="20" fill={CREAM} />
      {/* Shelf */}
      <line x1="36" y1="150" x2="244" y2="150" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 150 V88 M70 150 V72 M100 150 V96 M130 150 V80 M160 150 V90 M190 150 V76 M220 150 V100" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="44" y="90" width="20" height="60" rx="2" fill="none" stroke={INK} strokeWidth="2" />
      <rect x="74" y="74" width="22" height="76" rx="2" fill={INK} />
      <rect x="104" y="98" width="18" height="52" rx="2" fill="none" stroke={INK} strokeWidth="2" />
      <rect x="134" y="82" width="22" height="68" rx="2" fill="none" stroke={INK} strokeWidth="2" />
      <rect x="164" y="92" width="20" height="58" rx="2" fill={INK} />
      <rect x="194" y="78" width="22" height="72" rx="2" fill="none" stroke={INK} strokeWidth="2" />
      {/* Paper plane */}
      <g transform="translate(200 36) rotate(-16)">
        <path d="M0 20 L48 20 L8 38 Z" fill={INK} />
        <path d="M0 20 L48 20 L8 2 Z" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="40" cy="20" r="2.5" fill={CREAM} />
      </g>
      {/* Tiny plant */}
      <path d="M52 150 V138" stroke={INK} strokeWidth="2" />
      <ellipse cx="52" cy="132" rx="8" ry="6" fill={INK} />
      <path d="M36 160 Q48 154 56 160 M210 160 Q222 154 236 160" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
