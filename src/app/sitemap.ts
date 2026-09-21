import type { MetadataRoute } from "next";
import { getPublishedLibraryPages } from "@/content/library";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

/**
 * Real last-modified dates for static public URLs.
 * Update a path's date when that page's indexable content actually changes —
 * not on every deploy. `/courses/pmq-in-5-days` is omitted: signed-out visitors
 * get a 3XX to sign-in; public marketing for PMQ/PFQ is the pricing page.
 */
const STATIC_LAST_MODIFIED: Record<string, string> = {
  "/": "2026-09-15",
  "/about": "2026-08-06",
  "/contact": "2026-07-20",
  "/courses": "2026-09-22",
  "/mock-me": "2026-09-10",
  "/free-mock-exam/apm-pmq": "2026-09-10",
  "/free-mock-exam/apm-pfq": "2026-09-10",
  "/free-mock-exam/pmp": "2026-09-10",
  "/courses/pfq-in-2-days/pricing": "2026-09-15",
  "/courses/pmq-in-5-days/pricing": "2026-09-15",
  "/library": "2026-08-19",
  "/privacy": "2026-07-20",
  "/terms": "2026-07-20",
  "/cookies": "2026-07-20",
  "/recruitment-privacy": "2026-07-20",
  "/careers": "2026-07-20",
};

/**
 * Public indexable URLs only — exclude dashboard, auth, gated study routes,
 * and /library pages that are draft or still carry TODO_COPY.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = Object.keys(STATIC_LAST_MODIFIED);

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(STATIC_LAST_MODIFIED[path]),
    changeFrequency:
      path === "/" ||
      path === "/mock-me" ||
      path.startsWith("/free-mock-exam/") ||
      path === "/library"
        ? "weekly"
        : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/mock-me" ||
            path.startsWith("/free-mock-exam/") ||
            path === "/courses/pfq-in-2-days/pricing" ||
            path === "/courses/pmq-in-5-days/pricing" ||
            path === "/library"
          ? 0.9
          : 0.6,
  }));

  const libraryEntries: MetadataRoute.Sitemap = getPublishedLibraryPages().map(
    (page) => ({
      url: `${SITE_URL}/library/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...libraryEntries];
}
