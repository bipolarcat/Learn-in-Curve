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
        "/lab",
        "/courses/pmq-in-5-days/lo",
        "/courses/pmq-in-5-days/mock",
        "/courses/pfq-in-2-days/preview",
        "/courses/pfq-in-2-days/learn",
        "/courses/pfq-in-2-days/mock",
        "/courses/pfq-in-2-days/practice",
        "/courses/pfq-in-2-days/trap-school",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
