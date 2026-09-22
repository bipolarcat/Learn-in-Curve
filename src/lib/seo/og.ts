/**
 * Default social preview image (Open Graph + Twitter).
 *
 * Why this exists: Next.js does NOT deep-merge `openGraph` between a layout and
 * a page. A page that sets its own `openGraph` block replaces the root one
 * wholesale, so any page that overrode the title and forgot `images` shipped
 * with no `og:image` at all. WhatsApp, Slack, LinkedIn and iMessage then render
 * a text-only card with no logo, which is what prompted this file.
 *
 * Rule: every page that declares `openGraph` must spread `ogImages()` into it
 * and `twitterImages()` into `twitter`, unless it has its own artwork (the
 * library pages do). Never hand-type the path.
 */

export const OG_DEFAULT_IMAGE_PATH = "/brand/og/og-default.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Absolute URL. Crawlers that do not resolve relative og:image (WhatsApp is the
 * strictest of them) need the full origin, so pass the same SITE_URL the page
 * uses for its canonical.
 */
export function ogImageUrl(siteUrl: string, path = OG_DEFAULT_IMAGE_PATH) {
  return `${siteUrl.replace(/\/+$/, "")}${path}`;
}

/** Spread into a page's `openGraph`. */
export function ogImages(siteUrl: string, path = OG_DEFAULT_IMAGE_PATH) {
  return {
    images: [
      {
        url: ogImageUrl(siteUrl, path),
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        type: "image/png",
        alt: "Learn in Curve",
      },
    ],
  };
}

/** Spread into a page's `twitter`. */
export function twitterImages(siteUrl: string, path = OG_DEFAULT_IMAGE_PATH) {
  return {
    card: "summary_large_image" as const,
    images: [ogImageUrl(siteUrl, path)],
  };
}
