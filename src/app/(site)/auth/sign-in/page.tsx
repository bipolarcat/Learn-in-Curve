import type { Metadata } from "next";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { getSafeNextPath } from "@/lib/auth-next";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { hasProIntent } from "@/lib/pmq/plans";

export const metadata: Metadata = {
  title: "Sign in — Learn in Curve",
};

type SignInPageProps = {
  searchParams?: Promise<{ next?: string | string[]; error?: string | string[] }>;
};

export default async function SignInPage({
  searchParams,
}: SignInPageProps) {
  const params = searchParams ? await searchParams : {};
  const nextPath = getSafeNextPath(params.next);
  /*
   * /auth/callback and /auth/confirm both redirect here with `?error=` when
   * they can't establish a session. Until LIC-120 this param was ignored, so a
   * user clicking a dead "Confirm your email" link saw a cheerful "Welcome
   * back" and no explanation.
   */
  const authError = getAuthErrorMessage(params.error);

  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center overflow-x-clip px-5 py-6 sm:px-8 sm:py-8">
      <AuthDeskPanel
        mode="sign-in"
        nextPath={nextPath}
        proIntent={hasProIntent(nextPath)}
        initialError={authError}
      />
    </section>
  );
}
