import type { ReactNode } from "react";
import type { LibraryGroup } from "@/content/library";

type PlateTone = {
  fill: string;
  accent: string;
  ink: string;
  teal: string;
};

const TONES: Record<string, PlateTone> = {
  orange: {
    fill: "#F6E4C4",
    accent: "#D5501F",
    ink: "#241A12",
    teal: "#1B6560",
  },
  teal: {
    fill: "#D9E8E4",
    accent: "#1B6560",
    ink: "#241A12",
    teal: "#D5501F",
  },
  cream: {
    fill: "#F4E9D6",
    accent: "#A83B14",
    ink: "#241A12",
    teal: "#1B6560",
  },
  sand: {
    fill: "#EEDFB8",
    accent: "#D5501F",
    ink: "#241A12",
    teal: "#123F3C",
  },
  ink: {
    fill: "#2A221C",
    accent: "#DD5C20",
    ink: "#F4E9D6",
    teal: "#5BC4B8",
  },
};

function Frame({
  tone,
  children,
  className,
}: {
  tone: PlateTone;
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
      <rect width="160" height="112" rx="14" fill={tone.fill} />
      <rect
        x="6"
        y="6"
        width="148"
        height="100"
        rx="10"
        fill="none"
        stroke={tone.ink}
        strokeWidth="2.5"
        opacity="0.35"
      />
      {children}
    </svg>
  );
}

