"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";

/** Site footer — omitted on auth so sign-in/up fits one screen. */
export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/auth")) return null;
  return <SiteFooter />;
}
