import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/** Shared menu glyph size — matches Lucide 16px in the overflow panel. */
export const menuIconClass = "h-4 w-4 shrink-0";

type MenuSvgProps = SVGProps<SVGSVGElement>;

/** Monoline stroke attrs — same language as Lucide / Mobbin settings sidebars. */
function menuStrokeProps({ className, ...rest }: MenuSvgProps = {}) {
  return {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    className: cn(menuIconClass, className),
    ...rest,
  };
}

/** Rocket — Explore Courses. */
export function MenuCoursesIcon(props: MenuSvgProps) {
  return (
    <svg {...menuStrokeProps(props)}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

/**
 * Bookcase / shelf — The Shelf.
 * Vertical uprights + three shelves (Mobbin lineal density, Lucide weight).
 */
export function MenuShelfIcon(props: MenuSvgProps) {
  return (
    <svg {...menuStrokeProps(props)}>
      <path d="M4 4v16" />
      <path d="M20 4v16" />
      <path d="M4 8h16" />
      <path d="M4 13h16" />
      <path d="M4 18h16" />
      <path d="M8 8v5" />
      <path d="M12 8v5" />
      <path d="M15.5 13v5" />
      <path d="M9.5 13v5" />
    </svg>
  );
}

/** Dice — Mock Me. */
export function MenuMockMeIcon(props: MenuSvgProps) {
  return (
    <svg {...menuStrokeProps(props)}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Learn in Curve logo mark — Behind the Curve.
 * Real asset (`fox-logo-png.png`) masked so the silhouette fills with currentColor (solid ink).
 */
export function MenuLicMarkIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(menuIconClass, "inline-block bg-current", className)}
      style={{
        maskImage: "url(/brand/logo/fox-logo-png.png)",
        WebkitMaskImage: "url(/brand/logo/fox-logo-png.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/** House — Back to Home. */
export function MenuHomeIcon(props: MenuSvgProps) {
  return (
    <svg {...menuStrokeProps(props)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

/** Kanban / dashboard board — My dashboard. */
export function MenuBoardIcon(props: MenuSvgProps) {
  return (
    <svg {...menuStrokeProps(props)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </svg>
  );
}

/** Speech bubble — Let's Talk. */
export function MenuTalkIcon(props: MenuSvgProps) {
  return (
    <svg {...menuStrokeProps(props)}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

/** Palette — Theme row label. */
export function MenuThemeIcon(props: MenuSvgProps) {
  return (
    <svg {...menuStrokeProps(props)}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" stroke="none" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
    </svg>
  );
}
