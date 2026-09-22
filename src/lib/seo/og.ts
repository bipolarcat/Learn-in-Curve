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

/**
 * Cache-bust token for the default artwork.
 *
 * Every social platform caches an og:image against its URL, not against the
 * bytes behind it. Telegram, WhatsApp, LinkedIn and Slack will keep serving a
 * preview they scraped weeks ago even after the file on disk has changed, and
 * most of them offer no way to purge it. So the URL has to change whenever the
 * artwork does: bump this number in the same commit that replaces the PNG, and
 * every platform treats it as a new image and re-scrapes.
 *
 * 2 = header lockup sized to survive the centre square crop that small
 * previews take (2026-09-22). See scripts/build-og-default.py.
 */
export const OG_IMAGE_REVISION = "2";

export const OG_DEFAULT_IMAGE_PATH = `/brand/og/og-default.png?v=${OG_IMAGE_REVISION}`;
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
