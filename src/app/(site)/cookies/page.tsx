import { readFileSync } from "fs";
import { join } from "path";
import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Cookie Policy - Learn in Curve",
};

export default function CookiesPage() {
  const content = readFileSync(
    join(process.cwd(), "legal", "COOKIE_NOTICE.md"),
    "utf-8",
  );

  return <LegalPage content={content} />;
}
