import type { Metadata } from "next";
import { FreeMockExamShell } from "@/components/free-mock/FreeMockExamShell";
import { getFreeMockExamConfig } from "@/lib/free-mock/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

const config = getFreeMockExamConfig("apm-pfq");

export const metadata: Metadata = {
  title: config.pageTitle,
  description: config.pageDescription,
  alternates: { canonical: `${SITE_URL}${config.path}` },
  openGraph: {
    title: config.pageTitle,
    description: config.pageDescription,
    url: `${SITE_URL}${config.path}`,
    type: "website",
  },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function FreeMockApmPfqPage({ searchParams }: PageProps) {
  return <FreeMockExamShell config={config} searchParams={searchParams} />;
}
