import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isDemoSkipAuth } from "@/lib/demo";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isDemoSkipAuth()) {
    redirect(`/auth/sign-in?next=/courses/${slug}`);
  }

  if (slug === "pmq-in-5-days") {
    redirect("/courses/pmq-in-5-days");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course || course.status !== "live") {
    return (
      <section className="section-pad text-center">
        <h1 className="font-display text-3xl font-bold">Course not found</h1>
        <Link href="/dashboard" className="btn mt-6 inline-flex">
          Back to dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="section-pad text-center">
      <h1 className="font-display text-3xl font-bold">{course.name}</h1>
      <p className="mt-3 text-ink-soft">This course is not yet available.</p>
      <Link href="/dashboard" className="btn mt-6 inline-flex">
        Back to dashboard
      </Link>
    </section>
  );
}
