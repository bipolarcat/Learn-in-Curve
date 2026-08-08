import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/auth/",
        "/courses/pmq-in-5-days/lo",
        "/courses/pmq-in-5-days/mock",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
