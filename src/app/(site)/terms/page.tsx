import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";
import { buildTitle } from "@/lib/seo/title";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: buildTitle("Terms of Service"),
  description:
    "The terms that govern use of Learn in Curve — accounts, courses, payments, acceptable use, and what happens if something goes wrong.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "TERMS_OF_SERVICE.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
