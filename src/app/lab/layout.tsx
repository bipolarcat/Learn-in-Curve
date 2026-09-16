import type { Metadata } from "next";

/**
 * Design sandbox shell — no site header/footer.
 * Lives outside `(site)` so homepage chrome never wraps experiments.
 */
export const metadata: Metadata = {
  title: "Lab — Learn in Curve",
  description: "Internal design sandbox. Not indexed.",
  robots: { index: false, follow: false },
};

export default function LabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-cream text-ink antialiased">{children}</div>
  );
}
