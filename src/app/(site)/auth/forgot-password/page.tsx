import type { Metadata } from "next";
import { AuthDeskScene } from "@/components/AuthDeskScene";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { quietFormSurface } from "@/components/ui/semantic";
import styles from "@/components/AuthDeskPanel.module.css";

export const metadata: Metadata = {
  title: "Reset your password — Learn in Curve",
};

export default function ForgotPasswordPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center overflow-x-clip px-5 py-6 sm:px-8 sm:py-8">
      <div className="relative w-full max-w-[22rem]">
        <AuthDeskScene />
        <div className={`${quietFormSurface} ${styles.panel} relative overflow-hidden`}>
          <div className={styles.intro}>
            <h1>
              Forgot your <span className="text-orange">password</span>?
            </h1>
            <p>Enter your email and we&apos;ll send you a reset link.</p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
