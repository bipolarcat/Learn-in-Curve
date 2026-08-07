import { SiteHeaderWithAuth } from "@/components/SiteHeaderWithAuth";
import { CoursesSiteFooter } from "@/components/CoursesSiteFooter";
import { SkipLink } from "@/components/SkipLink";
import { AnalyticsIdentify } from "@/components/analytics/AnalyticsIdentify";
import { createClient } from "@/lib/supabase/server";

export default async function CoursesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen min-w-0 flex-col text-ink font-body">
      <SkipLink />
      {user ? <AnalyticsIdentify userId={user.id} /> : null}
      <SiteHeaderWithAuth />
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
      <CoursesSiteFooter />
    </div>
  );
}
