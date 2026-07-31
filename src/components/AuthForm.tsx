"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { authHrefWithNext, getSafeNextPath } from "@/lib/auth-next";
import { createClient } from "@/lib/supabase/client";
import { markHasAccount } from "@/lib/auth-hints";
import { AuthCheckInbox } from "@/components/AuthCheckInbox";
import {
  formActionPrimary,
  formActionSecondary,
} from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/components/AuthForm.module.css";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  nextPath: string;
  /** Soft SaaS chrome for auth pages; default keeps stamp/ticket look elsewhere. */
  variant?: "default" | "saas";
  className?: string;
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.72-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.29a12 12 0 0 0 0 10.74l3.99-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.63l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export function AuthForm({
  mode,
  nextPath,
  variant = "default",
  className = "",
}: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const termsCheckboxRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [termsError, setTermsError] = useState(false);
  /** Sign-up succeeded but email confirmation required — show check-inbox card. */
  const [awaitingConfirmEmail, setAwaitingConfirmEmail] = useState<
    string | null
  >(null);
  const saas = variant === "saas";
  const safeNextPath = getSafeNextPath(nextPath);
  const callbackPath = authHrefWithNext("/auth/callback", safeNextPath);
  const accountSwitchPath = authHrefWithNext(
    mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in",
    safeNextPath,
  );

  function requireTermsAcceptance(): boolean {
    if (mode !== "sign-up" || agreed) {
      return true;
    }

    setTermsError(true);
    setIsError(true);
    setMessage("Please agree to the Terms and Privacy Policy to continue.");
    requestAnimationFrame(() => termsCheckboxRef.current?.focus());
    return false;
  }

  function handleAgreementChange(checked: boolean) {
    setAgreed(checked);
    if (checked && termsError) {
      setTermsError(false);
      setIsError(false);
      setMessage(null);
    }
  }

  function handleUseDifferentEmail() {
    const kept = awaitingConfirmEmail ?? email;
    setAwaitingConfirmEmail(null);
    setEmail(kept);
    setPassword("");
    setMessage(null);
    setIsError(false);
    requestAnimationFrame(() => emailInputRef.current?.focus());
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();

    if (!requireTermsAcceptance()) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setIsError(false);

    const action =
      mode === "sign-up"
        ? supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}${callbackPath}`,
            },
          })
        : supabase.auth.signInWithPassword({ email, password });

    const { data, error } = await action;

    if (error) {
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    markHasAccount();

    // Sign-up with "Confirm email" on returns no session — user must click
    // the emailed link before /auth/callback signs them in. If confirmation
    // is off (or already-confirmed edge cases), signUp() returns a live
    // session immediately — treat that the same as a normal sign-in.
    if (mode === "sign-up" && !data.session) {
      setAwaitingConfirmEmail(email.trim());
      setLoading(false);
      return;
    }

    router.push(safeNextPath);
    router.refresh();
  }

  async function handleGoogle() {
    if (!requireTermsAcceptance()) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setIsError(false);
    markHasAccount();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${callbackPath}`,
      },
    });
    if (error) {
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  }

  const linkClass = saas
    ? "font-medium text-orange hover:text-orange-dark"
    : "font-bold text-primary hover:text-primary-dark";

  if (awaitingConfirmEmail) {
    return (
      <div
        className={`${saas ? styles.root : ""} w-full ${saas ? "" : "max-w-md"} ${className}`.trim()}
      >
        <AuthCheckInbox
          email={awaitingConfirmEmail}
          variant={variant}
          onUseDifferentEmail={handleUseDifferentEmail}
        />
      </div>
    );
  }

  if (saas) {
    return (
      <div className={`${styles.root} w-full ${className}`.trim()}>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className={`${formActionSecondary} auth-saas-btn auth-saas-btn--secondary mb-3 w-full disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <GoogleMark />
          Continue with Google
        </button>

        <div className="my-3 flex items-center gap-3" role="separator" aria-label="or email">
          <div className="h-px min-w-0 flex-1 bg-ink/[0.08]" aria-hidden />
          <span className="shrink-0 text-[11px] text-ink/45">or email</span>
          <div className="h-px min-w-0 flex-1 bg-ink/[0.08]" aria-hidden />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-2.5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[12px] font-medium text-ink/65"
            >
              Email
            </label>
            <input
              ref={emailInputRef}
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
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-[12px] font-medium text-ink/65"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} auth-saas-input`}
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              placeholder={mode === "sign-up" ? "At least 6 characters" : "••••••••"}
            />
          </div>

          {message && !termsError && (
            <p
              className={`text-[12.5px] font-medium ${isError ? "text-ink/55" : "text-olive"}`}
              role="alert"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-label={
              loading
                ? "Working"
                : mode === "sign-up"
                  ? "Create account"
                  : "Sign in"
            }
            className={`${formActionPrimary} auth-saas-btn auth-saas-btn--primary mt-0.5 w-full disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {loading ? (
              <Spinner variant="bars" size={16} className="text-current" aria-hidden />
            ) : mode === "sign-up" ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {mode === "sign-up" && (
          <div className="mt-3.5">
            <label className="flex items-start gap-2 text-[12.5px] leading-snug text-ink/55">
              <input
                ref={termsCheckboxRef}
                type="checkbox"
                checked={agreed}
                onChange={(e) => handleAgreementChange(e.target.checked)}
                required
                aria-invalid={termsError}
                aria-describedby={termsError ? "terms-error" : undefined}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/25 accent-orange"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className={linkClass} target="_blank">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className={linkClass} target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {termsError && (
              <p
                id="terms-error"
                className="mt-2 text-[12.5px] font-medium text-ink/55"
                role="alert"
              >
                {message}
              </p>
            )}
          </div>
        )}

        <p
          className="mt-3.5 text-center text-[12.5px] text-ink/45"
        >
          {mode === "sign-in" ? (
            <>
              No account?{" "}
              <Link href={accountSwitchPath} className={linkClass}>
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={accountSwitchPath} className={linkClass}>
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md ${className}`.trim()}>
      {mode === "sign-up" && (
        <div className="mb-5">
          <label className="flex items-start gap-2 text-sm text-ink-soft">
            <input
              ref={termsCheckboxRef}
              type="checkbox"
              checked={agreed}
              onChange={(e) => handleAgreementChange(e.target.checked)}
              required
              aria-invalid={termsError}
              aria-describedby={termsError ? "terms-error" : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 accent-orange"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className={linkClass} target="_blank">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className={linkClass} target="_blank">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {termsError && (
            <p
              id="terms-error"
              className="mt-2 font-body text-[12.5px] font-medium text-ink/55"
              role="alert"
            >
              {message}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="btn btn-secondary mb-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-line" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 font-body text-xs font-bold uppercase tracking-wider text-ink-soft">
            or email
          </span>
        </div>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-ink-soft"
          >
            Email
          </label>
          <input
            ref={emailInputRef}
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            autoComplete="email"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block font-body text-xs font-bold uppercase tracking-wider text-ink-soft"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            autoComplete={
              mode === "sign-up" ? "new-password" : "current-password"
            }
          />
        </div>

        {message && !termsError && (
          <p
            className={`font-body text-[12.5px] font-medium ${isError ? "text-ink/55" : "text-olive"}`}
            role="alert"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-label={
            loading
              ? "Working"
              : mode === "sign-up"
                ? "Create account"
                : "Sign in"
          }
          className="btn w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Spinner variant="bars" size={16} className="text-current" aria-hidden />
          ) : mode === "sign-up" ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "sign-in" ? (
          <>
            No account?{" "}
            <Link href={accountSwitchPath} className={linkClass}>
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={accountSwitchPath} className={linkClass}>
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
