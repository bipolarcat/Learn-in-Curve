import type { Metadata } from "next";
import { AuthDeskScene } from "@/components/AuthDeskScene";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { quietFormSurface } from "@/components/ui/semantic";
import styles from "@/components/AuthDeskPanel.module.css";

export const metadata: Metadata = {
  title: "Set a new password — Learn in Curve",
};

export default function ResetPasswordPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] flex-col items-center justify-center overflow-x-clip px-5 py-6 sm:px-8 sm:py-8">
      <div className="relative w-full max-w-[22rem]">
        <AuthDeskScene />
        <div className={`${quietFormSurface} ${styles.panel} relative overflow-hidden`}>
          <div className={styles.intro}>
            <h1>
              Set a new <span className="text-orange">password</span>
            </h1>
            <p>Choose a new password for your account.</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </section>
  );
}
