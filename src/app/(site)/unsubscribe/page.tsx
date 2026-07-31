import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/admin";
import { productActionPrimary, productSurface } from "@/components/ui/semantic";

export const metadata = {
  title: "Unsubscribe - Learn in Curve",
};

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

// Server-rendered, zero-JS unsubscribe link target for the notify-confirmation
// email. Clicking the link unsubscribes immediately (no second "are you sure"
// step) — standard for a simple notify list and idempotent either way.
export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Shell>
        <h1 className="mb-3 font-display text-2xl font-semibold text-ink">
          Link isn&apos;t valid
        </h1>
        <p className="font-body text-[15px] text-ink/80">
          This unsubscribe link is missing its token. If you copied it by
          hand, try clicking straight from the email instead.
        </p>
      </Shell>
    );
  }

  const supabase = createServiceClient();

  const { data: subscriber, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, unsubscribed_at")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (error || !subscriber) {
    return (
      <Shell>
        <h1 className="mb-3 font-display text-2xl font-semibold text-ink">
          Link isn&apos;t valid
        </h1>
        <p className="font-body text-[15px] text-ink/80">
          This unsubscribe link doesn&apos;t match anything on our list — it
          may have expired or already been used.
        </p>
      </Shell>
    );
  }

  if (!subscriber.unsubscribed_at) {
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("[unsubscribe] update failed", updateError);
      return (
        <Shell>
          <h1 className="mb-3 font-display text-2xl font-semibold text-ink">
            We couldn&apos;t process that
          </h1>
          <p className="font-body text-[15px] text-ink/80" role="alert">
            Something went wrong on our end. Try the link again in a minute,
            or email us directly and we&apos;ll take care of it by hand.
          </p>
        </Shell>
      );
    }
  }

  return (
    <Shell>
      <p className="mb-1 font-body text-[13px] font-bold tracking-[0.02em] text-ink">
        Learn in <span className="text-orange">Curve</span>
      </p>
      <h1 className="mb-3 font-display text-2xl font-semibold text-ink">
        You&apos;re unsubscribed
      </h1>
      <p className="font-body text-[15px] leading-relaxed text-ink/80">
        <span className="break-all font-semibold">{subscriber.email}</span>{" "}
        won&apos;t get any more notify-me emails from us. Changed your mind?
        Just sign up again any time.
      </p>
      <Link href="/" className={`${productActionPrimary} mt-5`}>
        Back to Learn in Curve
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-8 sm:px-6">
      <div className={`${productSurface} w-full max-w-[440px] p-5 sm:p-8`}>
        {children}
      </div>
    </main>
  );
}
