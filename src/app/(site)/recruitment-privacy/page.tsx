import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: "Recruitment Privacy Notice - Learn in Curve",
  description:
    "How Learn in Curve handles personal data from job applicants — what we collect during recruitment, why we need it, and how long we keep it.",
  alternates: { canonical: `${SITE_URL}/recruitment-privacy` },
};

export default function RecruitmentPrivacyPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "RECRUITMENT_PRIVACY_NOTICE.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
