/**
 * Receipt + access email after a successful purchase (PMQ and PFQ, all tiers,
 * plus Sly top-ups). One template for every product. Never throws.
 *
 * Under the Consumer Contracts Regulations 2013, the buyer loses the 14-day
 * cancellation right for digital content only if they consent at checkout AND
 * the trader confirms that acknowledgement in a durable medium. This email is
 * that confirmation.
 */

import { notifyFrom } from "@/lib/notify/senders";
import { SUPPORT_EMAIL } from "@/lib/notify/business-details";

/** Access period for a Paid Unlock bought on or after 6 October 2026 (Terms §6). */
export const PAID_UNLOCK_ACCESS_MONTHS = 12;

export type PurchaseReceiptInput = {
  email: string;
  /** Line shown on the receipt, e.g. "PMQ in 5 Days: Pro Bundle". */
  productName: string;
  /** "unlock" = course access (shows the access period). */
  kind: "unlock" | "topup";
  amountCents: number;
  currency?: string;
  paymentId: string;
  /** Unix seconds (Stripe event.created). Defaults to now. */
  purchasedAt?: number;
  /** Site-relative or absolute link to start using what was bought. */
  accessPath: string;
  accessLabel?: string;
  origin?: string;
};

/** Wording aligned with the checkout checkbox (DIGITAL_CONTENT_CONSENT). */
export const PURCHASE_CANCELLATION_ACK =
  "When you ticked the box at checkout, you asked for access straight away and acknowledged that, once access begins, you lose the standard 14-day right to cancel this digital content. Your statutory rights still apply if the content is faulty or not as described. This email confirms that acknowledgement.";

/**
 * Human-friendly receipt number derived from the Stripe payment ID, e.g.
 * pi_3Q8x...AbC9xYz2 -> LIC-ABC9-XYZ2. Deterministic, so Stripe retries show
 * the same number. Not sequential on purpose: it doesn't reveal sales volume.
 * The full Stripe reference stays in small print for lookups.
 */
export function receiptNumber(paymentId: string): string {
  const tail = paymentId.replace(/[^A-Za-z0-9]/g, "").slice(-8).toUpperCase();
  return `LIC-${tail.slice(0, 4)}-${tail.slice(4)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function absolute(origin: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function sendPurchaseReceipt(
  input: PurchaseReceiptInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[receipt] purchase receipt NOT sent to ${input.email}: RESEND_API_KEY missing. Payment ${input.paymentId}.`,
    );
    return false;
  }

  const origin =
    input.origin?.replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    "https://www.learnincurve.com";
  const accessUrl = absolute(origin, input.accessPath);
  const accessLabel = input.accessLabel ?? "Open the course";
  const amount = formatMoney(input.amountCents, input.currency ?? "gbp");
  const purchased = new Date(
    (input.purchasedAt ?? Math.floor(Date.now() / 1000)) * 1000,
  );
  const date = formatDate(purchased);
  const ref = receiptNumber(input.paymentId);
  const isUnlock = input.kind === "unlock";

  let accessUntil: string | undefined;
  if (isUnlock) {
    const end = new Date(purchased);
    end.setMonth(end.getMonth() + PAID_UNLOCK_ACCESS_MONTHS);
    accessUntil = formatDate(end);
  }


  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;font-size:13px;color:rgba(36,26,18,0.65);">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:13px;text-align:right;font-weight:600;">${escapeHtml(value)}</td></tr>`;

  const small = "margin:0 0 12px;font-size:13px;line-height:1.5;color:rgba(36,26,18,0.75);";
  const tiny = "margin:0 0 8px;font-size:12px;line-height:1.45;color:rgba(36,26,18,0.55);";

  const html = `<!DOCTYPE html><html><body style="font-family:Figtree,system-ui,sans-serif;color:#241A12;background:#F4E9D6;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#FBF3E1;border:1px solid rgba(36,26,18,0.12);border-radius:12px;padding:24px;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;">Learn in <span style="color:#D5501F;">Curve</span></p>
    <h1 style="margin:0 0 12px;font-family:Fraunces,Georgia,serif;font-size:22px;">Payment received, you're in</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Thanks for your purchase. Your access is ready now.</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;border-top:1px solid rgba(36,26,18,0.12);border-bottom:1px solid rgba(36,26,18,0.12);margin:0 0 16px;">
      ${row("Receipt number", ref)}
      ${row("Item", input.productName)}
      ${row("Amount paid", `${amount} (one-off)`)}
      ${row("Date", date)}
      ${accessUntil ? row("Access", `12 months, until ${accessUntil}`) : ""}
    </table>
    <p style="margin:0 0 16px;"><a href="${escapeHtml(accessUrl)}" style="display:inline-block;background:#D5501F;color:#FBF3E1;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;">${escapeHtml(accessLabel)}</a></p>
    <p style="${small}">${escapeHtml(PURCHASE_CANCELLATION_ACK)}</p>
    <p style="${tiny}">Keep this email as your receipt. Questions about your purchase? Reply to this email or write to ${escapeHtml(SUPPORT_EMAIL)}. The APM exam is booked and paid separately with APM; this course prepares you for it.</p>
    <p style="margin:0;font-size:11px;line-height:1.45;color:rgba(36,26,18,0.45);">Payment reference: ${escapeHtml(input.paymentId)}</p>
  </div>
</body></html>`;

  const text = [
    "Payment received, you're in",
    "",
    "Thanks for your purchase. Your access is ready now.",
    "",
    `Receipt number: ${ref}`,
    `Item: ${input.productName}`,
    `Amount paid: ${amount} (one-off)`,
    `Date: ${date}`,
    ...(accessUntil ? [`Access: 12 months, until ${accessUntil}`] : []),
    "",
    `${accessLabel}: ${accessUrl}`,
    "",
    PURCHASE_CANCELLATION_ACK,
    "",
    `Keep this email as your receipt. Questions about your purchase? Reply to this email or write to ${SUPPORT_EMAIL}. The APM exam is booked and paid separately with APM; this course prepares you for it.`,
    "",
    `Payment reference: ${input.paymentId}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Stripe retries the webhook; same payment => same key => Resend
        // sends at most once per payment within its 24h idempotency window.
        "Idempotency-Key": `receipt-${input.paymentId}`,
      },
      body: JSON.stringify({
        from: notifyFrom(),
        to: [input.email],
        reply_to: SUPPORT_EMAIL,
        subject: `Your receipt: ${input.productName}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[receipt] Resend error", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[receipt] send failed", err);
    return false;
  }
}
