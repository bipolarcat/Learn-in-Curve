import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Service - Learn in Curve",
};

export default function TermsPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "TERMS_OF_SERVICE.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
