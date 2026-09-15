import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

/**
 * Legacy URL. Rankings preserved via next.config 301 to /free-mock-exam/apm-pmq.
 * This page is a belt-and-braces redirect if the config layer is skipped.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function FreeMockExamLegacyPage() {
  permanentRedirect("/free-mock-exam/apm-pmq");
}
