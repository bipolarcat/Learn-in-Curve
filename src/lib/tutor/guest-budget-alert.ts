/**
 * Fires once, the moment the global guest Sly spend cap is crossed
 * (see record_guest_tutor_spend in the guest_tutor_budget migration —
 * that function guarantees this only gets called for the single request
 * that pushes the total over the cap, not every message after).
 *
 * Uses Resend's REST API directly via fetch — no new npm dependency.
 * Requires RESEND_API_KEY. If it's missing, logs loudly and returns
 * without throwing: a missing alert email should never break the guest
 * chat reply that's already been generated and billed for.
 */

const ALERT_TO = "simsamaarshened@gmail.com";
// Resend's shared test/onboarding sender — works with zero domain setup,
// fine for a single internal alert recipient. Swap to a verified domain
// sender later if this needs to go to more than one inbox.
const ALERT_FROM = "Learn in Curve alerts <onboarding@resend.dev>";

export async function sendGuestBudgetAlertEmail(
  totalGbpCents: number,
  capGbpCents: number,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  const totalGbp = (totalGbpCents / 100).toFixed(2);
  const capGbp = (capGbpCents / 100).toFixed(2);

  if (!apiKey) {
    console.error(
      `GUEST SLY BUDGET CAP CROSSED (£${totalGbp} / £${capGbp}) but ` +
        "RESEND_API_KEY is not configured — no alert email was sent. " +
        "Guest chat is still ENABLED (does not auto-disable). Check " +
        "Supabase guest_tutor_budget manually.",
    );
    return;
  }

  const body = {
    from: ALERT_FROM,
    to: [ALERT_TO],
    subject: `Guest Sly budget cap hit — £${totalGbp} spent`,
    text: [
      `Homepage guest Sly trial has crossed its £${capGbp} spend cap.`,
      `Total spent so far: £${totalGbp}.`,
      "",
      "Guest chat is still ENABLED right now — it does not auto-disable.",
      "",
      "To stop it immediately, run in the Supabase SQL editor:",
      "  update public.guest_tutor_budget set enabled = false where id = 1;",
      "",
      "To reset the counter after investigating (this does NOT re-enable it):",
      "  update public.guest_tutor_budget",
      "     set total_gbp_cents = 0, notified = false, last_reset_at = now()",
      "   where id = 1;",
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
      console.error(
        `guest tutor budget alert email failed (${res.status}): ${errBody}`,
      );
    }
  } catch (err) {
    console.error(
      "guest tutor budget alert email threw:",
      err instanceof Error ? err.message : err,
    );
  }
}
