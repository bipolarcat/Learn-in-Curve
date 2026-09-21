import type { ReactNode } from "react";
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
  /**
   * Optional course name above the card title (e.g. “PFQ in 2 Days”).
   * Renders as the page h1; the main title drops to h2.
   */
  courseTitle?: ReactNode;
  /**
   * Override the default card title. Used with `courseTitle` on course previews.
   */
  title?: ReactNode;
  /** Hide the lead line under the title (e.g. “Upgrade anytime after.”). */
  hideLead?: boolean;
  /**
   * Heading level for the card's title when there is no `courseTitle`.
   *
   * Defaults to 1 because on `/auth/sign-in` and `/auth/sign-up` this card IS
   * the page — "Welcome back" is the document title. When `courseTitle` is set,
   * that is the h1 and this title is always an h2.
   */
  headingLevel?: 1 | 2;
  /**
   * Failure copy from a `?error=` param — a dead confirmation link or a failed
   * OAuth exchange. Passed straight through to AuthForm's message slot so the
   * card has one error location, not two. See src/lib/auth-errors.ts, LIC-120.
   */
  initialError?: string | null;
  className?: string;
};

/**
 * Compact auth card with Sly fox animation above.
 * Shared by `/auth/sign-in`, `/auth/sign-up`, and course preview “Start Free”.
 */
export function AuthDeskPanel({
  mode,
  nextPath,
  proIntent = false,
  courseTitle,
  title,
  hideLead = false,
  headingLevel = 1,
  initialError = null,
  className = "",
}: AuthDeskPanelProps) {
  const TitleTag = courseTitle || headingLevel === 2 ? "h2" : "h1";

  const defaultTitle = proIntent ? (
    <>
      Almost <span className="text-orange">there</span>
    </>
  ) : mode === "sign-in" ? (
    <>
      Welcome <span className="text-orange">back</span>
    </>
  ) : (
    <>
      Start learning for <span className="text-orange">free</span>
    </>
  );

  const lead = hideLead
    ? null
    : proIntent ? (
        <p>
          {mode === "sign-in"
            ? "Sign in and we'll take you straight to checkout."
            : "Create your account and we'll take you straight to checkout."}
        </p>
      ) : mode === "sign-in" ? (
        <p>Pick up where you left off.</p>
      ) : (
        <p>Upgrade anytime after.</p>
      );

  return (
    <div className={`relative w-full max-w-[22rem] ${className}`.trim()}>
      <AuthDeskScene />
      <div
        className={`${quietFormSurface} ${styles.panel} relative overflow-hidden`}
      >
        <div className={styles.intro}>
          {courseTitle ? (
            <h1 className={styles.courseTitle}>{courseTitle}</h1>
          ) : null}
          <TitleTag>{title ?? defaultTitle}</TitleTag>
          {lead}
        </div>
        <AuthForm
          mode={mode}
          variant="saas"
          nextPath={nextPath}
          initialError={initialError}
        />
        {proIntent ? (
          <p className="mt-3 text-center text-[11.5px] leading-snug text-ink/45">
            You won&apos;t be charged until you confirm on the payment page.
          </p>
        ) : null}
      </div>
    </div>
  );
}
