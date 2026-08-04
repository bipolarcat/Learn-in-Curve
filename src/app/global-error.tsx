"use client";

import { useEffect } from "react";
import { Fraunces, Figtree } from "next/font/google";
import posthog from "posthog-js";
import { SiteStatusPage } from "@/components/SiteStatusPage";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Root-layout crash boundary — must ship its own html/body.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable}`}
    >
      <body className="min-h-screen">
        <SiteStatusPage variant="error" onRetry={reset} />
        <span className="sr-only">{error.message}</span>
      </body>
    </html>
  );
}
