import { createServiceClient } from "@/lib/supabase/admin";
import {
  productActionPrimary,
  productActionSecondary,
  productSurface,
} from "@/components/ui/semantic";

type SurveyPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    r?: string;
    l?: string;
    a?: string;
    improve?: string;
    note?: string;
    done?: string;
  }>;
};

// Zero-JS, server-rendered click-through feedback survey. Every "question"
// is either a plain link (the click itself is the answer, recorded on the
// server before the next block renders) or a native GET <form> for the two
// optional free-text steps — no client-side JavaScript required at all.
//
// Flow (see BUSINESS_STATE.md 2026-07-06 for the full design rationale):
//   1. Email links straight to ?r=<1-5>            -> records rating
//   2. This page then shows the login question      -> ?r&l=y|n
//   3. Branches on r:
//        r <= 2  -> "what could we improve" (open text, then done)
//        r >= 3  -> "want early access" y/n -> optional closing text -> done
export default async function SurveyPage({
  params,
  searchParams,
}: SurveyPageProps) {
  const { token } = await params;
  const sp = await searchParams;

  const supabase = createServiceClient();

  const { data: invite } = await supabase
    .from("survey_invites")
    .select("id")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <Shell>
        <p className="font-body text-[15px] text-ink/80">
          This link isn&apos;t valid — it may have expired or been copied
          incorrectly. No worries either way, thanks for stopping by.
        </p>
      </Shell>
    );
  }

  const rating = sp.r ? Number(sp.r) : undefined;
  const login = sp.l as "y" | "n" | undefined;
  const access = sp.a as "y" | "n" | undefined;
  const improve = sp.improve?.trim();
  const note = sp.note?.trim();
  const isDone = sp.done !== undefined;

  // Record whatever this specific request just told us, then keep going.
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  let wroteAnything = false;

  if (rating && rating >= 1 && rating <= 5) {
    patch.rating = rating;
    wroteAnything = true;
  }
  if (login === "y" || login === "n") {
    patch.login_issue = login === "y";
    wroteAnything = true;
  }
  if (access === "y" || access === "n") {
    patch.early_access = access === "y";
    wroteAnything = true;
  }
  if (improve) {
    patch.improve_text = improve;
    wroteAnything = true;
  }
  if (note) {
    patch.additional_text = note;
    wroteAnything = true;
  }

  if (wroteAnything) {
    const { error: writeError } = await supabase
      .from("survey_responses")
      .upsert({ invite_id: invite.id, ...patch }, { onConflict: "invite_id" });
    if (writeError) {
      const retry = new URLSearchParams();
      Object.entries(sp).forEach(([key, value]) => {
        if (value !== undefined) retry.set(key, value);
      });
      return (
        <Shell>
          <h1 className="mb-3 font-display text-2xl font-semibold text-ink">
            We couldn&apos;t save that
          </h1>
          <p className="text-[15px] text-ink/80" role="alert">
            Your response is still here. Check your connection and retry.
          </p>
          <a href={`/survey/${token}?${retry}`} className={`${productActionPrimary} mt-5`}>
            Retry
          </a>
        </Shell>
      );
    }
  }

  // --- Decide what to show next ---

  if (improve !== undefined || note !== undefined || isDone) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink mb-3">
          Thanks — genuinely appreciate it 🎉
        </h1>
        <p className="font-body text-[15px] text-ink/80">
          That&apos;s everything. Have a good one.
        </p>
      </Shell>
    );
  }

  const base = `/survey/${token}`;

  if (access !== undefined) {
    // High/mid branch, after the early-access click — final optional note.
    const carry = `r=${rating ?? sp.r}&l=${login ?? sp.l}&a=${access}`;
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink mb-4">
          One last (optional) thing
        </h1>
        <form action={base} method="get" className="grid gap-3">
          <input type="hidden" name="r" value={rating ?? sp.r} />
          <input type="hidden" name="l" value={login ?? sp.l} />
          <input type="hidden" name="a" value={access} />
          <textarea
            name="note"
            rows={3}
            placeholder="Anything else you'd like to add? (optional)"
            className="w-full rounded-md border-2 border-ink bg-paper p-3 font-body text-[15px] text-ink outline-none"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className={productActionPrimary}
            >
              Send
            </button>
            <a
              href={`${base}?${carry}&done=1`}
              className={productActionSecondary}
            >
              No thanks, that&apos;s all
            </a>
          </div>
        </form>
      </Shell>
    );
  }

  if (login !== undefined) {
    const r = rating ?? Number(sp.r);
    if (r <= 2) {
      return (
        <Shell>
          <h1 className="font-display text-2xl font-semibold text-ink mb-4">
            Sorry to hear that
          </h1>
          <form action={base} method="get" className="grid gap-3">
            <input type="hidden" name="r" value={r} />
            <input type="hidden" name="l" value={login} />
            <textarea
              name="improve"
              rows={3}
              placeholder="What's the one thing we could improve?"
              className="w-full rounded-md border-2 border-ink bg-paper p-3 font-body text-[15px] text-ink outline-none"
            />
            <button
              type="submit"
              className={productActionPrimary}
            >
              Send
            </button>
          </form>
        </Shell>
      );
    }

    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink mb-4">
          Great to hear!
        </h1>
        <p className="font-body text-[15px] text-ink/80 mb-5">
          We&apos;re about to launch a free upgrade of PMQ in 5
          days — including an AI tutor. Want early access as new features
          roll out?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`${base}?r=${r}&l=${login}&a=y`}
            className={productActionPrimary}
          >
            Yes
          </a>
          <a
            href={`${base}?r=${r}&l=${login}&a=n`}
            className={productActionSecondary}
          >
            No thanks
          </a>
        </div>
      </Shell>
    );
  }

  if (rating !== undefined) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink mb-4">
          Thanks! One more thing
        </h1>
        <p className="font-body text-[15px] text-ink/80 mb-5">
          Have you ever had trouble logging in, or found yourself logged out
          unexpectedly?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`${base}?r=${rating}&l=y`}
            className={productActionPrimary}
          >
            Yes
          </a>
          <a
            href={`${base}?r=${rating}&l=n`}
            className={productActionSecondary}
          >
            No
          </a>
        </div>
      </Shell>
    );
  }

  // Defensive fallback — normally the email links straight to ?r=<n>.
  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold text-ink mb-4">
        How has your overall experience with PMQ in 5 days by Learn in
        Curve been so far?
      </h1>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[
          ["1", "😡"],
          ["2", "🙁"],
          ["3", "😐"],
          ["4", "🙂"],
          ["5", "😄"],
        ].map(([n, emoji]) => (
          <a
            key={n}
            href={`${base}?r=${n}`}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-ink/15 bg-paper px-2 py-3 text-xs font-bold text-ink transition-colors hover:border-orange hover:bg-orange/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="text-2xl">{emoji}</span>
            {n}
          </a>
        ))}
      </div>
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
