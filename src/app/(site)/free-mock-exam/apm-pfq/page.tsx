import type { Metadata } from "next";
import { FreeMockExamShell } from "@/components/free-mock/FreeMockExamShell";
import { getFreeMockExamConfig } from "@/lib/free-mock/config";
import { ogImages, twitterImages } from "@/lib/seo/og";

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
    ...ogImages(SITE_URL),
  },
  twitter: {
    ...twitterImages(SITE_URL),
    title: config.pageTitle,
    description: config.pageDescription,
  },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function FreeMockApmPfqPage({ searchParams }: PageProps) {
  return <FreeMockExamShell config={config} searchParams={searchParams} />;
}
