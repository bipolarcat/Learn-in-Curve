/**
 * PFQ course constants. Starter is the absence of an entitlement — never stored.
 */

export const PFQ_COURSE_ID = "f8a2c1e0-4d3b-4a9e-9c7f-2e1d0b9a8c7d";
export const PFQ_SLUG = "pfq-in-2-days";

/** £5.00 — single price, no tiers. Keep in sync with pricing page copy. */
export const PFQ_PRO_PRICE_CENTS = 500;

export const PFQ_PRICING_HREF = "/pfq/pricing";
export const PFQ_LEARN_HREF = "/pfq/learn";
export const PFQ_MOCK_HREF = "/pfq/mock";
export const PFQ_PRACTICE_HREF = "/pfq/practice";

/**
 * Practice runner feature flag. Commerce gating (Pro) is separate via
 * requirePfqPro. Flip false to hide practice routes while the bank is empty.
 */
export const PFQ_PRACTICE_ENABLED = true;

export const PFQ_PRO_INTENT_PARAM = "intent";
export const PFQ_PRO_INTENT_VALUE = "pro";
export const PFQ_PRICING_PRO_INTENT_HREF = `${PFQ_PRICING_HREF}?${PFQ_PRO_INTENT_PARAM}=${PFQ_PRO_INTENT_VALUE}`;

/**
 * Stripe Checkout for PFQ stays behind this flag until Sim confirms the
 * Consumer Contracts waiver wording has been reviewed. Build and test against
 * Stripe test keys with this flipped true locally; leave false in production
 * until that sign-off.
 */
export const PFQ_CHECKOUT_ENABLED = false;

export function hasPfqProIntent(nextPath: string | null | undefined): boolean {
  if (typeof nextPath !== "string") return false;
  const [path, query = ""] = nextPath.split("?");
  if (path !== PFQ_PRICING_HREF) return false;
  return (
    new URLSearchParams(query).get(PFQ_PRO_INTENT_PARAM) ===
    PFQ_PRO_INTENT_VALUE
  );
}

export function formatPfqPriceGbp(
  cents: number = PFQ_PRO_PRICE_CENTS,
): string {
  return `£${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
