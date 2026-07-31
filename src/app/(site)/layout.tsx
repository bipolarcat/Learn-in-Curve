import { SiteHeaderWithAuth } from "@/components/SiteHeaderWithAuth";
import { ConditionalSiteFooter } from "@/components/ConditionalSiteFooter";
import { SkipLink } from "@/components/SkipLink";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <SiteHeaderWithAuth />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <ConditionalSiteFooter />
    </div>
  );
}
