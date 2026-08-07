"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCanonicalOrigin } from "@/lib/site-url";
import { formActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/components/AuthForm.module.css";

const NEUTRAL_MESSAGE =
  "If an account exists for that email, we've sent a link to reset your password.";

export function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Always show the same neutral confirmation, whether or not the address
    // has an account — resetPasswordForEmail must never be used to enumerate
    // registered emails.
    // redirectTo is unused while the Supabase Reset Password template uses
    // the PKCE /auth/confirm?token_hash=… path, but keep a canonical origin
    // so a template revert doesn't inherit a localhost/preview host.
    await supabase.auth
      .resetPasswordForEmail(email, {
        redirectTo: `${getCanonicalOrigin()}/auth/reset-password`,
      })
      .catch(() => {});

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full">
        <p className="text-center text-[13px] leading-snug text-ink/70">
          {NEUTRAL_MESSAGE}
        </p>
        <p className="mt-3.5 text-center text-[12.5px] text-ink/45">
          <Link href="/auth/sign-in" className="font-medium text-orange hover:text-orange-dark">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-[12px] font-medium text-ink/65"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${styles.input} auth-saas-input`}
            autoComplete="email"
            placeholder="you@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? "Working" : "Send reset link"}
          className={`${formActionPrimary} auth-saas-btn auth-saas-btn--primary mt-0.5 w-full disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {loading ? (
            <Spinner variant="bars" size={16} className="text-current" aria-hidden />
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <p className="mt-3.5 text-center text-[12.5px] text-ink/45">
        <Link href="/auth/sign-in" className="font-medium text-orange hover:text-orange-dark">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
