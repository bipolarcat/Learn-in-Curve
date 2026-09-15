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
    "/mock-me",
    "/free-mock-exam/apm-pmq",
    "/free-mock-exam/apm-pfq",
    "/free-mock-exam/pmp",
    "/courses/pfq-in-2-days",
    "/courses/pfq-in-2-days/pricing",
    "/courses/pmq-in-5-days/pricing",
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
      path === "/mock-me" ||
      path.startsWith("/free-mock-exam/") ||
      path === "/pmq" ||
      path === "/courses/pfq-in-2-days" ||
      path === "/library"
        ? "weekly"
        : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/mock-me" ||
            path.startsWith("/free-mock-exam/") ||
            path === "/pmq" ||
            path === "/courses/pfq-in-2-days" ||
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
