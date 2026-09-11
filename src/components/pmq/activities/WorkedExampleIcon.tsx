"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type WorkedExampleIconProps = {
  className?: string;
};

/**
 * Four exploded puzzle pieces with real interlocking silhouettes:
 * a tab on one piece faces a socket on its neighbour (never tab-to-tab).
 *
 *   TL tab→  ←socket TR
 *   tab↓        tab↓
 *   socket↑   ←socket
 *   BL tab→  ←socket BR
 *
 * Tabs = filled circles on the edge. Sockets = clip-path notches.
 * Brand colors: orange / teal / gold / olive.
 */
export function WorkedExampleIcon({ className }: WorkedExampleIconProps) {
  const uid = useId().replace(/:/g, "");
  const trClip = `we-tr-${uid}`;
  const blClip = `we-bl-${uid}`;
  const brClip = `we-br-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-3.5", className)}
      aria-hidden
    >
      <defs>
        {/*
          Clip shapes include the socket notch (arc into the body) and any
          outward tab circle so the tab isn’t clipped off.
          Arc sweep: on a left edge going up, sweep 0 = notch into the piece;
          on a top edge going right, sweep 0 = notch into the piece.
        */}
        <clipPath id={trClip} clipPathUnits="userSpaceOnUse">
          <path d="M13.8 1.5h8.7v9.7H13.8V7.35a1.5 1.5 0 0 0 0-3V1.5z" />
          <circle cx="18.15" cy="11.2" r="1.5" />
        </clipPath>
        <clipPath id={blClip} clipPathUnits="userSpaceOnUse">
          <path d="M1.5 13.8h2.85a1.5 1.5 0 0 0 3 0H10.2v8.7H1.5V13.8z" />
          <circle cx="10.2" cy="18.15" r="1.5" />
        </clipPath>
        <clipPath id={brClip} clipPathUnits="userSpaceOnUse">
          <path d="M13.8 13.8h2.85a1.5 1.5 0 0 0 3 0h2.85v8.7H13.8v-2.85a1.5 1.5 0 0 0 0-3V13.8z" />
        </clipPath>
      </defs>

      {/* Top-left — orange: tab right, tab down */}
      <rect x="1.5" y="1.5" width="8.7" height="8.7" rx="0.35" fill="#D5501F" />
      <circle cx="10.2" cy="5.85" r="1.5" fill="#D5501F" />
      <circle cx="5.85" cy="10.2" r="1.5" fill="#D5501F" />

      {/* Top-right — teal: socket left, tab down */}
      <g clipPath={`url(#${trClip})`}>
        <rect x="13.8" y="1.5" width="8.7" height="9.7" fill="#1B6560" />
        <circle cx="18.15" cy="11.2" r="1.5" fill="#1B6560" />
      </g>

      {/* Bottom-left — gold: socket up, tab right */}
      <g clipPath={`url(#${blClip})`}>
        <rect x="1.5" y="13.8" width="8.7" height="8.7" fill="#D9A441" />
        <circle cx="10.2" cy="18.15" r="1.5" fill="#D9A441" />
      </g>

      {/* Bottom-right — olive: socket left, socket up */}
      <g clipPath={`url(#${brClip})`}>
        <rect x="13.8" y="13.8" width="8.7" height="8.7" fill="#5F7A3D" />
      </g>
    </svg>
  );
}