/** Unique flat-retro plates per guide slug (brand ink / orange / teal). */
export function LibraryPageIllustration({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  switch (slug) {
    case "apm-pmq-pass-mark": {
      const t = TONES.orange;
      return (
        <Frame tone={t} className={className}>
          <circle cx="80" cy="58" r="34" fill={t.accent} opacity="0.18" />
          <path
            d="M52 70c8-22 24-34 40-34s32 12 40 34"
            fill="none"
            stroke={t.ink}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="92" cy="48" r="10" fill={t.accent} stroke={t.ink} strokeWidth="2.5" />
          <text
            x="80"
            y="86"
            textAnchor="middle"
            fill={t.ink}
            fontSize="18"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui"
          >
            55%
          </text>
        </Frame>
      );
    }
    case "how-hard-is-apm-pmq": {
      const t = TONES.sand;
      return (
        <Frame tone={t} className={className}>
          <path
            d="M30 82 L55 40 L80 68 L105 28 L130 82 Z"
            fill={t.accent}
            opacity="0.25"
            stroke={t.ink}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="105" cy="28" r="7" fill={t.teal} stroke={t.ink} strokeWidth="2" />
        </Frame>
      );
    }
    case "apm-pmq-exam-format": {
      const t = TONES.teal;
      return (
        <Frame tone={t} className={className}>
          <rect x="38" y="24" width="84" height="64" rx="6" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <line x1="50" y1="40" x2="110" y2="40" stroke={t.ink} strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="52" x2="98" y2="52" stroke={t.ink} strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
          <line x1="50" y1="64" x2="104" y2="64" stroke={t.ink} strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
          <circle cx="108" cy="76" r="14" fill={t.accent} stroke={t.ink} strokeWidth="2.5" />
          <text x="108" y="81" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            ?
          </text>
        </Frame>
      );
    }
    case "how-long-to-revise-for-apm-pmq": {
      const t = TONES.cream;
      return (
        <Frame tone={t} className={className}>
          <circle cx="80" cy="56" r="32" fill="none" stroke={t.ink} strokeWidth="4" />
          <circle cx="80" cy="56" r="4" fill={t.accent} />
          <line x1="80" y1="56" x2="80" y2="36" stroke={t.ink} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="80" y1="56" x2="100" y2="56" stroke={t.accent} strokeWidth="3.5" strokeLinecap="round" />
          <rect x="74" y="20" width="12" height="8" rx="2" fill={t.teal} stroke={t.ink} strokeWidth="2" />
        </Frame>
      );
    }
    case "apm-pmq-vs-pfq": {
      const t = TONES.orange;
      return (
        <Frame tone={t} className={className}>
          <rect x="28" y="34" width="44" height="48" rx="6" fill={t.accent} stroke={t.ink} strokeWidth="2.5" />
          <rect x="88" y="26" width="44" height="56" rx="6" fill={t.teal} stroke={t.ink} strokeWidth="2.5" />
          <text x="50" y="64" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            PFQ
          </text>
          <text x="110" y="60" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
            PMQ
          </text>
        </Frame>
      );
    }
    case "apm-pmq-vs-prince2": {
      const t = TONES.teal;
      return (
        <Frame tone={t} className={className}>
          <path
            d="M40 78 V40 h28 v38 M72 78 V28 h28 v50 M104 78 V48 h28 v30"
            fill="none"
            stroke={t.ink}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="54" cy="34" r="6" fill={t.accent} />
          <circle cx="86" cy="22" r="6" fill={t.teal} />
          <circle cx="118" cy="42" r="6" fill={t.accent} />
        </Frame>
      );
    }
    case "apm-pmq-vs-pmp": {
      const t = TONES.sand;
      return (
        <Frame tone={t} className={className}>
          <ellipse cx="58" cy="58" rx="28" ry="30" fill={t.accent} opacity="0.35" stroke={t.ink} strokeWidth="2.5" />
          <ellipse cx="102" cy="58" rx="28" ry="30" fill={t.teal} opacity="0.35" stroke={t.ink} strokeWidth="2.5" />
          <text x="80" y="64" textAnchor="middle" fill={t.ink} fontSize="16" fontWeight="800" fontFamily="ui-sans-serif, system-ui">
            vs
          </text>
        </Frame>
      );
    }
    case "is-apm-pmq-worth-it": {
      const t = TONES.orange;
      return (
        <Frame tone={t} className={className}>
          <path
            d="M80 22 L92 52 L124 52 L98 70 L108 100 L80 82 L52 100 L62 70 L36 52 L68 52 Z"
            fill={t.accent}
            stroke={t.ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </Frame>
      );
    }
    case "apm-pmq-business-case": {
      const t = TONES.cream;
      return (
        <Frame tone={t} className={className}>
          <rect x="42" y="22" width="76" height="68" rx="4" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <rect x="52" y="36" width="40" height="8" rx="2" fill={t.accent} />
          <rect x="52" y="50" width="56" height="5" rx="1.5" fill={t.ink} opacity="0.25" />
          <rect x="52" y="60" width="48" height="5" rx="1.5" fill={t.ink} opacity="0.25" />
          <rect x="52" y="70" width="36" height="5" rx="1.5" fill={t.teal} opacity="0.55" />
        </Frame>
      );
    }
    case "apm-pmq-risk-management": {
      const t = TONES.ink;
      return (
        <Frame tone={t} className={className}>
          <path
            d="M80 24 L118 88 H42 Z"
            fill={t.accent}
            stroke={t.ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="76" y="48" width="8" height="22" rx="2" fill={t.ink} />
          <circle cx="80" cy="78" r="4" fill={t.ink} />
        </Frame>
      );
    }
    case "apm-pmq-stakeholder-management": {
      const t = TONES.teal;
      return (
        <Frame tone={t} className={className}>
          <circle cx="56" cy="48" r="14" fill={t.accent} stroke={t.ink} strokeWidth="2.5" />
          <circle cx="104" cy="48" r="14" fill={t.teal} stroke={t.ink} strokeWidth="2.5" />
          <circle cx="80" cy="72" r="14" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <path d="M68 54 L80 64 L92 54" fill="none" stroke={t.ink} strokeWidth="2.5" strokeLinecap="round" />
        </Frame>
      );
    }
    case "apm-pmq-governance": {
      const t = TONES.sand;
      return (
        <Frame tone={t} className={className}>
          <rect x="48" y="30" width="64" height="10" rx="2" fill={t.accent} stroke={t.ink} strokeWidth="2" />
          <rect x="56" y="40" width="8" height="36" fill={t.ink} opacity="0.7" />
          <rect x="76" y="40" width="8" height="36" fill={t.ink} opacity="0.7" />
          <rect x="96" y="40" width="8" height="36" fill={t.ink} opacity="0.7" />
          <rect x="44" y="76" width="72" height="10" rx="2" fill={t.teal} stroke={t.ink} strokeWidth="2" />
        </Frame>
      );
    }
    case "apm-pmq-project-life-cycles": {
      const t = TONES.orange;
      return (
        <Frame tone={t} className={className}>
          <circle cx="40" cy="56" r="12" fill={t.accent} stroke={t.ink} strokeWidth="2.5" />
          <circle cx="80" cy="56" r="12" fill={t.teal} stroke={t.ink} strokeWidth="2.5" />
          <circle cx="120" cy="56" r="12" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <path
            d="M52 56 H68 M92 56 H108"
            stroke={t.ink}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Frame>
      );
    }
    case "apm-pmq-breakdown-structures": {
      const t = TONES.cream;
      return (
        <Frame tone={t} className={className}>
          <rect x="64" y="20" width="32" height="18" rx="3" fill={t.accent} stroke={t.ink} strokeWidth="2" />
          <path d="M80 38 V48 M50 48 H110 M50 48 V56 M80 48 V56 M110 48 V56" stroke={t.ink} strokeWidth="2.5" />
          <rect x="36" y="56" width="28" height="16" rx="3" fill={t.teal} stroke={t.ink} strokeWidth="2" />
          <rect x="66" y="56" width="28" height="16" rx="3" fill="#fff" stroke={t.ink} strokeWidth="2" />
          <rect x="96" y="56" width="28" height="16" rx="3" fill={t.accent} opacity="0.55" stroke={t.ink} strokeWidth="2" />
        </Frame>
      );
    }
    case "apm-pmq-scheduling-and-critical-path": {
      const t = TONES.teal;
      return (
        <Frame tone={t} className={className}>
          <path
            d="M28 70 H52 L68 40 H92 L108 70 H132"
            fill="none"
            stroke={t.ink}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M52 70 L68 40 L92 40"
            fill="none"
            stroke={t.accent}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="68" cy="40" r="5" fill={t.accent} stroke={t.ink} strokeWidth="2" />
        </Frame>
      );
    }
    case "apm-pmq-change-control": {
      const t = TONES.orange;
      return (
        <Frame tone={t} className={className}>
          <rect x="34" y="28" width="52" height="56" rx="4" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <path
            d="M78 36 H112 A8 8 0 0 1 120 44 V76 A8 8 0 0 1 112 84 H78"
            fill={t.accent}
            opacity="0.85"
            stroke={t.ink}
            strokeWidth="2.5"
          />
          <path
            d="M96 52 l10 10 -10 10 M96 62 H84"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Frame>
      );
    }
    case "apm-pmq-quality-management": {
      const t = TONES.sand;
      return (
        <Frame tone={t} className={className}>
          <circle cx="80" cy="56" r="30" fill="none" stroke={t.ink} strokeWidth="4" />
          <path
            d="M62 58 L74 70 L102 42"
            fill="none"
            stroke={t.accent}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Frame>
      );
    }
    case "apm-pmq-leadership-and-teams": {
      const t = TONES.teal;
      return (
        <Frame tone={t} className={className}>
          <circle cx="80" cy="36" r="12" fill={t.accent} stroke={t.ink} strokeWidth="2.5" />
          <circle cx="48" cy="72" r="11" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <circle cx="112" cy="72" r="11" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <circle cx="80" cy="78" r="11" fill={t.teal} stroke={t.ink} strokeWidth="2.5" />
        </Frame>
      );
    }
    default: {
      const t = TONES.cream;
      return (
        <Frame tone={t} className={className}>
          <rect x="48" y="28" width="64" height="56" rx="4" fill="#fff" stroke={t.ink} strokeWidth="2.5" />
          <line x1="60" y1="44" x2="100" y2="44" stroke={t.accent} strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="56" x2="92" y2="56" stroke={t.ink} strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
          <line x1="60" y1="68" x2="96" y2="68" stroke={t.ink} strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
        </Frame>
      );
    }
  }
}

export function LibraryGroupIllustration({
  group,
  className,
}: {
  group: LibraryGroup | "all";
  className?: string;
}) {
  if (group === "all") {
    const t = TONES.orange;
    return (
      <svg viewBox="0 0 72 72" className={className} aria-hidden focusable="false">
        <rect width="72" height="72" rx="16" fill={t.fill} />
        <rect x="14" y="18" width="18" height="40" rx="3" fill={t.accent} stroke={t.ink} strokeWidth="2" />
        <rect x="36" y="14" width="22" height="44" rx="3" fill={t.teal} stroke={t.ink} strokeWidth="2" />
      </svg>
    );
  }
  if (group === "exam-prep") {
    const t = TONES.orange;
    return (
      <svg viewBox="0 0 72 72" className={className} aria-hidden focusable="false">
        <rect width="72" height="72" rx="16" fill={t.fill} />
        <circle cx="36" cy="36" r="18" fill="none" stroke={t.ink} strokeWidth="3" />
        <path d="M36 22 V36 L46 42" fill="none" stroke={t.accent} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (group === "choosing") {
    const t = TONES.teal;
    return (
      <svg viewBox="0 0 72 72" className={className} aria-hidden focusable="false">
        <rect width="72" height="72" rx="16" fill={t.fill} />
        <path
          d="M22 48 L36 22 L50 48 Z"
          fill={t.accent}
          opacity="0.35"
          stroke={t.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="36" cy="40" r="6" fill={t.teal} stroke={t.ink} strokeWidth="2" />
      </svg>
    );
  }
  const t = TONES.sand;
  return (
    <svg viewBox="0 0 72 72" className={className} aria-hidden focusable="false">
      <rect width="72" height="72" rx="16" fill={t.fill} />
      <rect x="18" y="20" width="36" height="8" rx="2" fill={t.accent} stroke={t.ink} strokeWidth="2" />
      <rect x="22" y="32" width="28" height="6" rx="1.5" fill={t.ink} opacity="0.35" />
      <rect x="22" y="42" width="28" height="6" rx="1.5" fill={t.ink} opacity="0.35" />
      <rect x="22" y="52" width="20" height="6" rx="1.5" fill={t.teal} opacity="0.7" />
    </svg>
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
      <rect width="280" height="200" rx="20" fill="#F6E4C4" />
      <rect
        x="10"
        y="10"
        width="260"
        height="180"
        rx="14"
        fill="none"
        stroke="#241A12"
        strokeWidth="2.5"
        opacity="0.28"
      />
      {/* Shelf */}
      <rect x="36" y="148" width="208" height="12" rx="2" fill="#241A12" opacity="0.75" />
      {/* Books */}
      <rect x="48" y="72" width="28" height="76" rx="3" fill="#D5501F" stroke="#241A12" strokeWidth="2" />
      <rect x="82" y="56" width="32" height="92" rx="3" fill="#1B6560" stroke="#241A12" strokeWidth="2" />
      <rect x="120" y="80" width="24" height="68" rx="3" fill="#EEDFB8" stroke="#241A12" strokeWidth="2" />
      <rect x="150" y="64" width="30" height="84" rx="3" fill="#A83B14" stroke="#241A12" strokeWidth="2" />
      <rect x="186" y="88" width="26" height="60" rx="3" fill="#5BC4B8" stroke="#241A12" strokeWidth="2" />
      {/* Paper plane */}
      <g transform="translate(210 28) rotate(-18)">
        <polygon points="48,20 8,20 -8,38" fill="#B2431A" stroke="#241A12" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="48,20 -8,2 8,20" fill="#DD5C20" stroke="#241A12" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="40" cy="20" r="3" fill="#1B6560" />
      </g>
      {/* Dots */}
      <circle cx="52" cy="40" r="3" fill="#D5501F" opacity="0.5" />
      <circle cx="68" cy="32" r="2.5" fill="#1B6560" opacity="0.45" />
    </svg>
  );
}
