/**
 * PFQ course constants. Starter is the absence of an entitlement — never stored.
 *
 * Price / id / slug come from `src/lib/courses/registry.ts` — do not restate them.
 */

import {
  PFQ_COURSE_ID as REGISTRY_PFQ_COURSE_ID,
  PFQ_PRO_PRICE_CENTS as REGISTRY_PFQ_PRO_PRICE_CENTS,
  PFQ_SLUG as REGISTRY_PFQ_SLUG,
} from "../courses/registry-data.ts";

export const PFQ_COURSE_ID = REGISTRY_PFQ_COURSE_ID;
export const PFQ_SLUG = REGISTRY_PFQ_SLUG;

/** Pro Bundle price. Defined once in the course registry. AI Pro is waitlist-only. */
export const PFQ_PRO_PRICE_CENTS = REGISTRY_PFQ_PRO_PRICE_CENTS;

export const PFQ_PRICING_HREF = "/pfq/pricing";
export const PFQ_LEARN_HREF = "/pfq/learn";
export const PFQ_MOCK_HREF = "/pfq/mock";
export const PFQ_PRACTICE_HREF = "/pfq/practice";
export const PFQ_TRAP_SCHOOL_HREF = "/pfq/trap-school";

/**
 * Practice runner feature flag. Commerce gating (Pro) is separate via
 * requirePfqPro. Flip false to hide practice routes while the bank is empty.
 */
export const PFQ_PRACTICE_ENABLED = true;

/**
 * Lesson content flag. Pro gate is separate (canAccessPfqLessons). Flip false
 * to hide /pfq/learn/* lesson map + objective pages while content is dark.
 */
export const PFQ_LESSONS_ENABLED = true;

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
