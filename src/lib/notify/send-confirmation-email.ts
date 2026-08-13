/**
 * Sends a branded confirmation email when someone joins one of the lists in
 * `src/lib/notify/lists.ts`.
 *
 * Calls Resend's REST API directly via fetch (same pattern as
 * src/lib/tutor/guest-budget-alert.ts) — no new npm dependency. Requires
 * RESEND_API_KEY. If it's missing, logs loudly and returns false without
 * throwing: a missing confirmation email must never fail the signup itself,
 * since the row is already saved by the time this is called.
 */

import { isInternalEmail } from "@/lib/email/internal";
import { getNotifyList, type NotifyList } from "@/lib/notify/lists";
import { notifyFrom } from "@/lib/notify/senders";

type SendNotifyConfirmationInput = {
  email: string;
  /** A `key` from NOTIFY_LISTS. Unknown keys fall back to the newsletter copy. */
  listKey: string;
  /** Opaque per-subscriber token used to build the unsubscribe link. */
  unsubscribeToken: string;
  /** Origin of the request (e.g. https://learnincurve.com) for absolute URLs. */
  origin: string;
};

// Fraunces is the site's actual display/logo font (next/font/google in
// layout.tsx, --font-fraunces). Email clients that block web fonts (mainly
// Outlook desktop) silently fall back to Georgia — same fallback the site
// itself uses in `fontFamily.display`.
const DISPLAY_FONT_STACK = "'Fraunces', Georgia, 'Times New Roman', serif";

/** Reserved height for the list illustration, in px. */
const ILLUSTRATION_HEIGHT = 140;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The illustration slot.
 *
 * Renders the artwork when `illustrationUrl` is set, and an empty block of the
 * SAME height when it isn't. Reserving the space matters: email clients can't be
 * re-tested cheaply, so dropping artwork in later must not reflow the layout or
 * change how the message reads. It also avoids the broken-image icon that an
 * empty `src` produces in Outlook and Gmail.
 */
function renderIllustration(list: NotifyList): string {
  if (!list.illustrationUrl) {
    return `<div style="height:${ILLUSTRATION_HEIGHT}px;line-height:${ILLUSTRATION_HEIGHT}px;font-size:0;">&nbsp;</div>`;
  }

  return `<img
    src="${escapeHtml(list.illustrationUrl)}"
    alt="${escapeHtml(list.illustrationAlt)}"
    height="${ILLUSTRATION_HEIGHT}"
    style="display:block;margin:0 auto;height:${ILLUSTRATION_HEIGHT}px;max-width:100%;border:0;outline:none;text-decoration:none;border-radius:12px;"
  />`;
}

function renderHtml(input: SendNotifyConfirmationInput, list: NotifyList): string {
  const unsubscribeUrl = `${input.origin}/unsubscribe?token=${input.unsubscribeToken}`;

  const bodyHtml = list.body
    .map(
      (paragraph, index) =>
        `<p style="margin:${index === 0 ? "0" : "10px 0 0 0"};font-size:15px;line-height:1.6;color:#241A12cc;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta name="color-scheme" content="light" />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background-color:#FBF3E1;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FBF3E1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#FBF3E1;border-radius:16px;border:1px solid rgba(36,26,18,0.08);overflow:hidden;">
            <!-- ILLUSTRATION SLOT — artwork per list, from lists.ts -->
            <tr>
              <td style="padding:24px 32px 0 32px;text-align:center;">
                ${renderIllustration(list)}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px 32px;text-align:center;">
                <h1 style="margin:0;font-family:${DISPLAY_FONT_STACK};font-size:22px;line-height:1.3;color:#241A12;">${escapeHtml(list.heading)}</h1>
                <div style="margin:12px 0 0 0;">
                  ${bodyHtml}
                </div>
                <p style="margin:18px 0 0 0;font-size:15px;line-height:1.6;color:#241A12cc;">
                  All the best,<br />Sim Samaar Shened
                </p>
              </td>
            </tr>
          </table>
          <p style="max-width:480px;margin:16px auto 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#241A1299;">
            You're receiving this because you asked to be notified at ${escapeHtml(input.email)}.
            <a href="${unsubscribeUrl}" style="color:#241A1299;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Returns true only if Resend confirmed the send. Never throws — a failed or
 * skipped confirmation email must not break the calling flow, but /api/notify
 * uses the result to decide whether to stamp `confirmation_sent_at`, so it must
 * not report "sent" unconditionally.
 */
export async function sendNotifyConfirmationEmail(
  input: SendNotifyConfirmationInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = notifyFrom();

  if (isInternalEmail(input.email)) {
    return false;
  }

  const list = getNotifyList(input.listKey);
  if (!list) {
    console.error(
      `[notify] no list registered for "${input.listKey}" — email not sent to ${input.email}. The signup row was still saved.`,
    );
    return false;
  }

  if (!apiKey) {
    console.error(
      `[notify] confirmation email NOT sent to ${input.email} — RESEND_API_KEY is not configured. ` +
        "The signup row was still saved.",
    );
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.email],
        subject: list.subject,
        html: renderHtml(input, list),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(
        `[notify] confirmation email failed (${res.status}) for ${input.email}: ${errBody}`,
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      `[notify] confirmation email threw for ${input.email}:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
