/**
 * Sends a feedback submission (from the site-wide feedback modal, see
 * FeedbackModal.tsx) to Sim's inbox via Resend.
 *
 * Same fetch-the-REST-API-directly pattern as send-confirmation-email.ts and
 * guest-budget-alert.ts — no new npm dependency, just RESEND_API_KEY.
 * Never throws: a failed send should surface as a 500 to the client (so the
 * user knows to retry / email directly) but must not crash the route.
 */

const FEEDBACK_TO = "simsamaarshened@gmail.com";
// Resend's shared test/onboarding sender — no domain setup needed. Fine for
// a single internal recipient; swap to a verified domain sender if this
// starts fanning out to more than one inbox.
const FEEDBACK_FROM = "Learn in Curve feedback <onboarding@resend.dev>";

export type FeedbackEmailInput = {
  message: string;
  /** Submitter's email — either their signed-in account email (server-verified) or the one they typed in. */
  email: string;
  /** True when `email` came from a verified session, not a free-text field. */
  emailIsVerified: boolean;
  /** Which surface the button was clicked from, e.g. "Footer", "Sly tutor panel". */
  source: string;
  /** Page the feedback was submitted from, for context. */
  pageUrl: string;
};

/**
 * Returns true only if Resend confirmed the send.
 */
export async function sendFeedbackEmail(
  input: FeedbackEmailInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(
      `[feedback] NOT sent — RESEND_API_KEY is not configured. From ${input.email} via "${input.source}": ${input.message}`,
    );
    return false;
  }

  const body = {
    from: FEEDBACK_FROM,
    to: [FEEDBACK_TO],
    // Reply-to the submitter directly so replying from Gmail just works.
    reply_to: input.email,
    subject: `LIC feedback — ${input.source}`,
    text: [
      input.message,
      "",
      "---",
      `From: ${input.email}${input.emailIsVerified ? " (signed in)" : " (typed, unverified)"}`,
      `Source: ${input.source}`,
      `Page: ${input.pageUrl}`,
    ].join("\n"),
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`[feedback] send failed (${res.status}): ${errBody}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      "[feedback] send threw:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
