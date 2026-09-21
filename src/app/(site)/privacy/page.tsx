import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";
import { buildTitle } from "@/lib/seo/title";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: buildTitle("Privacy Policy"),
  description:
    "How Learn in Curve collects, uses and stores personal data for the study platform, including accounts, payments, and exam revision activity.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "PRIVACY_POLICY.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
