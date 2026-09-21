import type { Metadata } from "next";
import { AuthDeskPanel } from "@/components/AuthDeskPanel";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import { getSafeNextPath } from "@/lib/auth-next";
import { hasProIntent } from "@/lib/pmq/plans";
import { buildTitle } from "@/lib/seo/title";
import {
  parseSoftNavFrom,
  resolveSoftNavBack,
} from "@/lib/soft-nav-back";

export const metadata: Metadata = {
  title: buildTitle("Sign up"),
};

type SignUpPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
    from?: string | string[];
  }>;
};

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps) {
  const params = searchParams ? await searchParams : {};
  const nextPath = getSafeNextPath(params.next);
  const from = parseSoftNavFrom(params.from);
  const back = resolveSoftNavBack(from);

  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center overflow-x-clip px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex w-full max-w-[22rem] flex-col items-stretch">
        <SoftNavBackLink
          href={back.href}
          label={back.label}
          busyLabel={back.busyLabel}
          className="mb-2.5 self-start"
        />
        <AuthDeskPanel
          mode="sign-up"
          nextPath={nextPath}
          proIntent={hasProIntent(nextPath)}
        />
      </div>
    </section>
  );
}
