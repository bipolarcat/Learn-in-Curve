import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";
import { buildTitle } from "@/lib/seo/title";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: buildTitle("Cookie Policy"),
  description:
    "Which cookies Learn in Curve uses, why we use them, and how you can change your preferences for analytics and essential site functions.",
  alternates: { canonical: `${SITE_URL}/cookies` },
};

export default function CookiesPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "COOKIE_NOTICE.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
