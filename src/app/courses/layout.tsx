import { SiteHeaderWithAuth } from "@/components/SiteHeaderWithAuth";
import { CoursesSiteFooter } from "@/components/CoursesSiteFooter";
import { SkipLink } from "@/components/SkipLink";

export default function CoursesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen min-w-0 flex-col text-ink font-body">
      <SkipLink />
      <SiteHeaderWithAuth />
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
      <CoursesSiteFooter />
    </div>
  );
}
