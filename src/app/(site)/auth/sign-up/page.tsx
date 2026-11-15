import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { getSafeNextPath } from "@/lib/auth-next";
import { hasProIntent } from "@/lib/pmq/plans";
import { buildTitle } from "@/lib/seo/title";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: buildTitle("Sign up"),
};

type SignUpPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps) {
  const params = searchParams ? await searchParams : {};
  const nextPath = getSafeNextPath(params.next);

  // Already signed in (e.g. clicked a shared /pmq-mock link): skip the form and
  // go straight to where the link was heading. LIC-204.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(nextPath);

  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-start overflow-x-clip px-5 py-6 sm:justify-center sm:px-8 sm:py-8">
      <AuthDeskPanel
        mode="sign-up"
        nextPath={nextPath}
        proIntent={hasProIntent(nextPath)}
      />
    </section>
  );
}
