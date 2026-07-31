import { AuthDeskScene } from "@/components/AuthDeskScene";
import { AuthForm } from "@/components/AuthForm";
import { quietFormSurface } from "@/components/ui/semantic";
import styles from "@/components/AuthDeskPanel.module.css";

type AuthDeskPanelProps = {
  mode: "sign-in" | "sign-up";
  nextPath: string;
  /**
   * True when the user broke off mid-purchase of the Pro Bundle. Same card,
   * different words — it should read as a step in checkout, not a wall that
   * appeared out of nowhere. Checkout resumes on its own once they land back.
   */
  proIntent?: boolean;
  className?: string;
};

/**
 * Compact auth card with Sly fox animation above.
 * Shared by `/auth/sign-in`, `/auth/sign-up`, and PMQ preview “Start Free”.
 */
export function AuthDeskPanel({
  mode,
  nextPath,
  proIntent = false,
  className = "",
}: AuthDeskPanelProps) {
  return (
    <div className={`relative w-full max-w-[22rem] ${className}`.trim()}>
      <AuthDeskScene />
      <div
        className={`${quietFormSurface} ${styles.panel} relative overflow-hidden`}
      >
        <div className={styles.intro}>
          <h1>
            {proIntent ? (
              <>
                Almost <span className="text-orange">there</span>
              </>
            ) : mode === "sign-in" ? (
              <>
                Welcome <span className="text-orange">back</span>
              </>
            ) : (
              <>
                Start learning for{" "}
                <span className="text-orange">free</span>
              </>
            )}
          </h1>
          {proIntent ? (
            <p>
              {mode === "sign-in"
                ? "Sign in and we'll take you straight to checkout."
                : "Create your account and we'll take you straight to checkout."}
            </p>
          ) : mode === "sign-in" ? (
            <p>Pick up where you left off.</p>
          ) : (
            <p>Upgrade anytime after.</p>
          )}
        </div>
        <AuthForm mode={mode} variant="saas" nextPath={nextPath} />
        {proIntent ? (
          <p className="mt-3 text-center text-[11.5px] leading-snug text-ink/45">
            You won&apos;t be charged until you confirm on the payment page.
          </p>
        ) : null}
      </div>
    </div>
  );
}
