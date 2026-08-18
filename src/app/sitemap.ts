import type { MetadataRoute } from "next";
import { getPublishedLibraryPages } from "@/content/library";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

/**
 * Public indexable URLs only — exclude dashboard, auth, gated study routes,
 * and /library pages that are draft or still carry TODO_COPY.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/about",
    "/contact",
    "/courses",
    "/courses/pmq-in-5-days",
    "/pmq",
    "/free-mock-exam",
    "/pfq",
    "/pfq/pricing",
    "/library",
    "/privacy",
    "/terms",
    "/cookies",
    "/recruitment-privacy",
    "/careers",
  ];

  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency:
      path === "/" ||
      path === "/free-mock-exam" ||
      path === "/pmq" ||
      path === "/pfq" ||
      path === "/library"
        ? "weekly"
        : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/free-mock-exam" ||
            path === "/pmq" ||
            path === "/pfq" ||
            path === "/pfq/pricing" ||
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
