import type { Metadata } from "next";
import Link from "next/link";
import { AuthDeskScene } from "@/components/AuthDeskScene";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { quietFormSurface } from "@/components/ui/semantic";
import { createClient } from "@/lib/supabase/server";
import styles from "@/components/AuthDeskPanel.module.css";
import { buildTitle } from "@/lib/seo/title";
import { getSafeNextPath } from "@/lib/auth-next";

export const metadata: Metadata = {
  title: buildTitle("Set a new password"),
};

type ResetPasswordPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = searchParams ? await searchParams : {};
  const nextPath = getSafeNextPath(params.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasSession = Boolean(user);

  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-start overflow-x-clip px-5 py-6 sm:justify-center sm:px-8 sm:py-8">
      <div className="relative w-full max-w-[22rem]">
        <AuthDeskScene />
        <div
          className={`${quietFormSurface} ${styles.panel} relative overflow-hidden`}
        >
          <div className={styles.intro}>
            <h1>
              {hasSession ? (
                <>
                  Set a new <span className="text-orange">password</span>
                </>
              ) : (
                <>
                  Link <span className="text-orange">expired</span>
                </>
              )}
            </h1>
            <p>
              {hasSession
                ? "Choose a new password for your account."
                : "This reset link has expired or has already been used."}
            </p>
          </div>
          {hasSession ? (
            <ResetPasswordForm nextPath={nextPath} />
          ) : (
            <p className="text-center text-[12.5px] text-ink/45">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-orange hover:text-orange-dark"
              >
                Request a new reset link
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
