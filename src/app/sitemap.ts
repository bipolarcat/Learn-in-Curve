import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

/**
 * Public indexable URLs only — exclude dashboard, auth, and gated study routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/about",
    "/contact",
    "/courses",
    "/courses/pmq-in-5-days",
    "/free-mock-exam",
    "/privacy",
    "/terms",
    "/cookies",
    "/recruitment-privacy",
    "/careers",
  ];

  const lastModified = new Date();

  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "/" || path === "/free-mock-exam" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/free-mock-exam" ? 0.9 : 0.6,
  }));
}
