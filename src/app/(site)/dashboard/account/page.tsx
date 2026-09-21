import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildTitle } from "@/lib/seo/title";

export const metadata: Metadata = {
  title: buildTitle("Account"),
  robots: { index: false, follow: false },
};

/**
 * Account deletion lives on the dashboard profile menu (trash beside close).
 * This route stays as a support deep-link / bookmark target.
 */
export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/dashboard/account");
  }

  return (
    <div className="mx-auto flex w-full max-w-wrap flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.03em] text-ink">
          Account
        </h1>
        <p className="m-0 font-body text-[15px] text-ink/70">
          Signed in as {user.email}.{" "}
          <Link href="/dashboard" className="underline">
            Back to dashboard
          </Link>
        </p>
      </div>

      <p className="m-0 max-w-prose font-body text-[14px] leading-relaxed text-ink/70">
        To delete your account, open your profile on the dashboard and use the
        trash icon at the bottom left of the panel. You can also ask us to delete your
        data by emailing support@learnincurve.com. See the{" "}
        <Link href="/privacy" className="underline">
          privacy policy
        </Link>{" "}
        for what we keep and for how long.
      </p>
    </div>
  );
}
