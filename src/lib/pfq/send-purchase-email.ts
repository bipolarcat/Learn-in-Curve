/**
 * Receipt + access email after a successful PFQ purchase.
 * Same Resend fetch pattern as notify confirmation — never throws.
 */

import { notifyFrom } from "@/lib/notify/senders";
import { formatPfqPriceGbp, PFQ_LEARN_HREF } from "@/lib/pfq/constants";

type SendPfqPurchaseEmailInput = {
  email: string;
  amountCents: number;
  paymentId: string;
  origin?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPfqPurchaseEmail(
  input: SendPfqPurchaseEmailInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[pfq] purchase email NOT sent to ${input.email} — RESEND_API_KEY missing. Payment ${input.paymentId} still needs access confirmed in DB.`,
    );
    return false;
  }

  const origin =
    input.origin?.replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    "https://www.learnincurve.com";
  const learnUrl = `${origin}${PFQ_LEARN_HREF}`;
  const price = formatPfqPriceGbp(input.amountCents);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: notifyFrom(),
        to: [input.email],
        subject: "Your PFQ in 2 Days access",
        html: `<!DOCTYPE html><html><body style="font-family:Figtree,system-ui,sans-serif;color:#241A12;background:#F4E9D6;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#FBF3E1;border:1px solid rgba(36,26,18,0.12);border-radius:12px;padding:24px;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;">Learn in <span style="color:#D5501F;">Curve</span></p>
    <h1 style="margin:0 0 12px;font-family:Fraunces,Georgia,serif;font-size:22px;">You're in</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.5;">Thanks for buying <strong>PFQ in 2 Days</strong> (${escapeHtml(price)}, one-off). Your Pro access is ready.</p>
    <p style="margin:0 0 16px;"><a href="${escapeHtml(learnUrl)}" style="display:inline-block;background:#D5501F;color:#FBF3E1;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;">Open the course</a></p>
    <p style="margin:0;font-size:12px;line-height:1.45;color:rgba(36,26,18,0.55);">Receipt reference: ${escapeHtml(input.paymentId)}. The APM exam is booked and paid separately with APM — this course prepares you for it.</p>
  </div>
</body></html>`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[pfq] purchase email Resend error", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[pfq] purchase email failed", err);
    return false;
  }
}
