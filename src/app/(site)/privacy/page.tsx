import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy - Learn in Curve",
};

export default function PrivacyPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "PRIVACY_POLICY.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
