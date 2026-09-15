"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteOwnAccount } from "@/lib/account/delete-account";
import { DELETE_CONFIRMATION_PHRASE } from "@/lib/account/deletion-scope";
import { Spinner } from "@/components/ui/spinner";

export function DeleteAccountPanel({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready =
    confirmation.trim().toUpperCase() === DELETE_CONFIRMATION_PHRASE;

  async function handleDelete() {
    if (busy || !ready) return;
    setBusy(true);
    setError(null);

    const result = await deleteOwnAccount(confirmation);

    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    // The server already signed the session out. Clear the client copy too so
    // no stale session survives in this tab.
    await createClient().auth.signOut().catch(() => {});
    router.push("/?deleted=1");
    router.refresh();
  }

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="flex flex-col gap-4 rounded-2xl border border-rust/25 bg-paper p-4 sm:p-5"
    >
      <h2
        id="delete-account-heading"
        className="m-0 font-display text-xl font-semibold tracking-[-0.02em] text-ink"
      >
        Delete your account
      </h2>

      <div className="flex flex-col gap-2 font-body text-[14px] leading-relaxed text-ink/75">
        <p className="m-0">
          This permanently deletes the account for <strong>{email}</strong> and
          everything attached to it: your progress, mock attempts and scores,
          practice history, certificates, Sly conversations, and any course
          access you have bought. It cannot be undone and we cannot restore it.
        </p>
        <p className="m-0">
          If you have paid for a course, deleting the account does not refund
          it, and buying again later means paying again. Our payment provider
          keeps its own record of the transaction because UK tax law requires
          us to be able to account for it.
        </p>
      </div>

      {open ? (
        <div className="flex flex-col gap-3">
          <label
            htmlFor="delete-confirm"
            className="font-body text-[13px] font-semibold text-ink"
          >
            Type {DELETE_CONFIRMATION_PHRASE} to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
            className="w-full max-w-[16rem] rounded-xl border border-ink/15 bg-paper px-3 py-2 font-body text-[14px] text-ink"
          />
          {error ? (
            <p className="m-0 font-body text-[13px] text-rust" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!ready || busy}
              aria-busy={busy}
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-rust/40 bg-rust/[0.06] px-4 font-body text-[13px] font-semibold text-rust disabled:opacity-50"
            >
              {busy ? (
                <Spinner variant="ellipsis" size={16} aria-hidden />
              ) : null}
              {busy ? "Deleting" : "Delete my account permanently"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmation("");
                setError(null);
              }}
              disabled={busy}
              className="inline-flex min-h-9 items-center rounded-xl border border-ink/12 px-4 font-body text-[13px] font-semibold text-ink/80"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-9 w-fit items-center rounded-xl border border-rust/40 px-4 font-body text-[13px] font-semibold text-rust"
        >
          Delete my account
        </button>
      )}
    </section>
  );
}
