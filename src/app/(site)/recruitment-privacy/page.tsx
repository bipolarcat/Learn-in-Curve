import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Recruitment Privacy Notice - Learn in Curve",
};

export default function RecruitmentPrivacyPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "RECRUITMENT_PRIVACY_NOTICE.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
