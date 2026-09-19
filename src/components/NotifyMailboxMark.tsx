/**
 * Flat mailbox mark — same stamp vocabulary as the footer newsletter and NotifyDialog.
 * Flag is tipped (delivered) so it reads as “post ready” in the footer.
 * Fills/strokes use brand CSS variables so the mark tracks the design tokens.
 */
export function NotifyMailboxMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      aria-hidden
    >
      <line
        x1="90"
        y1="360"
        x2="310"
        y2="360"
        stroke="var(--teal)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="185" y="260" width="30" height="100" rx="6" fill="var(--ink)" />
      <path
        d="M110,270 L110,190 A90,90 0 0 1 290,190 L290,270 Z"
        fill="var(--orange)"
        stroke="var(--ink)"
        strokeWidth="14"
        strokeLinejoin="round"
      />
      <path
        d="M124,192 A78,78 0 0 1 162,108"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1="130"
        y1="228"
        x2="270"
        y2="228"
        stroke="var(--ink)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <g transform="rotate(78 290 196)">
        <line
          x1="290"
          y1="196"
          x2="290"
          y2="156"
          stroke="var(--ink)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <polygon
          points="290,156 322,144 322,182"
          fill="var(--teal)"
          stroke="var(--ink)"
          strokeWidth="8"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
