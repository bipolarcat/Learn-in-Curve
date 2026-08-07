"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getAuthFailureReason,
  getPasswordUpdateErrorMessage,
} from "@/lib/auth-errors";
import {
  trackPasswordResetCompleted,
  trackPasswordResetFailed,
} from "@/lib/analytics/events";
import { createClient } from "@/lib/supabase/client";
import { formActionPrimary } from "@/components/ui/semantic";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/components/AuthForm.module.css";

const COURSE_PATH = "/courses/pmq-in-5-days";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("[auth/reset-password] updateUser failed", {
        code: error.code,
        message: error.message,
      });
      trackPasswordResetFailed({ reason: getAuthFailureReason(error) });
      setMessage(getPasswordUpdateErrorMessage(error));
      setLoading(false);
      return;
    }

    trackPasswordResetCompleted();
    router.push(COURSE_PATH);
    router.refresh();
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-[12px] font-medium text-ink/65"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${styles.input} auth-saas-input`}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block text-[12px] font-medium text-ink/65"
          >
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${styles.input} auth-saas-input`}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        {message && (
          <p className="text-[12.5px] font-medium text-ink/55" role="alert">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? "Working" : "Set new password"}
          className={`${formActionPrimary} auth-saas-btn auth-saas-btn--primary mt-0.5 w-full disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {loading ? (
            <Spinner variant="bars" size={16} className="text-current" aria-hidden />
          ) : (
            "Set new password"
          )}
        </button>
      </form>
    </div>
  );
}
