"use client";

import {
  FlickeringGrid,
  useMediaQuery,
} from "@/components/ui/flickering-footer";
import { SITE_VERSION } from "@/lib/site-version";

/**
 * Full-bleed footer band — flickering grid spelling “Be Curious.”,
 * with © + version overlay.
 */
export function FooterFlickerBand() {
  const compact = useMediaQuery("(max-width: 1024px)");

  return (
    <div className="footer-flicker relative h-36 w-full overflow-hidden sm:h-44 md:h-52">
      <div className="absolute inset-0 z-0">
        <FlickeringGrid
          text="Be Curious."
          fontSize={compact ? 48 : 80}
          fontWeight={700}
          className="h-full w-full"
          squareSize={2}
          gridGap={compact ? 2 : 3}
          color="#F4E9D6"
          textColor="#d5501f"
          maxOpacity={0.28}
          flickerChance={0.1}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-3 px-4 pb-2.5 sm:px-6 sm:pb-3.5 lg:px-8">
        <p className="font-body text-[11px] font-medium leading-snug tracking-tight text-cream/80 [text-shadow:0_1px_2px_rgba(36,26,18,0.85),0_0_12px_rgba(36,26,18,0.55)]">
          © {new Date().getUTCFullYear()} Learn in Curve
        </p>
        <p
          className="shrink-0 font-body text-[11px] font-medium leading-snug tracking-tight text-cream/70 [text-shadow:0_1px_2px_rgba(36,26,18,0.85),0_0_12px_rgba(36,26,18,0.55)]"
          aria-label={`Site version ${SITE_VERSION}`}
        >
          v{SITE_VERSION}
        </p>
      </div>
    </div>
  );
}
