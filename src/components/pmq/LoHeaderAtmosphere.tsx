/**
 * Slim mid-century atmosphere for LO study headers.
 * Anchored left (mirrored living-room lane) so site controls on the right stay clear.
 */
export function LoHeaderAtmosphere() {
  return (
    <svg
      className="lo-header-atmosphere pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="xMinYMid slice"
    >
      {/* Sunlit wedge left → quieter field right */}
      <g className="dash-home-glow">
        <path
          d="M0 0H560L480 120H0V0Z"
          fill="rgb(var(--sand-rgb))"
          opacity="0.55"
        />
        <path
          d="M0 0H500L420 50L540 120H0V0Z"
          fill="var(--gold)"
          opacity="0.35"
        />
      </g>
      <path
        d="M480 0H1200V120H560L480 0Z"
        fill="rgb(var(--ink-rgb))"
        opacity="0.08"
      />

      {/* Teal sideboard silhouette (left) */}
      <path
        d="M80 48H280L295 58V95H95L80 48Z"
        fill="var(--teal)"
        opacity="0.55"
      />
      <path
        d="M280 48L305 40V82L295 95V58L280 48Z"
        fill="var(--teal-deep)"
        opacity="0.5"
      />
      {/* Radio blip */}
      <rect
        x="155"
        y="28"
        width="42"
        height="22"
        rx="1"
        fill="var(--orange)"
        opacity="0.85"
      />
      <circle
        className="dash-home-radio-dial"
        cx="185"
        cy="39"
        r="5"
        fill="rgb(var(--paper-rgb))"
      />

      {/* Pendant lamps (left of brand / studying text) */}
      <g className="lo-header-lamp lo-header-lamp-a">
        <line
          x1="320"
          y1="0"
          x2="320"
          y2="28"
          stroke="var(--gold)"
          strokeWidth="2"
        />
        <rect x="308" y="28" width="24" height="32" rx="1" fill="var(--orange)" />
      </g>
      <g className="lo-header-lamp lo-header-lamp-b">
        <line
          x1="370"
          y1="0"
          x2="370"
          y2="38"
          stroke="var(--gold)"
          strokeWidth="2"
        />
        <rect x="358" y="38" width="24" height="32" rx="1" fill="var(--orange)" />
      </g>

      {/* Leaf shadow hints near left floor */}
      <g className="dash-home-shadows" opacity="0.35">
        <path
          d="M40 95C70 70 95 65 110 78C125 68 150 85 165 110C130 115 80 115 40 95Z"
          fill="rgb(var(--ink-rgb))"
        />
        <path
          d="M130 100C160 78 185 75 200 88C215 78 240 95 250 115C215 118 165 118 130 100Z"
          fill="rgb(var(--ink-rgb))"
        />
      </g>
    </svg>
  );
}
