/**
 * Ops alert when a Stripe checkout grant succeeds.
 * Same channel as /api/admin/new-user sign-up alerts.
 */

import { sendAdminNotification } from "@/lib/admin/send-admin-notification";
import { isInternalEmail } from "@/lib/email/internal";

function formatGbp(cents: number, currency: string): string {
  const code = (currency || "gbp").toUpperCase();
  const amount = (Math.max(0, cents) / 100).toFixed(2);
  if (code === "GBP") return `£${amount}`;
  return `${amount} ${code}`;
}

export type AdminPurchaseNotifyInput = {
  email: string | null | undefined;
  productName: string;
  amountCents: number;
  currency?: string | null;
  paymentId: string;
  purchasedAt: number;
  courseId?: string | null;
  feature?: string | null;
};

/**
 * Fire-and-forget admin email. Never throws; never blocks the Stripe webhook.
 * Skips founder/test addresses so self-checkouts do not look like real sales.
 */
export function notifyAdminOfPurchase(input: AdminPurchaseNotifyInput): void {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email || isInternalEmail(email)) return;

  const londonTime = new Date(input.purchasedAt * 1000).toLocaleString(
    "en-GB",
    {
      timeZone: "Europe/London",
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  const rows: { label: string; value: string }[] = [
    { label: "Email", value: email },
    { label: "Product", value: input.productName },
  ];
  if (input.courseId) {
    rows.push({ label: "Course", value: input.courseId });
  }
  if (input.feature) {
    rows.push({ label: "Tier", value: input.feature });
  }
  rows.push(
    {
      label: "Amount",
      value: formatGbp(input.amountCents, input.currency ?? "gbp"),
    },
    { label: "Payment", value: input.paymentId },
    { label: "Purchased", value: `${londonTime} (London)` },
  );

  void sendAdminNotification({
    subject: `💳 New purchase: ${input.productName}`,
    title: "💳 New purchase",
    rows,
  }).catch((err) => {
    console.error("[admin-purchase-notify] failed", err);
  });
}
