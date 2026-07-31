/**
 * Sends a submission from the /contact page form to Sim's inbox
 * via Resend. Same fetch-the-REST-API-directly pattern as
 * send-feedback-email.ts / send-confirmation-email.ts — no new npm
 * dependency, just RESEND_API_KEY. Never throws.
 */

const CONTACT_TO = "simsamaarshened@gmail.com";
const CONTACT_FROM = "Learn in Curve contact <onboarding@resend.dev>";

export type ContactEmailInput = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

/** Returns true only if Resend confirmed the send. */
export async function sendContactEmail(
  input: ContactEmailInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(
      `[contact] NOT sent — RESEND_API_KEY is not configured. From ${input.email}: ${input.message}`,
    );
    return false;
  }

  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ");

  const body = {
    from: CONTACT_FROM,
    to: [CONTACT_TO],
    // Reply-to the submitter directly so replying from Gmail just works.
    reply_to: input.email,
    subject: `LIC contact form — ${input.subject}`,
    text: [
      input.message,
      "",
      "---",
      `From: ${fullName} <${input.email}>`,
      `Subject given: ${input.subject}`,
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
      console.error(`[contact] send failed (${res.status}): ${errBody}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      "[contact] send threw:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
