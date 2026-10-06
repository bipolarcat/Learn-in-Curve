/**
 * Receipt + access email after a successful PFQ purchase.
 *
 * Thin wrapper over the shared receipt template (same email PMQ buyers get),
 * so both products send one consistent receipt. Never throws.
 *
 * Under the Consumer Contracts Regulations, the buyer loses the 14-day
 * cancellation right only if they consent at checkout AND receive confirmation
 * of that acknowledgement in a durable medium. This email is that confirmation.
 */

import {
  PURCHASE_CANCELLATION_ACK,
  sendPurchaseReceipt,
} from "@/lib/notify/send-purchase-receipt";
import { PFQ_LEARN_HREF } from "@/lib/pfq/constants";

type SendPfqPurchaseEmailInput = {
  email: string;
  amountCents: number;
  paymentId: string;
  /** Tier bought: "pro" or "ai_pro". Defaults to "pro". */
  feature?: string;
  /** Unix seconds (Stripe event.created). */
  purchasedAt?: number;
  currency?: string;
  origin?: string;
};

/** Kept for any caller that referenced the PFQ-specific wording. */
export const PFQ_PURCHASE_CANCELLATION_ACK = PURCHASE_CANCELLATION_ACK;

const PFQ_RECEIPT_PRODUCT: Record<string, string> = {
  pro: "PFQ in 2 Days: Pro Bundle",
  ai_pro: "PFQ in 2 Days: AI Pro Bundle",
};

export async function sendPfqPurchaseEmail(
  input: SendPfqPurchaseEmailInput,
): Promise<boolean> {
  return sendPurchaseReceipt({
    email: input.email,
    productName:
      PFQ_RECEIPT_PRODUCT[input.feature ?? "pro"] ?? PFQ_RECEIPT_PRODUCT.pro,
    amountCents: input.amountCents,
    currency: input.currency,
    paymentId: input.paymentId,
    purchasedAt: input.purchasedAt,
    kind: "unlock",
    accessPath: PFQ_LEARN_HREF,
    origin: input.origin,
  });
}
