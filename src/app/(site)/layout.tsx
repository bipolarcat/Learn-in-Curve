import { SiteHeaderWithAuth } from "@/components/SiteHeaderWithAuth";
import { ConditionalSiteFooter } from "@/components/ConditionalSiteFooter";
import { SkipLink } from "@/components/SkipLink";
import { AnalyticsIdentify } from "@/components/analytics/AnalyticsIdentify";
import { createClient } from "@/lib/supabase/server";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      {user ? <AnalyticsIdentify userId={user.id} /> : null}
      <SiteHeaderWithAuth />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <ConditionalSiteFooter />
    </div>
  );
}
