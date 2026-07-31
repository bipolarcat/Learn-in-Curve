import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  /*
   * Testing on a real phone means loading the dev server over the LAN IP, which
   * Next treats as a cross-origin request to /_next/* and warns about in the dev
   * overlay. Private ranges only — this never applies to a production build.
   */
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "*.local"],
};

export default nextConfig;
