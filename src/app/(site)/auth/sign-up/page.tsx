import type { Metadata } from "next";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { getSafeNextPath } from "@/lib/auth-next";
import { hasProIntent } from "@/lib/pmq/plans";

export const metadata: Metadata = {
  title: "Sign up — Learn in Curve",
};

type SignUpPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps) {
  const params = searchParams ? await searchParams : {};
  const nextPath = getSafeNextPath(params.next);

  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center overflow-x-clip px-5 py-6 sm:px-8 sm:py-8">
      <AuthDeskPanel
        mode="sign-up"
        nextPath={nextPath}
        proIntent={hasProIntent(nextPath)}
      />
    </section>
  );
}
