"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { authHrefWithNext, getSafeNextPath } from "@/lib/auth-next";
import { createClient } from "@/lib/supabase/client";
import { getCanonicalOrigin } from "@/lib/site-url";
import {
  forgetLastGoogleEmail,
  markHasAccount,
  readLastGoogleEmail,
} from "@/lib/auth-hints";
import { syncThemeCookieFromProfile } from "@/lib/profile-actions";
import { AuthCheckInbox } from "@/components/AuthCheckInbox";
import {
  formActionPrimary,
  formActionSecondary,
} from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import { showToast } from "@/components/ui/toast";
import styles from "@/components/AuthForm.module.css";

const TERMS_REQUIRED_COPY =
  "Tick the box to agree to the Terms and Privacy Policy — then you can continue.";

/** Signup terms gate — full-width paper alert with a short attention pulse. */
function TermsAgreementAlert({ message }: { message: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.97 }}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: [
                "0 1px 2px rgb(var(--ink-rgb) / 0.06), 0 0 0 0 rgb(var(--orange-rgb) / 0)",
                "0 1px 2px rgb(var(--ink-rgb) / 0.06), 0 0 0 4px rgb(var(--orange-rgb) / 0.22)",
                "0 1px 2px rgb(var(--ink-rgb) / 0.06), 0 8px 22px rgb(var(--ink-rgb) / 0.1), 0 0 0 0 rgb(var(--orange-rgb) / 0)",
              ],
            }
      }
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.28,
        ease: [0.22, 1, 0.36, 1],
        boxShadow: reduceMotion
          ? undefined
          : {
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.35, 1],
            },
      }}
      id="terms-error"
      role="alert"
      className="mt-2.5 flex w-full items-start gap-2.5 rounded-xl border border-orange/45 bg-orange/[0.09] px-3 py-2.5 dark:border-orange/40 dark:bg-orange/[0.14]"
    >
      <span className="relative mt-0.5 inline-flex size-5 shrink-0 items-center justify-center">
        {!reduceMotion ? (
          <span
            className="absolute inset-0 rounded-full bg-orange/25 animate-ping"
            aria-hidden
          />
        ) : null}
        <AlertTriangle
          className="relative size-4 text-orange"
          strokeWidth={2.5}
          aria-hidden
        />
      </span>
      <p className="min-w-0 flex-1 font-body text-[13px] font-semibold leading-snug tracking-tight text-ink text-pretty">
        {message}
      </p>
    </motion.div>
  );
}

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  nextPath: string;
  /** Soft SaaS chrome for auth pages; default keeps stamp/ticket look elsewhere. */
  variant?: "default" | "saas";
  /**
   * Copy for a failure that happened BEFORE this form rendered — a dead
   * confirmation link or a failed OAuth exchange, arriving as `?error=`.
   * Seeded into the same message slot as inline validation so there is exactly
   * one place errors appear. See src/lib/auth-errors.ts and LIC-120.
   */
  initialError?: string | null;
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
  initialError = null,
  className = "",
}: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const termsCheckboxRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(initialError);
  const [isError, setIsError] = useState(Boolean(initialError));
  const [agreed, setAgreed] = useState(false);
  const [termsError, setTermsError] = useState(false);
  /**
   * Last Google account used on this device, passed to Google as a login_hint so
   * returning users skip the account chooser. Read in an effect rather than at
   * render time: it comes from document.cookie, which doesn't exist during SSR,
   * so reading it inline would cause a hydration mismatch.
   */
  const [googleHint, setGoogleHint] = useState<string | null>(null);
  /** Sign-up succeeded but email confirmation required — show check-inbox card. */
  const [awaitingConfirmEmail, setAwaitingConfirmEmail] = useState<
    string | null
  >(null);
  const saas = variant === "saas";
  const safeNextPath = getSafeNextPath(nextPath);
  const callbackPath = authHrefWithNext("/auth/callback", safeNextPath);
  /*
   * Canonical origin, NOT window.location.origin (LIC-120). A user on the apex
   * domain would otherwise get auth links pointing at the apex, and
   * https://learnincurve.com/auth/callback returns "Not Found" — the apex→www
   * redirect only covers "/" and strips the path. See src/lib/site-url.ts.
   */
  const canonicalOrigin = getCanonicalOrigin();
  const accountSwitchPath = authHrefWithNext(
    mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in",
    safeNextPath,
  );

  useEffect(() => {
    setGoogleHint(readLastGoogleEmail());
    if (initialError) {
      showAuthToast(initialError, "error");
    }
  }, [initialError]);

  /** Fire the same short LIC toast used by quiz Generate hints. */
  function showAuthToast(msg: string, kind: "warning" | "error") {
    showToast({
      message: msg,
      variant: kind,
      duration: 3500,
      position: "top-center",
    });
  }

  function requireTermsAcceptance(): boolean {
    if (mode !== "sign-up" || agreed) {
      return true;
    }

    const msg = TERMS_REQUIRED_COPY;
    setTermsError(true);
    setIsError(true);
    setMessage(msg);
    showAuthToast(msg, "warning");
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
              emailRedirectTo: `${canonicalOrigin}${callbackPath}`,
            },
          })
        : supabase.auth.signInWithPassword({ email, password });

    const { data, error } = await action;

    if (error) {
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
      showAuthToast(error.message, "error");
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

    // Password sign-in never touches /auth/callback, so the theme mirror cookie
    // has to be seeded from the account here or a dark-mode user would land
    // light on any browser they haven't toggled in. See LIC-114.
    await syncThemeCookieFromProfile().catch(() => {
      /* non-fatal: worst case they land light and can toggle */
    });

    router.push(safeNextPath);
    router.refresh();
  }

  function handleForgetGoogleAccount() {
    forgetLastGoogleEmail();
    setGoogleHint(null);
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
        redirectTo: `${canonicalOrigin}${callbackPath}`,
        // Naming the account lets Google skip its chooser for people with more
        // than one Google session. It is only a hint: if that session has
        // expired, or the account can't be used, Google falls back to the
        // chooser on its own. Cleared via "Use a different Google account".
        ...(googleHint ? { queryParams: { login_hint: googleHint } } : {}),
      },
    });
    if (error) {
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
      showAuthToast(error.message, "error");
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
          nextPath={safeNextPath}
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

        {googleHint && (
          <button
            type="button"
            onClick={handleForgetGoogleAccount}
            className="mb-3 w-full text-center text-[11px] text-ink/45 underline underline-offset-2 hover:text-ink/70"
          >
            Use a different Google account
          </button>
        )}

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
            {mode === "sign-in" && (
              <Link
                href="/auth/forgot-password"
                className="mt-1.5 inline-block text-[12px] font-medium text-orange hover:text-orange-dark"
              >
                Forgot password?
              </Link>
            )}
          </div>

          {message && !termsError && (
            <p
              className={`text-[12.5px] font-semibold ${isError ? "text-rust" : "text-olive"}`}
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
                className={`mt-0.5 h-4 w-4 shrink-0 rounded border-ink/25 accent-orange transition-[box-shadow] duration-200 ${
                  termsError
                    ? "ring-2 ring-orange/55 ring-offset-2 ring-offset-cream"
                    : ""
                }`}
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
            <AnimatePresence>
              {termsError && message ? (
                <TermsAgreementAlert key="terms-error" message={message} />
              ) : null}
            </AnimatePresence>
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
              className={`mt-0.5 h-4 w-4 shrink-0 accent-orange transition-[box-shadow] duration-200 ${
                termsError
                  ? "ring-2 ring-orange/55 ring-offset-2 ring-offset-cream"
                  : ""
              }`}
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
          <AnimatePresence>
            {termsError && message ? (
              <TermsAgreementAlert key="terms-error" message={message} />
            ) : null}
          </AnimatePresence>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className={`btn btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-50 ${googleHint ? "mb-2" : "mb-6"}`}
      >
        <GoogleMark />
        Continue with Google
      </button>

      {googleHint && (
        <button
          type="button"
          onClick={handleForgetGoogleAccount}
          className="mb-6 w-full text-center font-body text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
        >
          Use a different Google account
        </button>
      )}

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
          {mode === "sign-in" && (
            <Link
              href="/auth/forgot-password"
              className="mt-2 inline-block text-sm font-bold text-primary hover:text-primary-dark"
            >
              Forgot password?
            </Link>
          )}
        </div>

        {message && !termsError && (
          <p
            className={`font-body text-[12.5px] font-semibold ${isError ? "text-rust" : "text-olive"}`}
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
