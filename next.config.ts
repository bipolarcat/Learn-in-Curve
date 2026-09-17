import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  /*
   * Testing on a real phone means loading the dev server over the LAN IP, which
   * Next treats as a cross-origin request to /_next/* and warns about in the
   * overlay. Private ranges only — this never applies to a production build.
   */
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "*.local"],
  /**
   * Safari on LAN aggressively caches /_next/* during `next dev`, so phone
   * previews look "stuck" after CSS/JS edits. Force no-store in development
   * only — production keeps normal static caching.
   */
  async headers() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
  /**
   * Old PFQ subtree → `/courses/pfq-in-2-days/*`.
   * Explicit 301 (not Next's permanent:true → 308) so bookmarks and SEO update.
   * Middleware also redirects; this layer covers cases where middleware is skipped.
   */
  async redirects() {
    return [
      {
        source: "/pfq",
        destination: "/courses/pfq-in-2-days",
        statusCode: 301 as const,
      },
      {
        source: "/pfq/:path*",
        destination: "/courses/pfq-in-2-days/:path*",
        statusCode: 301 as const,
      },
      {
        // Preserve rankings for the original free PMQ mock URL.
        source: "/free-mock-exam",
        destination: "/free-mock-exam/apm-pmq",
        statusCode: 301 as const,
      },
    ];
  },
};

export default nextConfig;
